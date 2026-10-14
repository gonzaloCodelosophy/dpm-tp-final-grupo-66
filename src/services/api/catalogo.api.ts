import { z } from 'zod';
import { solicitarJson } from './http';
import { categoriaSchema, lugarSchema, validarCatalogo } from './catalogo.schema';
import type { Catalogo } from '../../types/persistencia';
import { FalloDatos } from '../errores';

export async function descargarCatalogo(): Promise<Catalogo> {

  const respuestaCategorias = z.object({ datos: z.array(categoriaSchema) }).safeParse(await solicitarJson('/api/categorias'));
  if (!respuestaCategorias.success) throw contrato();
  const acumulados: Catalogo['lugares'] = [];
  let total: number | null = null;
  for (let pagina = 1; ; pagina++) {
    const respuesta = z.object({ datos: z.array(lugarSchema), meta: z.object({ total: z.number().int().nonnegative(), pagina: z.number().int().positive(), porPagina: z.number().int().positive() }) }).safeParse(await solicitarJson(`/api/lugares?soloActivos=false&pagina=${pagina}&porPagina=20`));
    if (!respuesta.success) throw contrato();
    const { datos, meta } = respuesta.data;
    if (meta.pagina !== pagina || meta.porPagina !== 20 || (total !== null && total !== meta.total)) throw contrato();
    total = meta.total;
    const esperados = Math.min(20, Math.max(0, total - acumulados.length));
    if (datos.length !== esperados) throw contrato();
    acumulados.push(...datos);
    if (acumulados.length === total) break;
  }
  return validarCatalogo({ lugares: acumulados, categorias: respuestaCategorias.data.datos });
}

function contrato() {

  return new FalloDatos({ tipo: 'contrato', codigo: 'PAGINACION_INVALIDA', mensaje: 'La respuesta o paginación del catálogo es inconsistente.', reintentable: true });
}
