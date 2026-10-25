import { leerPaginas } from './paginas.repository';
import type { Evento } from '../../types/evento';
import type { LecturaLocal } from '../../types/persistencia';
import { validarEventos } from '../../services/api/eventos.api';

//Reescribo casi completo al igual que el otro (Si, paginacion...)
export async function leerEventosLocal(): Promise<LecturaLocal<Evento[]> & { siguientePagina: number | null }> {

  const local = await leerPaginas<Evento>('eventos');

  if (!local.disponible) return { disponible: false, datos: null, descargadoEn: null, siguientePagina: null };

  const partes = new Intl.DateTimeFormat('en', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const valor = (tipo: string) => partes.find(parte => parte.type === tipo)!.value;
  const hoy = `${valor('year')}-${valor('month')}-${valor('day')}`;
  const desde = Date.parse(`${hoy}T00:00:00-03:00`);
  const datos = validarEventos(local.datos).filter(evento => evento.fin
    ? Date.parse(evento.fin) > desde || Date.parse(evento.inicio) >= desde
    : evento.inicio.slice(0, 10) >= hoy);

  return { disponible: true, datos, descargadoEn: local.descargadoEn!, siguientePagina: local.siguientePagina };
}
