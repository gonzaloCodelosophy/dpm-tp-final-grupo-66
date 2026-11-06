import { useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { REGION_INICIAL_COLON, DELTA_CERCANIA } from '../../constants/mapa';
import { TarjetaMapa } from './tarjeta-mapa';
import { BotonLugarFavorito } from './boton-lugar-favorito';
import { distanciaMetros, textoDistancia } from '../services/distancias';
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
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [verTodos, setVerTodos] = useState(false);
  const [altoPanel, setAltoPanel] = useState(0);
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
      latitudeDelta: DELTA_CERCANIA,
      longitudeDelta: DELTA_CERCANIA,
    }, 500);

    void Haptics.selectionAsync().catch(() => undefined);
    setCentrarPendiente(false);
  }, [centrarPendiente, mapReady, ubicacion.coordenadas]);

  const centrar = async () => {
    if (ubicacion.cargando) return;

    setSeleccionId(null);
    setSeguirSinUbicacion(false);
    setCentrarPendiente(true);

    if (!ubicacion.coordenadas) {
      const coordenadas = await ubicacion.solicitar();

      if (!coordenadas && mapa.current) setCentrarPendiente(false);
    }
  };

  const cercanos = useMemo(() => lugares.filter(lugar => lugar.activo).map(lugar => ({
    lugar,
    distancia: ubicacion.coordenadas ? distanciaMetros(ubicacion.coordenadas, lugar.coordenadas) : null,
  })).sort((a, b) => a.distancia !== null && b.distancia !== null
    ? a.distancia - b.distancia || a.lugar.nombre.localeCompare(b.lugar.nombre)
    : a.lugar.nombre.localeCompare(b.lugar.nombre)), [lugares, ubicacion.coordenadas]);

  // Si el filtro o la actualización quita un lugar, también se cierra su tarjeta.
  const seleccionado = cercanos.find(item => item.lugar.id === seleccionId);

  useEffect(() => {
    if (seleccionId && !seleccionado) setSeleccionId(null);
  }, [seleccionId, seleccionado]);

  const seleccionar = (lugar: Lugar) => {
    Keyboard.dismiss();

    if (seleccionId !== lugar.id) void Haptics.selectionAsync().catch(() => undefined);

    setSeleccionId(lugar.id);

    if (mapReady) mapa.current?.animateToRegion({
      latitude: lugar.coordenadas.latitud,
      longitude: lugar.coordenadas.longitud,
      latitudeDelta: DELTA_CERCANIA,
      longitudeDelta: DELTA_CERCANIA,
    }, 500);
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
        mapPadding={{ top: 12, right: 12, left: 12, bottom: altoPanel + 12 }}
        onPress={evento => {
          if (evento.nativeEvent.action !== 'marker-press') setSeleccionId(null);
        }}
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
              accessibilityLabel={place.nombre}
              onPress={evento => {
                evento.stopPropagation();
                seleccionar(place);
              }}
              opacity={seleccionado && seleccionado.lugar.id !== place.id ? 0.55 : 1}
              pinColor={categoria?.color ?? colors.primary}
            />
          );
        })}
      </MapView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Centrar en mi ubicación"
        disabled={ubicacion.cargando}
        accessibilityState={{ disabled: ubicacion.cargando, busy: ubicacion.cargando }}
        onPress={() => { void centrar(); }}
        style={styles.centrar}
      >
        {ubicacion.cargando ? <ActivityIndicator color={colors.secondary} /> : <Ionicons name="locate-outline" size={26} color={colors.secondary} />}
      </Pressable>

      {seleccionado ? (
        <ScrollView style={styles.panelLugar} onLayout={evento => setAltoPanel(evento.nativeEvent.layout.height)}>
          <TarjetaMapa
            lugar={seleccionado.lugar}
            categoria={categorias.find(item => item.id === seleccionado.lugar.categoriaId)?.nombre}
            distancia={seleccionado.distancia}
            onCerrar={() => setSeleccionId(null)}
          />
        </ScrollView>
      ) : mostrarPanel ? (
        <ScrollView style={styles.panel} contentContainerStyle={styles.contenidoPermiso} onLayout={evento => setAltoPanel(evento.nativeEvent.layout.height)}>
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
        </ScrollView>
      ) : (
        <View style={styles.panelCercanos} onLayout={evento => setAltoPanel(evento.nativeEvent.layout.height)}>
          <View style={styles.cabeceraCercanos}>
            <Text style={styles.titulo}>{ubicacion.coordenadas ? 'Cerca tuyo' : 'Lugares'}</Text>
            {cercanos.length > 2 && (
              <Pressable accessibilityRole="button" onPress={() => setVerTodos(!verTodos)} style={styles.continuar}>
                <Text style={styles.enlace}>{verTodos ? 'Ver menos' : 'Ver todos'}</Text>
              </Pressable>
            )}
          </View>
          <ScrollView style={styles.listaCercanos} keyboardShouldPersistTaps="handled">
            {(verTodos ? cercanos : cercanos.slice(0, 2)).map(({ lugar, distancia }) => (
              <View key={lugar.id} style={styles.filaCercana}>
                <Pressable accessibilityRole="button" onPress={() => seleccionar(lugar)} style={styles.lugarCercano}>
                  <Ionicons name="location-outline" size={22} color={categorias.find(item => item.id === lugar.categoriaId)?.color ?? colors.primary} />
                  <Text style={styles.nombreCercano}>{lugar.nombre}</Text>
                  {distancia !== null && <Text style={styles.distancia}>{textoDistancia(distancia)}</Text>}
                </Pressable>
                <BotonLugarFavorito id={lugar.id} />
              </View>
            ))}
            {!cercanos.length && <Text style={styles.mensaje}>No hay lugares para esta búsqueda o categoría.</Text>}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
	mapa: { flex: 1 },
  centrar: {
    position: 'absolute', top: spacing.md, right: spacing.md,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    elevation: 3,
  },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, maxHeight: '75%',
    borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg,
  },
  contenidoPermiso: { padding: spacing.sm, alignItems: 'center', gap: spacing.xs },
  panelLugar: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '70%', backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg },
  panelCercanos: { maxHeight: '60%', position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.sm, backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg },
  cabeceraCercanos: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.sm },
  listaCercanos: { maxHeight: 170, flexShrink: 1 },
  filaCercana: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  lugarCercano: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: spacing.sm, paddingHorizontal: spacing.sm },
  nombreCercano: { flex: 1, color: colors.text, fontSize: fontSize.caption },
  distancia: { color: colors.textSecondary, fontSize: fontSize.caption },
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
