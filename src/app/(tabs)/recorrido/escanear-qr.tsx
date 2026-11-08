import { useEffect, useRef, useState } from 'react';
import { AppState, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { leerCodigoLugar } from '../../../services/qr.service';
import { useTema } from '../../../context/tema.context';
import { EstadoPantalla } from '../../../components/estado-pantalla';

export default function EscanearQrScreen() {
  const router = useRouter();
  const { colorsInicio: colors } = useTema();
  const enfocada = useIsFocused();
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  const [activa, setActiva] = useState(AppState.currentState === 'active');
  const [pausada, setPausada] = useState(false);
  const procesando = useRef(false);

  useEffect(() => {
    const app = AppState.addEventListener('change', estado => {
      setActiva(estado === 'active');
      if (estado === 'active') void consultarPermiso();
    });
    return () => app.remove();
  }, [consultarPermiso]);

  function escanear({ data }: BarcodeScanningResult) {
    if (procesando.current) return;
    procesando.current = true;
    setPausada(true);
    const codigo = leerCodigoLugar(data);
    if (!codigo) {
      Alert.alert('QR no reconocido', 'Escaneá el QR de un lugar de Colón.', [{ text: 'Volver a escanear', onPress: () => { procesando.current = false; setPausada(false); } }], { cancelable: false });
      return;
    }
    router.replace({ pathname: '/(tabs)/recorrido/qr', params: { codigo } });
  }

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
    <View style={styles.cabecera}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.volver}><Ionicons name="chevron-back" size={24} color={colors.secondary} /></Pressable>
      <Text style={{ color: colors.secondary, fontSize: 20, fontWeight: '700' }}>Escanear código QR</Text>
    </View>
    {!permiso ? <EstadoPantalla tipo="cargando" /> : !permiso.granted ? (
      <EstadoPantalla tipo="vacio" titulo="Permití usar la cámara" mensaje="La usamos para leer el código del lugar y abrir el registro de tu visita." accion={permiso.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'} onPress={() => {
        void (permiso.canAskAgain ? pedirPermiso() : Linking.openSettings()).catch(() => Alert.alert('Cámara', 'No pudimos abrir los permisos. Intentá de nuevo.'));
      }} />
    ) : <>
      <View style={styles.visor}>
        {enfocada && activa && !pausada && <CameraView style={StyleSheet.absoluteFillObject} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={escanear} onMountError={() => Alert.alert('Cámara no disponible', 'Revisá los permisos y volvé a abrir el lector.')} />}
        <View pointerEvents="none" style={styles.marco} />
      </View>
      <Text style={[styles.ayuda, { color: colors.textSecondary }]}>Apuntá al QR del lugar. Se abrirá el formulario para agregar tu recuerdo.</Text>
    </>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  cabecera: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 14 },
  volver: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  visor: { flex: 1, margin: 18, borderRadius: 24, overflow: 'hidden', backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' },
  marco: { width: '70%', aspectRatio: 1, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 18 },
  ayuda: { fontSize: 14, lineHeight: 21, paddingHorizontal: 24, paddingBottom: 24, textAlign: 'center' },
});
