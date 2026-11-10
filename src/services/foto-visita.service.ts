import { Directory, File, Paths } from 'expo-file-system';
import type { Visita } from '../types/Visita';
import type { ImagePickerAsset } from 'expo-image-picker';
import { z } from 'zod';
import { obtenerToken } from './storage.service';
import { solicitarJson } from './api/http';

export async function subirFotoVisita(foto: ImagePickerAsset, usuarioId: string) {
  const token = await obtenerToken();
  if (!token) throw new Error('Iniciá sesión para guardar tu foto.');
  const yo = z.object({ datos: z.object({ id: z.string() }) }).parse(await solicitarJson('/yo', { token }));
  if (yo.datos.id !== usuarioId) throw new Error('La cuenta cambió. Volvé a ingresar.');
  const tipo = foto.mimeType ?? 'image/jpeg';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(tipo)) throw new Error('Elegí una foto JPG, PNG o WEBP.');
  if (foto.fileSize && foto.fileSize > 5 * 1024 * 1024) throw new Error('La foto puede pesar hasta 5 MB.');
  const formulario = new FormData();

  const extension = tipo === 'image/png' ? 'png' : tipo === 'image/webp' ? 'webp' : 'jpg';
  formulario.append('archivo', { uri: foto.uri, name: `recuerdo.${extension}`, type: tipo } as unknown as Blob);

  const subida = z.object({ datos: z.object({ url: z.string(), tipo: z.literal('imagen') }), meta: z.null() })
    .parse(await solicitarJson('/archivos', { metodo: 'POST', token, cuerpo: formulario }));
  if (await obtenerToken() !== token) throw new Error('La cuenta cambió mientras se guardaba la foto.');

  return subida.datos.url;
}

// Copiar al directorio de documentos evita perder la foto cuando se limpie la caché del selector.
export async function guardarFotoVisitaLocal(foto: ImagePickerAsset, usuarioId: string): Promise<string> {

  const tipo = foto.mimeType ?? 'image/jpeg';
  const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[tipo];
  if (!extension) throw new Error('Elegí una foto JPG, PNG o WEBP.');
  const origen = new File(foto.uri);
  if (!origen.exists || origen.size <= 0 || origen.size > 5 * 1024 * 1024) throw new Error('La foto debe existir y pesar hasta 5 MB.');
  const carpeta = new Directory(Paths.document, 'fotos-visitas');
  carpeta.create({ idempotent: true, intermediates: true });
  const destino = new File(carpeta, `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);
  origen.copy(destino);
  return destino.uri;
}

export async function prepararFotoVisita(visita: Visita): Promise<Visita> {
  if (!visita.fotoUri?.startsWith('file://')) return visita;
  const mimeType = visita.fotoUri.endsWith('.png') ? 'image/png' : visita.fotoUri.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const fotoUri = await subirFotoVisita({ uri: visita.fotoUri, width: 0, height: 0, mimeType }, visita.usuarioId);
  return { ...visita, fotoUri };
}
