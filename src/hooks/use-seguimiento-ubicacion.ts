import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';
import type { Coordenadas } from '../types/Coordenadas';

// Una sola instancia, compartida por el proveedor de ubicación.
export function useSeguimientoUbicacion() {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [permiso, setPermiso] = useState<Location.PermissionStatus | null>(null);
  const [puedeSolicitar, setPuedeSolicitar] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enPrimerPlano, setEnPrimerPlano] = useState(AppState.currentState === 'active');
  const [precision, setPrecision] = useState<number | null>(null);
  const [fechaPosicion, setFechaPosicion] = useState<number | null>(null);
  const activo = useRef(false);
  const ocupado = useRef(false);
  const revision = useRef(0);
  const ultima = useRef<Coordenadas | null>(null);

  const actualizar = useCallback((posicion: Location.LocationObject) => {
    const { latitude, longitude, accuracy } = posicion.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const nueva = { latitud: latitude, longitud: longitude };
    revision.current += 1;
    ultima.current = nueva;
    setCoordenadas(nueva);
    setPrecision(accuracy);
    setFechaPosicion(posicion.timestamp);
    setError(null);
  }, []);

  const consultar = useCallback(async (solicitar: boolean): Promise<Coordenadas | null> => {
    if (ocupado.current || !activo.current) return null;
    ocupado.current = true;
    setCargando(true);
    setError(null);
    let tiempo: ReturnType<typeof setTimeout> | undefined;
    const revisionInicial = revision.current;

    try {
      let estado = await Location.getForegroundPermissionsAsync();
      if (!activo.current) return null;
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
        ultima.current = null;
        setCoordenadas(null);
        return null;
      }
      if (!await Location.hasServicesEnabledAsync()) throw new Error('Ubicación desactivada');
      const posicion = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<never>((_, rechazar) => {
          tiempo = setTimeout(() => rechazar(new Error('Tiempo de ubicación agotado')), 15000);
        }),
      ]);
      if (!activo.current || AppState.currentState !== 'active') return null;
      // No reemplazar una actualización del observador por una lectura anterior.
      if (revision.current === revisionInicial) actualizar(posicion);
      return ultima.current;
    } catch {
      if (activo.current && revision.current === revisionInicial) {
        setError('No pudimos obtener tu ubicación. Revisá que esté activada e intentá de nuevo.');
      }
      return null;
    } finally {
      if (tiempo) clearTimeout(tiempo);
      ocupado.current = false;
      if (activo.current) setCargando(false);
    }
  }, [actualizar]);

  useEffect(() => {
    activo.current = true;
    const app = AppState.addEventListener('change', estado => setEnPrimerPlano(estado === 'active'));
    return () => { activo.current = false; app.remove(); };
  }, []);

  useEffect(() => {
    if (enPrimerPlano) void consultar(false);
  }, [enPrimerPlano, consultar]);

  useEffect(() => {
    if (!enPrimerPlano || permiso !== Location.PermissionStatus.GRANTED) return;
    let vigente = true;
    let suscripcion: Location.LocationSubscription | undefined;

    void Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 5000 },
      posicion => { if (vigente && AppState.currentState === 'active') actualizar(posicion); },
      () => {
        if (vigente) setError('No pudimos actualizar tu ubicación. Revisá el GPS.');
      },
    ).then(nueva => {
      if (vigente) suscripcion = nueva;
      else nueva.remove();
    }).catch(() => {
      if (vigente) setError('No pudimos iniciar el seguimiento de ubicación.');
    });

    return () => { vigente = false; suscripcion?.remove(); };
  }, [enPrimerPlano, permiso, actualizar]);

  const solicitar = useCallback(() => consultar(true), [consultar]);

  return { coordenadas, permiso, puedeSolicitar, cargando, error, solicitar, enPrimerPlano, precision, fechaPosicion };
}
