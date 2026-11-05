import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import * as Location from "expo-location";
import type { Coordenadas } from "../types/Coordenadas";

export function useUbicacion() {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [permiso, setPermiso] = useState<Location.PermissionStatus | null>(
    null,
  );
  const [puedeSolicitar, setPuedeSolicitar] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activo = useRef(false);
  const ocupado = useRef(false);

  const consultar = useCallback(async (solicitar: boolean): Promise<Coordenadas | null> => {
    if (ocupado.current || !activo.current) return null;
    ocupado.current = true;
    setCargando(true);
    setError(null);

    try {
      let estado = await Location.getForegroundPermissionsAsync();
      if (!activo.current) return null;
      setPermiso(estado.status);
      setPuedeSolicitar(estado.canAskAgain);

      if (solicitar && !estado.granted) {
        if (!estado.canAskAgain) {
          await Linking.openSettings();
          return null;
        }
        estado = await Location.requestForegroundPermissionsAsync();
      }
      if (!activo.current) return null;
      setPermiso(estado.status);
      setPuedeSolicitar(estado.canAskAgain);
      if (!estado.granted) {
        setCoordenadas(null);
        return null;
      }

      if (!await Location.hasServicesEnabledAsync()) throw new Error("Ubicación desactivada");
      if (!activo.current) return null;

      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!activo.current) return null;

      const coordenadasActuales = {
        latitud: ubicacion.coords.latitude,
        longitud: ubicacion.coords.longitude,
      };

      setCoordenadas(coordenadasActuales);
      return coordenadasActuales;
    } catch {
      if (activo.current) {
        setCoordenadas(null);
        setError(
          "No pudimos obtener tu ubicación. Revisá que esté activada e intentá de nuevo.",
        );
      }
      return null;
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
    puedeSolicitar,
    cargando,
    error,
    solicitar: () => consultar(true),
  };
}
