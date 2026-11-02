import { z } from 'zod';
import { solicitarJson } from './http';
import { FalloDatos } from '../errores';
import type { Visita } from '../../types/Visita';

const visitaSchema = z.object({
  id: z.string().regex(/^vis-[A-Za-z0-9_-]{3,36}$/),
  usuarioId: z.string().min(1), lugarId: z.string().min(1),
  fechaHora: z.iso.datetime({ offset: true }), origen: z.enum(['qr', 'gps', 'manual']),
  fotoUri: z.string().nullable(), nota: z.string().nullable(), sincronizada: z.boolean(),
});

export function validarVisita(entrada: unknown): Visita {

  const resultado = visitaSchema.safeParse(entrada);
  if (!resultado.success) throw new FalloDatos({ tipo: 'contrato', codigo: 'VISITA_INVALIDA', mensaje: 'No se pudo validar la visita.', reintentable: false });

  return resultado.data;
}

export async function enviarVisita(visita: Visita, token: string): Promise<Visita> {

  const { id, lugarId, fechaHora, origen, fotoUri, nota } = visita;
  const respuesta = await solicitarJson('/yo/visitas', { metodo: 'POST', token, cuerpo: { id, lugarId, fechaHora, origen, fotoUri, nota } });
  const sobre = z.object({ datos: visitaSchema, meta: z.null() }).safeParse(respuesta);

  if (!sobre.success || !sobre.data.datos.sincronizada || sobre.data.datos.id !== id || sobre.data.datos.usuarioId !== visita.usuarioId || sobre.data.datos.lugarId !== lugarId || sobre.data.datos.origen !== origen || Date.parse(sobre.data.datos.fechaHora) !== Date.parse(fechaHora)) {
    throw new FalloDatos({ tipo: 'contrato', codigo: 'VISITA_NO_CONFIRMADA', mensaje: 'El servidor no confirmó esta visita. Se conservó en el teléfono.', reintentable: false });
  }

  return sobre.data.datos;
}
