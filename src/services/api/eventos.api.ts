import { z } from 'zod';
import { solicitarJson } from './http';
import { FalloDatos } from '../errores';
import type { Evento } from '../../types/evento';
const fecha = z.iso.datetime({ offset: true });
export const eventoSchema = z.object({
  id: z.string().min(1), titulo: z.string(), descripcion: z.string(), lugarId: z.string().min(1).nullable(),
  direccionLibre: z.string().nullable(), coordenadas: z.object({ latitud: z.number().min(-90).max(90), longitud: z.number().min(-180).max(180) }).nullable(),
  inicio: fecha, fin: fecha.nullable(), imagenUrl: z.string().nullable(), precio: z.number().nonnegative().nullable(), estado: z.enum(['programado', 'suspendido', 'cancelado', 'finalizado']),
});

export function validarEventos(entrada: unknown): Evento[] {

  const resultado = z.array(eventoSchema).safeParse(entrada);

  if (!resultado.success || new Set(resultado.data.map(e => e.id)).size !== resultado.data.length) throw new FalloDatos({ tipo: 'contrato', codigo: 'EVENTOS_INVALIDOS', mensaje: 'La agenda no cumple el contrato o contiene IDs duplicados.', reintentable: false });

  return resultado.data.sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio) || a.id.localeCompare(b.id));
}

export async function descargarEventos(): Promise<Evento[]> {

  const resultado = z.object({ datos: z.array(eventoSchema), meta: z.object({ total: z.number().int().nonnegative() }) }).safeParse(await solicitarJson('/api/eventos'));
  if (!resultado.success || resultado.data.meta.total !== resultado.data.datos.length) throw new FalloDatos({ tipo: 'contrato', codigo: 'AGENDA_INCOMPLETA', mensaje: 'El servidor no devolvió la agenda completa.', reintentable: true });
  return validarEventos(resultado.data.datos);
}
