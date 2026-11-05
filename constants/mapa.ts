import type { Region } from 'react-native-maps';
import type { Coordenadas } from '../src/types/Coordenadas';


// Referencia inicial de Colón; no representa la ubicación del usuario.
export const CENTRO_COLON: Coordenadas = {
	latitud: -32.2236,
    longitud: -58.1427,
};


export const REGION_INICIAL_COLON: Region = {
  latitude: CENTRO_COLON.latitud,
  longitude: CENTRO_COLON.longitud,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};
