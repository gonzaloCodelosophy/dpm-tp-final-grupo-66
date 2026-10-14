import { conBase } from '../database';
import type { Evento } from '../../types/evento';
import type { LecturaLocal } from '../../types/persistencia';
import { validarEventos } from '../../services/api/eventos.api';

export function leerEventosLocal(): Promise<LecturaLocal<Evento[]>> {

  return conBase(async db => {
    const meta = await db.getFirstAsync<{ descargadoEn: string; cantidad: number }>("SELECT descargadoEn, cantidad FROM catalogos WHERE recurso = 'eventos' AND alcance = 'completo'");
    if (!meta) return { disponible: false, datos: null, descargadoEn: null };
    const filas = await db.getAllAsync<{ datosJson: string }>('SELECT datosJson FROM eventos');
    if (filas.length !== meta.cantidad) throw new Error('La agenda local está incompleta.');

    return { disponible: true, datos: validarEventos(filas.map(f => JSON.parse(f.datosJson))), descargadoEn: meta.descargadoEn };
  });
}

export function guardarEventosLocal(entrada: Evento[], descargadoEn: string): Promise<void> {

  const eventos = validarEventos(entrada);

  return conBase(async db => {
    await db.withExclusiveTransactionAsync(async tx => {
      await tx.execAsync('DELETE FROM eventos;');
      for (const e of eventos) await tx.runAsync('INSERT INTO eventos VALUES (?, ?, ?, ?, ?)', e.id, e.inicio, e.estado, e.lugarId, JSON.stringify(e));
      await tx.runAsync("INSERT OR REPLACE INTO catalogos VALUES ('eventos', 'completo', ?, ?)", descargadoEn, eventos.length);
    });
  });
}
