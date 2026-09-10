import type { Lugar } from "../types/Lugar";
import { lugares } from "../mocks/lugares";

export async function obtenerLugares(): Promise<Lugar[]> {
  return lugares;
}

export async function obtenerLugarPorId(id: string): Promise<Lugar | null> {
  const lugar = lugares.find((lugar) => lugar.id === id);

  return lugar ?? null;
}

export async function obtenerLugaresPorCategoria(
  categoriaId: string,
): Promise<Lugar[]> {
  return lugares.filter((lugar) => lugar.categoriaId === categoriaId);
}
