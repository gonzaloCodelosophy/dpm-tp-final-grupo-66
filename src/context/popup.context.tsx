import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTema } from './tema.context';
import { fuenteTitulo } from '../styles/inicio';

type AccionPopup = { text?: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' };
type OpcionesPopup = { cancelable?: boolean; onDismiss?: () => void };
type Aviso = { titulo: string; mensaje?: string; acciones: AccionPopup[]; opciones: OpcionesPopup };
type MostrarPopup = (titulo: string, mensaje?: string, acciones?: AccionPopup[], opciones?: OpcionesPopup) => void;
const PopupContext = createContext<MostrarPopup | null>(null);

export function PopupProvider({ children }: { children: ReactNode }) {
  const { colorsInicio: colors, oscuro } = useTema();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const pendientes = useRef<Aviso[]>([]);
  const actual = useRef<Aviso | null>(null);
  const mostrarPopup = useCallback<MostrarPopup>((titulo, mensaje, acciones, opciones = {}) => {
    const nuevo = { titulo, mensaje, acciones: acciones?.length ? acciones : [{ text: 'Aceptar' }], opciones };
    if (actual.current) pendientes.current.push(nuevo);
    else { actual.current = nuevo; setAviso(nuevo); }
  }, []);

  function terminar(accion?: AccionPopup) {
    const anterior = actual.current;
    if (!anterior) return;
    const siguiente = pendientes.current.shift() ?? null;
    actual.current = siguiente;
    setAviso(siguiente);
    if (accion) accion.onPress?.();
    else anterior.opciones.onDismiss?.();
  }
  function cerrar() {
    if (aviso?.opciones.cancelable === false) return;
    terminar(aviso?.acciones.find(accion => accion.style === 'cancel'));
  }

  return <PopupContext.Provider value={mostrarPopup}>
    {children}
    <Modal visible={aviso !== null} transparent animationType="fade" onRequestClose={cerrar}>
      <View style={[styles.fondo, { backgroundColor: oscuro ? 'rgba(0, 0, 0, 0.75)' : 'rgba(7, 59, 83, 0.45)' }]}>
        <Pressable style={StyleSheet.absoluteFillObject} accessibilityRole="button" accessibilityLabel="Cerrar aviso" disabled={aviso?.opciones.cancelable === false} onPress={cerrar} />
        <View style={[styles.tarjeta, { backgroundColor: oscuro ? colors.surface : colors.background, borderColor: colors.border, shadowColor: oscuro ? '#000000' : colors.secondary }]} accessibilityViewIsModal>
          <View style={styles.cabecera}>
            <Text accessibilityRole="header" style={[styles.titulo, { color: colors.secondary }]}>{aviso?.titulo}</Text>
            {aviso?.opciones.cancelable !== false && <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={8} onPress={cerrar} style={styles.cerrar}>
              <Ionicons name="close" size={24} color={colors.secondary} />
            </Pressable>}
          </View>
          <ScrollView style={styles.mensajeScroll} contentContainerStyle={styles.mensajeContenido}>
            {!!aviso?.mensaje && <Text style={[styles.mensaje, { color: colors.textSecondary }]}>{aviso.mensaje}</Text>}
          </ScrollView>
          <View style={styles.acciones}>
            {aviso?.acciones.map((accion, indice) => <Pressable key={indice} accessibilityRole="button" onPress={() => terminar(accion)} style={[styles.boton, { backgroundColor: accion.style === 'cancel' ? 'transparent' : colors.primarySolid }]}>
              <Text style={[styles.botonTexto, { color: accion.style === 'cancel' ? colors.secondary : colors.onPrimary }]}>{accion.text ?? 'Aceptar'}</Text>
            </Pressable>)}
          </View>
        </View>
      </View>
    </Modal>
  </PopupContext.Provider>;
}

export function usePopup() {
  const mostrar = useContext(PopupContext);
  if (!mostrar) throw new Error('usePopup debe usarse dentro de PopupProvider');
  return mostrar;
}

const styles = StyleSheet.create({
  fondo: { flex: 1, justifyContent: 'center', padding: 20 },
  tarjeta: { width: '100%', maxWidth: 440, maxHeight: '90%', alignSelf: 'center', borderRadius: 24, padding: 22, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  titulo: { flex: 1, fontFamily: fuenteTitulo, fontSize: 21, fontWeight: '700' },
  cerrar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  mensajeScroll: { flexShrink: 1 },
  mensajeContenido: { paddingBottom: 22 },
  mensaje: { fontSize: 15, lineHeight: 22 },
  acciones: { gap: 8 },
  boton: { minHeight: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 12 },
  botonTexto: { fontSize: 16, fontWeight: '700' },
});
