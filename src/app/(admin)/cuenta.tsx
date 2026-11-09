import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth.context';
import { useTema } from '../../context/tema.context';
export default function CuentaAdmin() {
 const { usuario, cerrarSesion } = useAuth();
 const { colors } = useTema();
 const router = useRouter();
 const [ocupado, setOcupado] = useState(false);
 const [error, setError] = useState('');
 async function salir() {
  setOcupado(true);
  try { await cerrarSesion(); router.replace('/(auth)/login'); }
  catch { setError('No se pudo cerrar la sesión. Probá de nuevo.'); }
  finally { setOcupado(false); }
 }
 return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
 <Text style={{ fontSize: 26, fontWeight: '600', color: colors.text }}>Cuenta</Text>
 <View style={{ gap: 8, marginVertical: 28 }}>
 <Text style={{ fontSize: 17, color: colors.text }}>{usuario?.nombre}</Text>
 <Text style={{ color: colors.textSecondary }}>{usuario?.email}</Text>
 <Text style={{ color: colors.textSecondary }}>Administrador</Text>
 </View>
 {error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}
 <Pressable accessibilityRole="button" disabled={ocupado} onPress={salir} style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={{ color: colors.error }}>{ocupado ? 'Cerrando sesión…' : 'Cerrar sesión'}</Text></Pressable>
 </SafeAreaView>;
}
