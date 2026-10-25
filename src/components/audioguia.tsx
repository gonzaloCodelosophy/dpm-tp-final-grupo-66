import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { borderRadius, colors, fontSize, spacing } from '../styles/theme';

import { descargarAudio, obtenerAudioLocal, observarAudios } from '../services/audios.service';

function tiempo(segundos: number): string {

  const total = Math.max(0, Math.floor(segundos || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function Audioguia({ url }: { url: string }) {

  //@todos, fijense si les da error en la audioguia al volver hacia atras.
  const enfocada = useIsFocused();
  const puedeReproducir = useRef(false);

  useLayoutEffect(() => {
    puedeReproducir.current = enfocada;

    return () => {
      puedeReproducir.current = false;
    };
  }, [enfocada]);

  const player = useAudioPlayer(null);
  const estado = useAudioPlayerStatus(player);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const progreso = estado.duration > 0 ? Math.min(1, estado.currentTime / estado.duration) : 0;

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const uri = await obtenerAudioLocal(url) ?? await descargarAudio(url);
        if (activo) {
          player.replace({ uri });
          setError(null);
        }
      } catch {
        if (activo) setError('Audioguía no disponible. Conectate para descargarla.');
      }
    };

    const cancelar = observarAudios(actual => {
      if (actual === url) void cargar();
    });

    void cargar();
    return () => { activo = false; cancelar(); };
  }, [url, player]);

  useEffect(() => {
    // Pausar si la pantalla sigue montada pero pierde el foco.
    // Al desmontar, useAudioPlayer libera el audio: no llamar a pause en el cleanup.
    // @todos, puede que el sonido quede reproduciendo al volver atras, probar con la app compilada.
    if (!enfocada) player.pause();
    setOcupado(false);
  }, [enfocada, player]);

  const reproducir = async () => {
    
    //@todos no estoy seguro donde ocurre el error, meto la comprobacion de puedeReproducir, ayudenve a validar luego
    if (!puedeReproducir.current || !estado.isLoaded || ocupado) return;

    setOcupado(true);
    setError(null);

    try {
      if (estado.playing) {
        player.pause();
      } else {
        await setAudioModeAsync({ playsInSilentMode: true });
        if (!puedeReproducir.current) return;

        if (estado.didJustFinish || (estado.duration > 0 && estado.currentTime >= estado.duration)) {
          await player.seekTo(0);
        }

        if (puedeReproducir.current) player.play();
      }
    } catch {
      if (puedeReproducir.current) setError('No se pudo reproducir la audioguía.');
    } finally {
      if (puedeReproducir.current) setOcupado(false);
    }
  };

  const desplazar = async (segundos: number) => {
    if (!puedeReproducir.current || !estado.isLoaded || ocupado) return;

    setOcupado(true);
    setError(null);

    try {
      await player.seekTo(Math.max(0, Math.min(estado.duration, estado.currentTime + segundos)));
    } catch {
      if (puedeReproducir.current) setError('No se pudo cambiar la posición del audio.');
    } finally {
      if (puedeReproducir.current) setOcupado(false);
    }
  };

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Ionicons name="headset-outline" size={24} color={colors.secondary} />
        <Text style={styles.titulo}>Audioguía</Text>
      </View>

      <View style={styles.controles}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retroceder 5 segundos"
          disabled={!estado.isLoaded || ocupado}
          onPress={() => { void desplazar(-5); }}
          style={styles.boton}
        >
          <Ionicons name="play-back-outline" size={24} color={colors.secondary} />
          <Text style={styles.texto}>5 s</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={estado.playing ? 'Pausar audioguía' : 'Reproducir audioguía'}
          disabled={!estado.isLoaded || ocupado}
          onPress={() => { void reproducir(); }}
          style={[styles.reproducir, (!estado.isLoaded || ocupado) && styles.deshabilitado]}
        >
          <Ionicons name={estado.playing ? 'pause' : 'play'} size={28} color={colors.surface} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adelantar 5 segundos"
          disabled={!estado.isLoaded || ocupado}
          onPress={() => { void desplazar(5); }}
          style={styles.boton}
        >
          <Ionicons name="play-forward-outline" size={24} color={colors.secondary} />
          <Text style={styles.texto}>5 s</Text>
        </Pressable>
      </View>

      <View style={styles.barra}>
        <View style={[styles.progreso, { width: `${progreso * 100}%` }]} />
      </View>

      <View style={styles.tiempos}>
        <Text style={styles.texto}>{tiempo(estado.currentTime)}</Text>
        <Text style={styles.texto}>{tiempo(estado.duration)}</Text>
      </View>

      {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { 
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  encabezado: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  titulo: { 
    color: colors.secondary,
    fontSize: fontSize.subtitle,
    fontWeight: '700'
  },
  controles: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  boton: { 
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reproducir: { 
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  deshabilitado: { 
    opacity: 0.5
  },
  barra: { 
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden'
  },
  progreso: { 
    height: '100%',
    backgroundColor: colors.primary
  },
  tiempos: { 
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  texto: { 
    fontSize: fontSize.caption,
    color: colors.textSecondary
  },
  error: { 
    color: colors.error,
    fontSize: fontSize.caption
  },
});
