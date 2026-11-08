import type { Usuario } from '../src/types/auth';
import type { Coordenadas } from '../src/types/Coordenadas';


// Referencia inicial de Colón; no representa la ubicación del usuario.
export const CENTRO_COLON: Coordenadas = {
	latitud: -32.2236,
    longitud: -58.1427,
};


export const REGION_INICIAL_COLON = {
  lat: CENTRO_COLON.latitud,
  lon: CENTRO_COLON.longitud,
  latDelta: 0.06,
  lonDelta: 0.06,
};

// Altura inicial en Apple Maps y zoom aproximado en Google Maps.
export const ALTURA_INICIAL_MAPA = 1000;
export const ZOOM_INICIAL_MAPA = 15.3;

// Encuadre cercano para centrar la posición o seleccionar un lugar.
export const DELTA_CERCANIA = 0.015;

// Radio fijo para comprobar el registro por GPS.
export const RADIO_REGISTRO_METROS = 50;

// Los avisos conservan el radio elegido en la cuenta.
export function radioProximidad(usuario?: Usuario | null): number {
  const radio = usuario?.preferencias?.radioAvisoMetros;

  return typeof radio === 'number' && Number.isFinite(radio) && radio > 0 ? radio : 250;
}
