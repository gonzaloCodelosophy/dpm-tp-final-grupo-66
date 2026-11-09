import { leerPaginas } from './paginas.repository';
import type { Evento } from '../../types/evento';
import type { LecturaLocal } from '../../types/persistencia';
import { validarEventos } from '../../services/api/eventos.api';
import { diaLocal, finEfectivo, inicioDelDia } from '../../services/fechas-eventos';

// La API ya devuelve la agenda desde hoy, pero las páginas guardadas pueden
// tener eventos viejos. Se descartan los que terminaron antes de hoy.
export async function leerEventosLocal(): Promise<LecturaLocal<Evento[]> & { siguientePagina: number | null }> {

  const local = await leerPaginas<Evento>('eventos');

  if (!local.disponible) return { disponible: false, datos: null, descargadoEn: null, siguientePagina: null };

  const desde = inicioDelDia(diaLocal(new Date()));
  const datos = validarEventos(local.datos).filter(evento => finEfectivo(evento).getTime() > desde.getTime());

  return { disponible: true, datos, descargadoEn: local.descargadoEn!, siguientePagina: local.siguientePagina };
}

/** Busca un evento en la copia local, sin filtrar por fecha (sirve para eventos viejos guardados). */
export async function leerEventoLocal(id: string): Promise<Evento | null> {

  if (!id) return null;
  const local = await leerPaginas<Evento>('eventos');
  if (!local.disponible) return null;

  return validarEventos(local.datos).find(evento => evento.id === id) ?? null;
}
