import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';

interface Props {
  onCerrar: () => void;
  onFoto: (foto: ImagePickerAsset) => void;
}

export function CamaraVisita({ onCerrar, onFoto }: Props) {
  const camara = useRef<CameraView>(null);
  const capturando = useRef(false);
  const vigente = useRef(true);
  const enfocada = useIsFocused();
  const [activa, setActiva] = useState(AppState.currentState === 'active');
  const [lista, setLista] = useState(false);
  const [ocupada, setOcupada] = useState(false);
  const [foto, setFoto] = useState<ImagePickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vigente.current = true;
    const suscripcion = AppState.addEventListener('change', estado => {
      setActiva(estado === 'active');
      setLista(false);
    });
    return () => { vigente.current = false; suscripcion.remove(); };
  }, []);

  async function sacarFoto() {
    if (!camara.current || !lista || capturando.current) return;
    capturando.current = true;
    setOcupada(true);
    setError(null);
    try {
      const captura = await camara.current.takePictureAsync({ quality: 0.8 });
      if (!vigente.current) return;
      if (!captura) throw new Error('No pudimos sacar la foto. Intentá de nuevo.');
      setFoto({ uri: captura.uri, width: captura.width, height: captura.height, mimeType: 'image/jpeg' });
      setLista(false);
    } catch {
      if (vigente.current) setError('No pudimos sacar la foto. Intentá de nuevo.');
    } finally {
      capturando.current = false;
      if (vigente.current) setOcupada(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onCerrar}>
      <SafeAreaView style={styles.fondo}>
        <View style={styles.cabecera}>
          <Text accessibilityRole="header" style={styles.titulo}>Foto de la visita</Text>
          <Pressable accessibilityRole="button" onPress={onCerrar} style={styles.boton}><Text style={styles.texto}>Cerrar</Text></Pressable>
        </View>
        <View style={styles.visor}>
          {foto ? <Image source={{ uri: foto.uri }} style={StyleSheet.absoluteFillObject} contentFit="contain" />
            : enfocada && activa && <CameraView ref={camara} style={StyleSheet.absoluteFillObject} facing="back" mode="picture"
              onCameraReady={() => setLista(true)}
              onMountError={() => { setLista(false); setError('No pudimos abrir la cámara. Cerrá e intentá de nuevo.'); }} />}
        </View>
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <View style={styles.controles}>
          {foto ? <>
            <Pressable accessibilityRole="button" onPress={() => { setFoto(null); setError(null); }} style={styles.boton}><Text style={styles.texto}>Volver a sacar</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => onFoto(foto)} style={styles.boton}><Text style={styles.texto}>Usar foto</Text></Pressable>
          </> : <Pressable accessibilityRole="button" disabled={!lista || ocupada || !activa || !enfocada} onPress={() => { void sacarFoto(); }} style={[styles.boton, (!lista || ocupada || !activa) && styles.deshabilitado]}>
            {ocupada ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.texto}>Sacar foto</Text>}
          </Pressable>}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#111111' },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  titulo: { flex: 1, color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  visor: { flex: 1 },
  controles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 20, gap: 12 },
  boton: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, backgroundColor: '#235C77', alignItems: 'center', justifyContent: 'center' },
  texto: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  error: { color: '#FFFFFF', fontSize: 16, padding: 16 },
  deshabilitado: { opacity: 0.5 },
});
