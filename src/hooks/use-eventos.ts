import type { Evento } from "../types/evento";
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { actualizarEventos, cargarMasEventos, leerEventosLocal, observarEstadoEventos } from '../services/eventos.service';
import { observarRed } from '../services/red.service';
import { errorDatos } from '../services/errores';
import type { EstadoRecurso } from '../types/persistencia';

//agrego 1 state nuevo para paginacion de eventos.
export function useEventos() {


  const [datos, setDatos] = useState<Evento[] | null>(null);
  const [hayMas, setHayMas] = useState(false);
  const [sinRed, setSinRed] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<EstadoRecurso>({ disponible: false, actualizando: false, ultimaActualizacion: null, error: null });

  useEffect(() => {
    let montado = true;
    let fechaObservada: string | null = null;
    let redAnterior: boolean | null = null;
    let falloActual = false;

    const leer = async () => {
      try {
        const local = await leerEventosLocal();
        if (montado) {
          setDatos(local.disponible ? local.datos : null);
          setHayMas(local.siguientePagina !== null);
        }
      } catch (error) {
        if (montado) setEstado(anterior => ({ ...anterior, error: errorDatos(error) }));
      } finally {
        if (montado) setCargando(false);
      }
    };

    const desuscribir = observarEstadoEventos(nuevo => {
      if (!montado) return;
      setEstado(nuevo);
      falloActual = nuevo.error !== null;
      if (nuevo.ultimaActualizacion && nuevo.ultimaActualizacion !== fechaObservada) {
        fechaObservada = nuevo.ultimaActualizacion;
        void leer();
      }
    });

    // Mostrar primero SQLite. La petición no retrasa la lectura local.
    void leer().then(() => {
      if (montado) void actualizarEventos();
    });

    const red = observarRed(nuevo => {
      const disponible = nuevo.conectada === false || nuevo.internetAlcanzable === false ? false : nuevo.conectada === true ? true : null;
      if (montado) setSinRed(disponible === false);
      if (redAnterior === false && disponible === true) void actualizarEventos();
      redAnterior = disponible;
    });

    // Recuperar el servidor aunque la red del dispositivo no cambie.
    const reintento = setInterval(() => {
      if (montado && AppState.currentState === 'active' && redAnterior !== false && falloActual) void actualizarEventos();
    }, 30000);

    const app = AppState.addEventListener('change', siguiente => {
      if (siguiente === 'active') void actualizarEventos();
    });

    return () => {
      montado = false;
      clearInterval(reintento);
      desuscribir();
      red();
      app.remove();
    };
  }, []);

  return { datos, hayMas, cargarMas: cargarMasEventos, actualizando: estado.actualizando, error: estado.error, reintentar: actualizarEventos, sinConexion: datos !== null && (sinRed || estado.error?.tipo === 'red' || estado.error?.tipo === 'http'), cargando: cargando || (datos === null && estado.actualizando) };
}
