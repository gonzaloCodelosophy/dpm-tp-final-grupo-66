import { z } from 'zod';
import { solicitarJson } from './api/http';
import { eventoSchema, descargarEventos } from './api/eventos.api';
import { obtenerToken } from './storage.service';
import type { EstadoEvento } from '../types/evento';
export const listarEventosAdmin = descargarEventos;
export type EstadoEditable = Exclude<EstadoEvento, 'finalizado'>;
export async function cambiarEstadoEvento(id: string, estado: EstadoEditable) {
 const token = await obtenerToken();
 if (!token) throw new Error('Tu sesión venció. Volvé a ingresar.');
 const resultado = z.object({ datos: eventoSchema }).safeParse(await solicitarJson(`/eventos/${encodeURIComponent(id)}/estado`, { metodo: 'PATCH', token, cuerpo: { estado } }));
 if (!resultado.success) throw new Error('No se pudo validar el evento actualizado. Actualizá la lista.');
 return resultado.data.datos;
}
