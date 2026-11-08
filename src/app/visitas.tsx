import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useTema } from '../context/tema.context';
import { useAuth } from '../context/auth.context';
import { useCatalogo } from '../hooks/use-catalogo';
import { useDetallesLugares } from '../hooks/use-detalles-lugares';
import { EstadoPantalla } from '../components/estado-pantalla';
import { TarjetaVisita } from '../components/tarjeta-visita';
import { obtenerHistorialVisitas, observarVisitas } from '../services/visitas.service';
import { colorsInicio, fuenteTitulo } from '../styles/inicio';
import type { Visita } from '../types/Visita';

const zonaRecorrido = 'America/Argentina/Buenos_Aires';
const formatoDia = new Intl.DateTimeFormat('es-AR', {
  timeZone: zonaRecorrido, year: 'numeric', month: '2-digit', day: '2-digit',
});
const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  timeZone: zonaRecorrido, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

function fechaLineaTiempo(fecha: string) {
  const texto = formatoFecha.format(new Date(fecha)).replace(',', '').replace(/ de (\d{4})$/, ' $1');

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function VisitasScreen() {
  const { colorsInicio: colors } = useTema();
  const styles = crearEstilos(colors);
  const router = useRouter();
  const { usuario, status } = useAuth();
  const usuarioId = status === 'autenticado' ? usuario?.id : undefined;
  const [historial, setHistorial] = useState<{ usuarioId: string; visitas: Visita[] } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const turno = useRef(0);
  const visitas = historial && historial.usuarioId === usuarioId ? historial.visitas : [];
  const catalogo = useCatalogo();
  const detalles = useDetallesLugares(visitas.map(visita => visita.lugarId), catalogo.datos?.lugares ?? []);
  const lugares = new Map(detalles.lugares.map(lugar => [lugar.id, lugar]));
  const lineaTiempo = useMemo(() => {
    const ordenadas = [...(historial && historial.usuarioId === usuarioId ? historial.visitas : [])]
      .sort((a, b) => Date.parse(b.fechaHora) - Date.parse(a.fechaHora));

    return ordenadas.map((visita, indice) => ({
      visita,
      empiezaDia: indice === 0 || formatoDia.format(new Date(visita.fechaHora)) !== formatoDia.format(new Date(ordenadas[indice - 1].fechaHora)),
    }));
  }, [historial, usuarioId]);


  const cargar = useCallback(async () => {
    const solicitud = ++turno.current;
    if (!usuarioId) return;
    setCargando(true);
    setError(false);
    try {
      const nuevas = await obtenerHistorialVisitas(usuarioId);
      if (solicitud === turno.current) setHistorial({ usuarioId, visitas: nuevas });
    } catch {
      if (solicitud === turno.current) setError(true);
    } finally {
      if (solicitud === turno.current) setCargando(false);
    }
  }, [usuarioId]);

  useFocusEffect(useCallback(() => {
    void cargar();
    const quitar = observarVisitas(id => { if (id === usuarioId) void cargar(); });

    return () => { turno.current++; quitar(); };
  }, [cargar, usuarioId]));

  const cabecera = (
    <View style={styles.encabezadoFijo}>
      <View style={styles.cabecera}>
        <Image source={require('../../assets/images/logo-colon.png')} style={styles.logo} contentFit="contain" accessibilityLabel="Colón, Entre Ríos" />
        <Image source={require('../../assets/images/ilustracion-colon-puente.png')} style={styles.puente} contentFit="contain" />
        <Text style={styles.titulo}>Mi recorrido</Text>
        <Text style={styles.descripcion}>Tus lugares y experiencias en Colón</Text>
      </View>
      {usuarioId && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Registrar una visita. Elegir cómo registrarla"
            onPress={() => router.push('/(tabs)/recorrido/registrar-visita')}
            style={({ pressed }) => [styles.registrar, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.registrarTexto}>Registrar una visita</Text>
          </Pressable>
          <Text style={styles.seccion}>Lugares visitados</Text>
        </>
      )}
    </View>
  );

  const estadoVacio = !usuarioId ? (
    <EstadoPantalla
      tipo={status === 'cargando' ? 'cargando' : 'vacio'}
      titulo={status === 'biometria_requerida' ? 'Desbloqueá tu cuenta' : 'Tu recorrido empieza acá'}
      mensaje="Ingresá con tu cuenta para ver tus visitas y guardar nuevos recuerdos."
      accion={status === 'biometria_requerida' ? 'Ir al perfil' : 'Iniciar sesión'}
      onPress={() => status === 'biometria_requerida' ? router.navigate('/(tabs)/perfil') : router.push('/(auth)/login')}
    />
  ) : cargando ? <EstadoPantalla tipo="cargando" /> : error ? (
    <EstadoPantalla tipo="error" mensaje="No pudimos cargar tus visitas. Intentá de nuevo." onPress={() => void cargar()} />
  ) : (
    <EstadoPantalla tipo="vacio" titulo="Empezá tu recorrido" mensaje="Todavía no registraste visitas. Elegí un lugar y guardá tu primera experiencia." />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      {cabecera}
      <FlatList
        style={styles.contenedorLista}
        data={lineaTiempo}
        keyExtractor={item => item.visita.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={estadoVacio}
        ListFooterComponent={error && visitas.length > 0 ? (
          <EstadoPantalla tipo="error" mensaje="No pudimos actualizar las visitas." onPress={() => void cargar()} />
        ) : null}
        refreshing={Boolean(usuarioId) && cargando && visitas.length > 0}
        onRefresh={usuarioId ? () => void cargar() : undefined}
        renderItem={({ item: { visita, empiezaDia } }) => (
          <View style={styles.filaTiempo}>
            <View style={styles.ejeTiempo} pointerEvents="none" accessible={false}>
              <View style={styles.lineaVertical} />
              {empiezaDia && <View style={styles.puntoTiempo} />}
            </View>
            <View style={styles.contenidoTiempo}>
              {empiezaDia && (
                <Text accessibilityRole="header" style={styles.fechaTiempo}>
                  {fechaLineaTiempo(visita.fechaHora)}
                </Text>
              )}
              <TarjetaVisita visita={visita} lugar={lugares.get(visita.lugarId)} onPress={() => router.push({ pathname: '/(tabs)/recorrido/visita/[id]', params: { id: visita.id } })} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const crearEstilos = (colors: typeof colorsInicio) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  encabezadoFijo: { paddingHorizontal: 18, paddingTop: 8 },
  contenedorLista: { flex: 1 },
  lista: { paddingHorizontal: 18, paddingBottom: 32, flexGrow: 1 },
  filaTiempo: { flexDirection: 'row' },
  ejeTiempo: { width: 22, marginRight: 8, alignSelf: 'stretch' },
  lineaVertical: { position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, backgroundColor: colors.border },
  puntoTiempo: { position: 'absolute', left: 2, top: 6, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background },
  contenidoTiempo: { flex: 1, minWidth: 0 },
  fechaTiempo: { fontSize: 15, fontWeight: '700', lineHeight: 23, color: colors.secondary, marginBottom: 14 },
  cabecera: { minHeight: 130, justifyContent: 'flex-end', marginBottom: 24, paddingTop: 72 },
  logo: { width: 95, height: 62, position: 'absolute', top: 0, left: 0 },
  puente: { width: 205, height: 115, position: 'absolute', right: -24, top: 0, opacity: 0.85 },
  titulo: { fontFamily: fuenteTitulo, fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.blueText },
  descripcion: { fontSize: 14, color: colors.greenText, lineHeight: 20, marginTop: 2 },
  registrar: { minHeight: 48, borderRadius: 24, backgroundColor: colors.primarySolid, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 },
  registrarTexto: { fontSize: 14, fontWeight: '600', color: colors.onPrimary, flexShrink: 1 },
  seccion: { fontSize: 19, fontWeight: '700', color: colors.secondary, marginBottom: 16 },
});
