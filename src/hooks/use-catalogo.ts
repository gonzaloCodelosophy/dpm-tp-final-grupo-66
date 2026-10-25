import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { actualizarCatalogo, cargarMasLugares, cargarMasCategorias, leerCatalogoLocal, observarEstadoCatalogo } from '../services/catalogo.service';
import { observarRed } from '../services/red.service';
import { errorDatos } from '../services/errores';

import type { Catalogo, EstadoRecurso } from '../types/persistencia';

//Agrego 2 states nuevos para manejar la paginacion.

export function useCatalogo() {

  const [datos, setDatos] = useState<Catalogo | null>(null);
  const [hayMasLugares, setHayMasLugares] = useState(false);
  const [hayMasCategorias, setHayMasCategorias] = useState(false);
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
        const local = await leerCatalogoLocal();
        if (montado) {
          setDatos(local.disponible ? local.datos : null);
          setHayMasLugares(local.siguientePaginaLugares !== null);
          setHayMasCategorias(local.siguientePaginaCategorias !== null);
        }
      } catch (error) {
        if (montado) setEstado(anterior => ({ ...anterior, error: errorDatos(error) }));
      } finally { if (montado) setCargando(false); }
    };

    const desuscribir = observarEstadoCatalogo(nuevo => {
      if (!montado) return;
      setEstado(nuevo);
      falloActual = nuevo.error !== null;
      if (nuevo.ultimaActualizacion && nuevo.ultimaActualizacion !== fechaObservada) {
        fechaObservada = nuevo.ultimaActualizacion;
        void leer();
      }
    });

    // Mostrar primero SQLite. La petición no retrasa la lectura local.
    void leer().then(() => { if (montado) void actualizarCatalogo(); });

    const red = observarRed( nuevo => {
      const disponible = nuevo.conectada === false || nuevo.internetAlcanzable === false ? false : nuevo.conectada === true ? true : null;
      if (montado) setSinRed(disponible === false);
      if (redAnterior === false && disponible === true) void actualizarCatalogo();
      redAnterior = disponible;
    });

    // Recuperar el servidor aunque la red del dispositivo no cambie.
    const reintento = setInterval(() => {
      if (montado && AppState.currentState === 'active' && redAnterior !== false && falloActual) void actualizarCatalogo();
    }, 30000);

    const app = AppState.addEventListener('change', siguiente => {
      if (siguiente === 'active') void actualizarCatalogo();
    });

    return () => { montado = false; clearInterval(reintento); desuscribir(); red(); app.remove(); };

  }, []);

  return { datos, hayMasLugares, hayMasCategorias, cargarMasLugares, cargarMasCategorias, actualizando: estado.actualizando, error: estado.error, reintentar: actualizarCatalogo, sinConexion: (sinRed || estado.error?.tipo === 'red'), cargando: cargando || (datos === null && estado.actualizando) };
}
