import { leerPaginas } from './paginas.repository';
import type { Evento } from '../../types/evento';
import type { LecturaLocal } from '../../types/persistencia';
import { validarEventos } from '../../services/api/eventos.api';

// La API se descarga desde 1900 para que "Todos" incluya también los eventos
// pasados. El filtro por día y por estado se hace en la pantalla.
export async function leerEventosLocal(): Promise<LecturaLocal<Evento[]> & { siguientePagina: number | null }> {

  const local = await leerPaginas<Evento>('eventos');

  if (!local.disponible) return { disponible: false, datos: null, descargadoEn: null, siguientePagina: null };

  return { disponible: true, datos: validarEventos(local.datos), descargadoEn: local.descargadoEn!, siguientePagina: local.siguientePagina };
}

/** Busca un evento en la copia local, sin filtrar por fecha (sirve para eventos viejos guardados). */
export async function leerEventoLocal(id: string): Promise<Evento | null> {

  if (!id) return null;
  const local = await leerPaginas<Evento>('eventos');
  if (!local.disponible) return null;

  return validarEventos(local.datos).find(evento => evento.id === id) ?? null;
}
