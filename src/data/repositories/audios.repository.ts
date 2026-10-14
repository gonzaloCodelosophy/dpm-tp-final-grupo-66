import { conBase } from '../database';

export interface AudioLocal { url: string; nombreArchivo: string; descargadoEn: string }

export function leerAudioLocal(url: string): Promise<AudioLocal | null> {

  return conBase(db => db.getFirstAsync<AudioLocal>('SELECT * FROM audios WHERE url = ?', url));
}

export function guardarAudioLocal(audio: AudioLocal): Promise<void> {

  return conBase(async db => {
    await db.runAsync('INSERT OR REPLACE INTO audios VALUES (?, ?, ?)', audio.url, audio.nombreArchivo, audio.descargadoEn);
  });
}
