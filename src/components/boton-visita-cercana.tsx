import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../context/auth.context';
import { ultimaVisitaLocal, type VisitaGuardada } from '../data/repositories/visitas.repository';
import { observarVisitas, registrarVisitaCercana, registrarVisitaManual, reintentarVisita } from '../services/visitas.service';
import type { Lugar } from '../types/Lugar';
import { borderRadius, colors, spacing } from '../styles/theme';

type ModoRegistro = 'cercania' | 'manual';

export function BotonRegistrarVisita({ lugar, modo }: { lugar: Lugar; modo: ModoRegistro }) {

  const { usuario, status } = useAuth();
  const usuarioId = status === 'autenticado' ? usuario?.id : undefined;
  const [ultima, setUltima] = useState<VisitaGuardada | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const enCurso = useRef(false);
  const actual = ultima?.visita.usuarioId === usuarioId && ultima?.visita.lugarId === lugar.id ? ultima : null;

  useEffect(() => {
    let activo = true;
    if (!usuarioId) return;

    const leer = () => {
      void ultimaVisitaLocal(usuarioId, lugar.id).then(visita => { if (activo) setUltima(visita); }).catch(() => undefined);
    };

    leer();
    const cancelar = observarVisitas(id => { if (id === usuarioId) leer(); });

    return () => { activo = false; cancelar(); };
  }, [usuarioId, lugar.id]);

  const registrar = async () => {
    if (!usuarioId || enCurso.current) return;
    enCurso.current = true;
    setOcupado(true);

    try {
      if (modo === 'manual') await registrarVisitaManual(lugar, usuarioId);
      else await registrarVisitaCercana(lugar, usuarioId);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (error) {
      Alert.alert('Registrar visita', error instanceof Error ? error.message : 'No pudimos guardar la visita. Intentá de nuevo.');
    } finally {
      enCurso.current = false;
      setOcupado(false);
    }
  };

  const pulsar = () => {
    if (!usuarioId) {
      router.push('/(auth)/login');
      return;
    }
    if (actual) {
      Alert.alert('Registrar otra visita', '¿Querés registrar una nueva visita a este lugar?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Registrar', onPress: () => { void registrar(); } },
      ]);
    } else void registrar();
  };

  const reintentar = async () => {
    if (!usuarioId || !actual || enCurso.current) return;
    enCurso.current = true;
    setOcupado(true);
    try {
      await reintentarVisita(actual.visita.id, usuarioId);
    } catch {
      Alert.alert('Visita guardada', 'No se pudo enviar. La visita sigue guardada en el teléfono.');
    } finally { enCurso.current = false; setOcupado(false); }
  };

  return (
    <View style={styles.contenedor}>
      <Pressable accessibilityRole="button" accessibilityState={{ busy: ocupado, disabled: ocupado }} disabled={ocupado} onPress={pulsar} style={[styles.boton, modo === 'manual' && styles.botonManual]}>
        <Text style={styles.texto}>{ocupado ? (modo === 'manual' ? 'Guardando visita…' : 'Comprobando visita…') : !usuarioId ? 'Ingresá para registrar una visita' : actual ? 'Registrar otra visita' : modo === 'manual' ? 'Registrar visita' : 'Registrar visita por cercanía'}</Text>
      </Pressable>
      {actual && <Text style={styles.estado} accessibilityLiveRegion="polite">{actual.visita.sincronizada ? (modo === 'manual' ? 'Ya visitaste este lugar.' : 'Visita registrada.') : actual.error ? actual.error.mensaje : 'Visita guardada. Se enviará cuando haya conexión.'}</Text>}
      {actual && !actual.visita.sincronizada && (
        <Pressable accessibilityRole="button" disabled={ocupado} onPress={() => { void reintentar(); }} style={styles.reintentar}>
          <Text style={styles.estado}>Reintentar envío</Text>
        </Pressable>
      )}
    </View>
  );
}

export function BotonVisitaCercana({ lugar }: { lugar: Lugar }) {

  return <BotonRegistrarVisita lugar={lugar} modo="cercania" />;
}

const styles = StyleSheet.create({
  contenedor: { gap: spacing.xs, marginTop: spacing.sm },
  boton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.pill, backgroundColor: colors.secondary, paddingHorizontal: spacing.sm },
  botonManual: { backgroundColor: colors.primary },
  texto: { color: colors.surface, fontWeight: '600', textAlign: 'center' },
  estado: { color: colors.textSecondary, textAlign: 'center', fontSize: 13 },
  reintentar: { minHeight: 44, justifyContent: 'center' },
});
