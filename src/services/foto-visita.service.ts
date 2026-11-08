import { Platform } from 'react-native';
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
  if (Platform.OS === 'web') {
    if (!foto.file) throw new Error('No pudimos leer la foto.');
    formulario.append('archivo', foto.file);
  } else {
    const extension = tipo === 'image/png' ? 'png' : tipo === 'image/webp' ? 'webp' : 'jpg';
    formulario.append('archivo', { uri: foto.uri, name: `recuerdo.${extension}`, type: tipo } as unknown as Blob);
  }
  const subida = z.object({ datos: z.object({ url: z.string(), tipo: z.literal('imagen') }), meta: z.null() })
    .parse(await solicitarJson('/archivos', { metodo: 'POST', token, cuerpo: formulario }));
  if (await obtenerToken() !== token) throw new Error('La cuenta cambió mientras se guardaba la foto.');

  return subida.datos.url;
}
