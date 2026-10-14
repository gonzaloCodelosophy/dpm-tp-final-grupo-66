import type { Categoria } from '../types/Categoria';
import { obtenerCatalogo } from './catalogo.service';

export async function obtenerCategorias(): Promise<Categoria[]> {
  return (await obtenerCatalogo()).categorias;
}
