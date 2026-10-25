import { leerPaginas } from './paginas.repository';
import { validarCatalogo } from '../../services/api/catalogo.schema';
import type { Categoria } from '../../types/Categoria';
import type { Lugar } from '../../types/Lugar';
import type { Catalogo, LecturaLocal } from '../../types/persistencia';

export async function leerCatalogoLocal(): Promise<LecturaLocal<Catalogo> & { siguientePaginaLugares: number | null; siguientePaginaCategorias: number | null }> {

  const lugares = await leerPaginas<Lugar>('lugares');
  const categorias = await leerPaginas<Categoria>('categorias');
  const paginas = { siguientePaginaLugares: lugares.siguientePagina, siguientePaginaCategorias: categorias.siguientePagina };

  if (!lugares.disponible && !categorias.disponible) return { disponible: false, datos: null, descargadoEn: null, ...paginas };

  // Diomio... valido el catalogo por que pueden existir categorias en una pagina que no se exploro aun.
  const datos = validarCatalogo({ lugares: lugares.datos, categorias: categorias.datos });

  datos.lugares.sort((a, b) => a.nombre.localeCompare(b.nombre) || a.id.localeCompare(b.id));
  datos.categorias.sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id));

  return { disponible: true, datos, descargadoEn: [lugares.descargadoEn, categorias.descargadoEn].filter((fecha): fecha is string => fecha !== null).sort().at(-1)!, ...paginas };
}
