import { createContext, useContext, type ReactNode } from 'react';
import { useSeguimientoUbicacion } from '../hooks/use-seguimiento-ubicacion';

const UbicacionContext = createContext<ReturnType<typeof useSeguimientoUbicacion> | null>(null);

export function UbicacionProvider({ children }: { children: ReactNode }) {
  const ubicacion = useSeguimientoUbicacion();

  return <UbicacionContext.Provider value={ubicacion}>{children}</UbicacionContext.Provider>;
}

export function useUbicacionCompartida() {
  const ubicacion = useContext(UbicacionContext);
  if (!ubicacion) throw new Error('useUbicacion debe usarse dentro de UbicacionProvider');

  return ubicacion;
}
