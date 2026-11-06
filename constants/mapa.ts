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

// Encuadre cercano para centrar la posición o seleccionar un lugar.
export const DELTA_CERCANIA = 0.015;

// Radio de registro GPS acordado con Gonzalo.
export const RADIO_REGISTRO_METROS = 50;
