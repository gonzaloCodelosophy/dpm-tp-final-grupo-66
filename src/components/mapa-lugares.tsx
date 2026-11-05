import { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { REGION_INICIAL_COLON } from '../../constants/mapa';
import { useUbicacion } from '../hooks/use-ubicacion';
import type { Lugar } from '../types/Lugar';
import type { Categoria } from '../types/Categoria';
import { borderRadius, colors, fontSize, spacing } from '../styles/theme';

export interface MapaLugaresProps {
  lugares: Lugar[];
  categorias: Categoria[];
}

export function MapaLugares({ lugares, categorias }: MapaLugaresProps) {

  const mapa = useRef<MapView>(null);
  const ubicacion = useUbicacion();
  const [mapReady, setMapReady] = useState(false);
  const [centrarPendiente, setCentrarPendiente] = useState(false);
  const [seguirSinUbicacion, setSeguirSinUbicacion] = useState(false);

  // La configuración propia usa lat/lon; MapView requiere latitude/longitude.
  const regionInicial = {
    latitude: REGION_INICIAL_COLON.lat,
    longitude: REGION_INICIAL_COLON.lon,
    latitudeDelta: REGION_INICIAL_COLON.latDelta,
    longitudeDelta: REGION_INICIAL_COLON.lonDelta,
  };

  useEffect(() => {
    if (!centrarPendiente || !mapReady || !ubicacion.coordenadas || !mapa.current) return;

    mapa.current.animateToRegion({
      latitude: ubicacion.coordenadas.latitud,
      longitude: ubicacion.coordenadas.longitud,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }, 500);

    setCentrarPendiente(false);
  }, [centrarPendiente, mapReady, ubicacion.coordenadas]);

  const centrar = async () => {
    if (ubicacion.cargando) return;

    setSeguirSinUbicacion(false);
    setCentrarPendiente(true);

    if (!ubicacion.coordenadas) {
      const coordenadas = await ubicacion.solicitar();

      if (!coordenadas && mapa.current) setCentrarPendiente(false);
    }
  };

  const mostrarPanel = !seguirSinUbicacion && !ubicacion.coordenadas && ubicacion.permiso !== null && !ubicacion.cargando;
  const textoAccion = ubicacion.permiso === 'granted'
    ? 'Reintentar'
    : ubicacion.puedeSolicitar ? 'Permitir ubicación' : 'Abrir ajustes';

    return (
    <View style={styles.contenedor}>
      <MapView
        ref={mapa}
        style={styles.mapa}
        initialRegion={regionInicial}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={ubicacion.permiso === 'granted' && ubicacion.coordenadas !== null}
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Centrar en mi ubicación"
        disabled={ubicacion.cargando}
        onPress={() => { void centrar(); }}
        style={[styles.centrar, mostrarPanel && styles.centrarConPanel]}
      >
        {ubicacion.cargando ? <ActivityIndicator color={colors.secondary} /> : <Ionicons name="locate-outline" size={26} color={colors.secondary} />}
      </Pressable>

      {mostrarPanel && (
        <View style={styles.panel}>
          <Ionicons name="location-outline" size={32} color={colors.primary} />
          <Text style={styles.titulo}>{ubicacion.error ? 'No pudimos ubicarte' : 'Activá tu ubicación'}</Text>
          <Text style={styles.mensaje} accessibilityLiveRegion="polite">
            {ubicacion.error ?? 'Usamos tu ubicación para mostrarte lugares cercanos y calcular distancias.'}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => { void centrar(); }} style={styles.permitir}>
            <Text style={styles.accion}>{textoAccion}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setSeguirSinUbicacion(true)} style={styles.continuar}>
            <Text style={styles.enlace}>Seguir sin ubicación</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
	mapa: { flex: 1 },
  centrar: {
    position: 'absolute', bottom: spacing.md, right: spacing.md,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    elevation: 3,
  },
  centrarConPanel: { bottom: undefined, top: spacing.md },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, padding: spacing.md, alignItems: 'center', gap: spacing.sm,
    borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg,
  },
  titulo: { fontSize: fontSize.subtitle, fontWeight: '700', color: colors.secondary },
  mensaje: { fontSize: fontSize.body, color: colors.textSecondary, textAlign: 'center' },
  permitir: {
    minHeight: 44, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: borderRadius.pill, paddingHorizontal: spacing.md,
  },
  accion: { color: colors.surface, fontSize: fontSize.body, fontWeight: '600' },
  continuar: { minHeight: 44, justifyContent: 'center' },
  enlace: { color: colors.primary, fontSize: fontSize.body, textDecorationLine: 'underline' },
});
