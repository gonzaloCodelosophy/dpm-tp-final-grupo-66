import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { HapticTab } from '../../components/haptic-tab';
import { colorsInicio as colors } from '../../styles/inicio';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function IconoTab({ focused, icono, activo }: {
  focused: boolean;
  icono: IconName;
  activo: IconName;
}) {
  return (
    <View style={[styles.icono, focused && styles.iconoActivo]}>
      <Ionicons
        size={22}
        name={focused ? activo : icono}
        color={focused ? colors.primary : colors.secondary}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const espacioInferior = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [styles.barra, {
          height: 64 + espacioInferior,
          paddingBottom: espacioInferior,
        }],
        tabBarItemStyle: styles.item,
        tabBarLabelStyle: styles.etiqueta,
        tabBarIconStyle: styles.contenedorIcono,
      }}>
      <Tabs.Screen name="index" options={{
        title: 'Inicio',
        tabBarIcon: ({ focused }) => <IconoTab focused={focused} icono="home-outline" activo="home" />,
      }} />
      <Tabs.Screen name="agenda" options={{
        title: 'Agenda',
        tabBarIcon: ({ focused }) => <IconoTab focused={focused} icono="calendar-outline" activo="calendar" />,
      }} />
      <Tabs.Screen name="explore" options={{
        title: 'Explorar',
        tabBarIcon: ({ focused }) => <IconoTab focused={focused} icono="compass-outline" activo="compass" />,
      }} />
      <Tabs.Screen name="favoritos" options={{
        title: 'Favoritos',
        tabBarIcon: ({ focused }) => <IconoTab focused={focused} icono="heart-outline" activo="heart" />,
      }} />
      <Tabs.Screen name="perfil" options={{
        title: 'Perfil',
        tabBarIcon: ({ focused }) => <IconoTab focused={focused} icono="person-outline" activo="person" />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  item: { paddingHorizontal: 2 },
  contenedorIcono: { width: 48, height: 32 },
  icono: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoActivo: { backgroundColor: colors.primaryLight },
  etiqueta: { fontSize: 10, fontWeight: '600', marginTop: 3 },
});
