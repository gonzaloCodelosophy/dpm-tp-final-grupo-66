import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Stack, useRouter } from 'expo-router';
import { useTema } from '../context/tema.context';
import { fuenteTitulo, colorsInicio } from '../styles/inicio';

export default function RegistrarVisitaScreen() {
  const router = useRouter();
  const { colorsInicio: colors } = useTema();
  const styles = crearEstilos(colors);
  const opciones = [
    {
      titulo: 'Usar mi ubicación', descripcion: 'Detectamos el lugar con GPS.',
      icono: 'location-outline' as const, color: colors.green, fondo: colors.greenLight,
      abrir: () => router.push('/(tabs)/recorrido/recuerdo-visita'),
    },
    {
      titulo: 'Escanear código QR', descripcion: 'Encontrá el código en el lugar.',
      icono: 'qr-code-outline' as const, color: colors.blueText, fondo: colors.blueLight,
      abrir: () => router.push('/(tabs)/recorrido/escanear-qr'),
    },
    {
      titulo: 'Cargar manualmente', descripcion: 'Buscá y seleccioná un lugar.',
      icono: 'create-outline' as const, color: colors.primary, fondo: colors.primaryLight,
      abrir: () => router.push({ pathname: '/(tabs)/recorrido/recuerdo-visita', params: { modo: 'manual' } }),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.cabecera}>
        <Pressable
          accessibilityRole="button" accessibilityLabel="Volver a Mi recorrido"
          onPress={() => router.dismissTo('/(tabs)/recorrido')}
          style={styles.volver}
        >
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </Pressable>
        <Image source={require('../../assets/images/logo-colon.png')} style={styles.logo} contentFit="contain" accessibilityLabel="Colón, Entre Ríos" />
      </View>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Registrar visita</Text>
        <Text style={styles.descripcion}>Elegí cómo querés registrarla</Text>
        <View style={styles.opciones}>
          {opciones.map(opcion => (
            <Pressable
              key={opcion.titulo}
              accessibilityRole="button"
              accessibilityLabel={`${opcion.titulo}. ${opcion.descripcion}`}
              onPress={opcion.abrir}
              style={({ pressed }) => [styles.opcion, pressed && { opacity: 0.75 }]}
            >
              <View style={[styles.icono, { backgroundColor: opcion.fondo }]}>
                <Ionicons name={opcion.icono} size={30} color={opcion.color} />
              </View>
              <View style={styles.textos}>
                <Text style={styles.nombre}>{opcion.titulo}</Text>
                <Text style={styles.detalle}>{opcion.descripcion}</Text>
              </View>
              <Ionicons name="chevron-forward" size={21} color={colors.secondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const crearEstilos = (colors: typeof colorsInicio) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cabecera: { minHeight: 64, marginHorizontal: 18, marginTop: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 52 },
  volver: { position: 'absolute', left: 0, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 90, height: 48 },
  contenido: { paddingHorizontal: 18, paddingBottom: 32 },
  titulo: { fontFamily: fuenteTitulo, fontSize: 28, fontWeight: '700', color: colors.secondary, marginBottom: 6 },
  descripcion: { fontSize: 15, lineHeight: 22, color: colors.textSecondary, marginBottom: 28 },
  opciones: { gap: 16 },
  opcion: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, minHeight: 100, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  icono: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  textos: { flex: 1, gap: 7 },
  nombre: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.secondary },
  detalle: { fontSize: 13, lineHeight: 19, color: colors.textSecondary },
});
