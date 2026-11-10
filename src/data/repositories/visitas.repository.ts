import { conBase } from '../database';
import { validarVisita } from '../../services/api/visitas.api';
import type { Visita } from '../../types/Visita';
import type { ErrorDatos } from '../../types/persistencia';

export interface VisitaGuardada { visita: Visita; error: ErrorDatos | null }
interface FilaVisita { datosJson: string; errorJson: string | null }

function leerFila(fila: FilaVisita): VisitaGuardada {

  return { visita: validarVisita(JSON.parse(fila.datosJson)), error: fila.errorJson ? JSON.parse(fila.errorJson) : null };
}

export function guardarVisitaLocal(visita: Visita) {

  const dato = validarVisita(visita);

  return conBase(async db => {
    await db.runAsync('INSERT INTO visitas_gps VALUES (?, ?, ?, ?, ?, ?, NULL)', dato.id, dato.usuarioId, dato.lugarId, dato.fechaHora, Number(dato.sincronizada), JSON.stringify(dato));
  });
}

export function ultimaVisitaLocal(usuarioId: string, lugarId: string) {

  return conBase(async db => {
    const fila = await db.getFirstAsync<FilaVisita>('SELECT datosJson, errorJson FROM visitas_gps WHERE usuarioId = ? AND lugarId = ? ORDER BY fechaHora DESC, rowid DESC LIMIT 1', usuarioId, lugarId);

    return fila ? leerFila(fila) : null;
  });
}

export function visitasPendientes(usuarioId: string) {

  return conBase(async db => {
    const filas = await db.getAllAsync<FilaVisita>('SELECT datosJson, errorJson FROM visitas_gps WHERE usuarioId = ? AND sincronizada = 0 ORDER BY fechaHora, id', usuarioId);

    return filas.map(leerFila).filter(fila => !fila.error || fila.error.reintentable || fila.error.codigo === 'VISITA_NO_CONFIRMADA').map(fila => fila.visita);
  });
}

export function confirmarVisita(visita: Visita) {

  return conBase(async db => {
    await db.runAsync('UPDATE visitas_gps SET sincronizada = 1, datosJson = ?, errorJson = NULL WHERE id = ? AND usuarioId = ?', JSON.stringify(validarVisita(visita)), visita.id, visita.usuarioId);
  });
}

export function guardarErrorVisita(id: string, usuarioId: string, error: ErrorDatos | null) {

  return conBase(async db => {
    await db.runAsync('UPDATE visitas_gps SET errorJson = ? WHERE id = ? AND usuarioId = ? AND sincronizada = 0', error ? JSON.stringify(error) : null, id, usuarioId);
  });
}

export function leerVisitaLocal(id: string, usuarioId: string) {

  return conBase(async db => {
    const fila = await db.getFirstAsync<FilaVisita>('SELECT datosJson, errorJson FROM visitas_gps WHERE id = ? AND usuarioId = ?', id, usuarioId);

    return fila ? leerFila(fila).visita : null;
  });
}

export function leerHistorialLocal(usuarioId: string) {
  return conBase(async db => {
    const filas = await db.getAllAsync<FilaVisita>('SELECT datosJson, errorJson FROM visitas_gps WHERE usuarioId = ? ORDER BY fechaHora DESC, id', usuarioId);
    return filas.map(fila => leerFila(fila).visita);
  });
}

export function guardarHistorialLocal(visitas: Visita[]) {
  const datos = visitas.map(validarVisita);
  return conBase(async db => {
    await db.withExclusiveTransactionAsync(async tx => {
      for (const visita of datos) {
        // Una descarga no debe reemplazar un registro que todavía está pendiente.
        await tx.runAsync(`INSERT INTO visitas_gps VALUES (?, ?, ?, ?, ?, ?, NULL)
          ON CONFLICT(id) DO UPDATE SET datosJson = excluded.datosJson, sincronizada = excluded.sincronizada, errorJson = NULL
          WHERE visitas_gps.sincronizada = 1 AND visitas_gps.usuarioId = excluded.usuarioId`,
        visita.id, visita.usuarioId, visita.lugarId, visita.fechaHora, Number(visita.sincronizada), JSON.stringify(visita));
      }
    });
  });
}

export function actualizarFotoVisita(visita: Visita) {
  const dato = validarVisita(visita);
  return conBase(db => db.runAsync('UPDATE visitas_gps SET datosJson = ? WHERE id = ? AND usuarioId = ? AND sincronizada = 0', JSON.stringify(dato), dato.id, dato.usuarioId));
}
