import type { Coordenadas } from "../types/Coordenadas";

export function distanciaMetros(
  origen: Coordenadas,
  destino: Coordenadas,
): number {
  const radianes = Math.PI / 180;
  const latitud = (destino.latitud - origen.latitud) * radianes;
  const longitud = (destino.longitud - origen.longitud) * radianes;
  const a =
    Math.sin(latitud / 2) ** 2 +
    Math.cos(origen.latitud * radianes) *
      Math.cos(destino.latitud * radianes) *
      Math.sin(longitud / 2) ** 2;

  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function textoDistancia(metros: number): string {
  return metros < 1000
    ? `${Math.round(metros)} m`
    : `${(metros / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} km`;
}
