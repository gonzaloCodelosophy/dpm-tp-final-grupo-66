import { solicitarJson } from './http';
import { categoriaSchema, lugarSchema } from './catalogo.schema';
import { POR_PAGINA, validarPagina } from './paginacion';

//la reescribo completa @Alejandro-Rodriguez, el demo que hicimos es distinto y require paginacion.
export async function descargarLugares(pagina: number) {

  return validarPagina(await solicitarJson(`/lugares?pagina=${pagina}&porPagina=${POR_PAGINA}`), lugarSchema, pagina);
}

export async function descargarCategorias(pagina: number) {

  return validarPagina(await solicitarJson(`/categorias?pagina=${pagina}&porPagina=${POR_PAGINA}`), categoriaSchema, pagina);
}
