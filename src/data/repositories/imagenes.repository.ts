import { conBase } from '../database';

export interface ImagenLocal { url: string; nombreArchivo: string; descargadoEn: string }

export function leerImagenLocal(url: string): Promise<ImagenLocal | null> {

  return conBase(db => db.getFirstAsync<ImagenLocal>('SELECT * FROM imagenes WHERE url = ?', url));
}

export function guardarImagenLocal(imagen: ImagenLocal): Promise<void> {

  return conBase(async db => {
    await db.runAsync('INSERT OR REPLACE INTO imagenes VALUES (?, ?, ?)', imagen.url, imagen.nombreArchivo, imagen.descargadoEn);
  });
}
