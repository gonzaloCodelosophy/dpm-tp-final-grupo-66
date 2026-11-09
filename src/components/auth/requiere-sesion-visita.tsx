import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/auth.context';
import { EstadoPantalla } from '../estado-pantalla';

export function RequiereSesionVisita({ children }: { children: ReactNode }) {
  const { status, usuario } = useAuth();

  if (status === 'cargando') return <EstadoPantalla tipo="cargando" />;
  if (status !== 'autenticado' || !usuario) return <Redirect href="/(tabs)/recorrido" />;

  return <>{children}</>;
}
