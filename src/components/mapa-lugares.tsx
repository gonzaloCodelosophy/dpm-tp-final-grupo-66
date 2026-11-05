import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import { REGION_INICIAL_COLON } from '../../constants/mapa';
import type { Lugar } from '../types/Lugar';
import type { Categoria } from '../types/Categoria';
import { colors } from '../styles/theme';

export interface MapaLugaresProps {
  lugares: Lugar[];
  categorias: Categoria[];
}

export function MapaLugares({ lugares, categorias }: MapaLugaresProps) {


    return (
    <MapView
      style={styles.mapa}
      initialRegion={REGION_INICIAL_COLON}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass
      toolbarEnabled={false}
    >
      {lugares.filter(lugar => lugar.activo).map(place => {
        	const categoria = categorias.find(item => item.id === place.categoriaId);


        return (
          <Marker
            key={place.id}
            identifier={place.id}
            coordinate={{ latitude: place.coordenadas.latitud, longitude: place.coordenadas.longitud }}
            title={place.nombre}
            description={place.direccion}
            pinColor={categoria?.color ?? colors.primary}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
	mapa: { flex: 1 },
});
