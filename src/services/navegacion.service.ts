import { Linking } from 'react-native';
import type { Coordenadas } from '../types/Coordenadas';

export function urlComoLlegar(destino: Coordenadas): string {

  const punto = encodeURIComponent(`${destino.latitud},${destino.longitud}`);

  // Sin origen fijo: la aplicación de mapas resuelve la posición actual.
  return `https://www.google.com/maps/dir/?api=1&destination=${punto}`;
}

export async function abrirIndicaciones(destino: Coordenadas): Promise<void> {

  await Linking.openURL(urlComoLlegar(destino));
}
