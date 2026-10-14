import type { Lugar } from '../types/Lugar';
import { obtenerCatalogo } from './catalogo.service';

export async function obtenerLugares(): Promise<Lugar[]> {

  return (await obtenerCatalogo()).lugares.filter(lugar => lugar.activo);
}

export async function obtenerLugarPorId(id: string): Promise<Lugar | null> {

  return (await obtenerCatalogo()).lugares.find(lugar => lugar.id === id) ?? null;
}

export async function obtenerLugaresPorCategoria(categoriaId: string): Promise<Lugar[]> {

  return (await obtenerLugares()).filter(lugar => lugar.categoriaId === categoriaId);
}
