import { distanciaMetros } from './distancias';
import type { Lugar } from '../types/Lugar';
import type { Coordenadas } from '../types/Coordenadas';

export interface AvisoCercania {
  dentro: boolean;
  ultimoAviso: number;
}

// Margen de salida para evitar que una pequeña variación del GPS repita el aviso.
export function evaluarCercania(
  lugares: Lugar[], posicion: Coordenadas, radio: number,
  estados: Map<string, AvisoCercania>, ahora: number,
) {
  const candidatos: { lugar: Lugar; distancia: number; estado: AvisoCercania }[] = [];

  for (const lugar of lugares) {
    if (!lugar.activo) continue;
    const distancia = distanciaMetros(posicion, lugar.coordenadas);
    if (!Number.isFinite(distancia)) continue;
    const estado = estados.get(lugar.id) ?? { dentro: false, ultimoAviso: -Infinity };
    estados.set(lugar.id, estado);
    if (distancia > radio + Math.max(30, radio * 0.2)) estado.dentro = false;
    if (distancia <= radio && !estado.dentro && ahora - estado.ultimoAviso >= 30 * 60 * 1000) {
      candidatos.push({ lugar, distancia, estado });
    }
  }

  return candidatos.sort((a, b) => a.distancia - b.distancia);
}
