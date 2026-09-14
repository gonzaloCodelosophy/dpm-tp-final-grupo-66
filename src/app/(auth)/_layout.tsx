import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../styles/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="registro" options={{ title: 'Crear Cuenta' }} />
      <Stack.Screen name="recuperar-cuenta" options={{ title: 'Recuperar Contraseña' }} />
    </Stack>
  );
}
