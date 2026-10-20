import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import * as Location from "expo-location";
import type { Coordenadas } from "../types/Coordenadas";

export function useUbicacion() {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [permiso, setPermiso] = useState<Location.PermissionStatus | null>(
    null,
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activo = useRef(false);
  const ocupado = useRef(false);

  const consultar = useCallback(async (solicitar: boolean) => {
    if (ocupado.current) return;
    ocupado.current = true;
    setCargando(true);
    setError(null);

    try {
      let estado = await Location.getForegroundPermissionsAsync();
      if (solicitar && !estado.granted) {
        if (!estado.canAskAgain) {
          await Linking.openSettings();
          return;
        }
        estado = await Location.requestForegroundPermissionsAsync();
      }
      if (!activo.current) return;
      setPermiso(estado.status);
      if (!estado.granted) {
        setCoordenadas(null);
        return;
      }
      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (activo.current)
        setCoordenadas({
          latitud: ubicacion.coords.latitude,
          longitud: ubicacion.coords.longitude,
        });
    } catch {
      if (activo.current) {
        setCoordenadas(null);
        setError(
          "No pudimos obtener tu ubicación. Revisá que esté activada e intentá de nuevo.",
        );
      }
    } finally {
      ocupado.current = false;
      if (activo.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    activo.current = true;
    void consultar(false);
    const suscripcion = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void consultar(false);
    });
    return () => {
      activo.current = false;
      suscripcion.remove();
    };
  }, [consultar]);

  return {
    coordenadas,
    permiso,
    cargando,
    error,
    solicitar: () => consultar(true),
  };
}
