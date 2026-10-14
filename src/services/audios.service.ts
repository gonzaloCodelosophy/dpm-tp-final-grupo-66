import { Directory, File, Paths } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { leerAudioLocal, guardarAudioLocal } from '../data/repositories/audios.repository';
const pendientes = new Map<string, Promise<string>>();
const listeners = new Set<(url: string) => void>();

export function observarAudios(listener: (url: string) => void) {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function directorio() {

  return new Directory(Paths.document, 'audioguias');
}

export function urlAudioRemoto(url: string): string {

  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (url.startsWith('/') && base) return `${base}${url}`;
  return url;
}

export async function obtenerAudioLocal(url: string): Promise<string | null> {

  const registro = await leerAudioLocal(url);
  if (!registro) return null;
  const archivo = new File(directorio(), registro.nombreArchivo);
  return archivo.exists && archivo.size > 0 ? archivo.uri : null;
}

export function descargarAudio(url: string): Promise<string> {

  const previa = pendientes.get(url);
  if (previa) return previa;

  const tarea = Promise.resolve().then(async () => {
    const existente = await obtenerAudioLocal(url);
    if (existente) return existente;
    const carpeta = directorio();
    carpeta.create({ idempotent: true, intermediates: true });
    const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const temporal = new File(carpeta, `${nombre}.parcial`);
    let definitivo: File | null = null;
    const controller = new AbortController();

    const tiempo = setTimeout(() => controller.abort(), 15000);

    try {
      const respuesta = await fetch(urlAudioRemoto(url), { signal: controller.signal });
      if (!respuesta.ok || !respuesta.headers.get('content-type')?.toLowerCase().startsWith('audio/')) throw new Error('El servidor no devolvió un audio válido.');
      const extension = 'mp3';
      const nombreArchivo = `${nombre}.${extension}`;
      definitivo = new File(carpeta, nombreArchivo);
      const bytes = await respuesta.bytes();
      if (!bytes.length) throw new Error('El audio descargado está vacío.');
      temporal.create();
      temporal.write(bytes);
      temporal.move(definitivo);
      await guardarAudioLocal({ url, nombreArchivo, descargadoEn: new Date().toISOString() });
      for (const listener of listeners) {
        try {
          listener(url);
        } catch (error) {
          console.error(error);
        }
      }
      return definitivo.uri;
    } catch (error) {
      if (temporal.exists) temporal.delete();
      if (definitivo?.exists) definitivo.delete();
      throw error;
    } finally {
      clearTimeout(tiempo);
    }
  }).finally(() => {
    pendientes.delete(url);
  });

  pendientes.set(url, tarea);
  return tarea;
}

// Descargar el conjunto completo tras guardar datos, sin bloquear el catálogo textual.
export async function precargarAudios(urls: string[]): Promise<void> {

  const cola = [...new Set(urls.filter(Boolean))];

  async function worker() {

    while (cola.length) {
      const url = cola.shift();
      if (!url) continue;
      try {
        await descargarAudio(url);
      } catch {
        /* Conservar los datos; reintentar descarga en la próxima actualización. */
      }
    }
  }

  await Promise.all([worker(), worker()]);
}
