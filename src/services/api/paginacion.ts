import { z } from 'zod';
import { FalloDatos } from '../errores';
import type { Pagina } from '../../types/persistencia';

export const POR_PAGINA = 20;

export function validarPagina<T>(entrada: unknown, schema: z.ZodType<T>, pagina: number): Pagina<T> {

  const resultado = z.object({
    datos: z.array(schema),
    meta: z.object({ total: z.number().int().nonnegative(), pagina: z.number().int().positive(), porPagina: z.number().int().positive() }),
  }).safeParse(entrada);

  if (resultado.success) {
    const { datos, meta } = resultado.data;
    const esperados = Math.min(POR_PAGINA, Math.max(0, meta.total - (pagina - 1) * POR_PAGINA));

    if (meta.pagina === pagina && meta.porPagina === POR_PAGINA && datos.length === esperados) return { datos, meta };
  }

  throw new FalloDatos({ tipo: 'contrato', codigo: 'PAGINACION_INVALIDA', mensaje: 'La página recibida es inconsistente.', reintentable: true });
}
