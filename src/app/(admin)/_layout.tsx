import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth.context';
import { useTema } from '../../context/tema.context';
export default function AdminLayout() {
 const { usuario, status } = useAuth();
 const { colors } = useTema();
 const insets = useSafeAreaInsets();
 if (status === 'cargando' || status === 'biometria_requerida') return <ActivityIndicator style={{ flex: 1 }} />;
 if (status !== 'autenticado') return <Redirect href="/(auth)/login" />;
 if (usuario?.rol !== 'admin') return <Redirect href="/(tabs)" />;
 return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textSecondary, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 52 + insets.bottom, paddingBottom: insets.bottom, paddingTop: 4 }, tabBarLabelStyle: { fontSize: 11 } }}>
 <Tabs.Screen name="index" options={{ title: 'Eventos', tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={21} color={color} /> }} />
 <Tabs.Screen name="cuenta" options={{ title: 'Cuenta', tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={21} color={color} /> }} />
 </Tabs>;
}
