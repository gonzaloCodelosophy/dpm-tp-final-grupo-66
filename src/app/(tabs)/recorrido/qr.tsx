import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EstadoPantalla } from '../../../components/estado-pantalla';
import { resolverLugarQr } from '../../../services/qr.service';
import { useTema } from '../../../context/tema.context';

// Punto de entrada del lector interno y de los enlaces turismocolon://recorrido/qr.
export default function AbrirRegistroQr() {
  const { codigo } = useLocalSearchParams<{ codigo?: string }>();
  const router = useRouter();
  const { colorsInicio: colors } = useTema();
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setError(null);
    if (typeof codigo !== 'string') { setError('Falta el código del lugar.'); return; }
    void resolverLugarQr(codigo).then(({ codigo: valido, lugar }) => {
      if (vigente) router.replace({ pathname: '/(tabs)/recorrido/recuerdo-visita', params: { lugarId: lugar.id, codigoQr: valido } });
    }).catch(fallo => {
      if (vigente) setError(fallo instanceof Error ? fallo.message : 'No pudimos consultar el QR.');
    });

    return () => { vigente = false; };
  }, [codigo, router, intento]);

  return <View style={[styles.container, { backgroundColor: colors.background }]}>
    {error ? <EstadoPantalla tipo="error" titulo="No pudimos abrir el lugar" mensaje={error} onPress={() => setIntento(valor => valor + 1)} /> : <EstadoPantalla tipo="cargando" titulo="Buscando el lugar del QR…" />}
  </View>;
}

const styles = StyleSheet.create({ container: { flex: 1 } });
