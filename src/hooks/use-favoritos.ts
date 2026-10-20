import { useEffect, useState } from 'react';
import { leerFavorito, observarFavoritos } from '../services/favoritos.service';

export function useFavoritos(ids: string[]) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const clave = JSON.stringify(ids);

  useEffect(() => {
    let activo = true;
    let lectura = 0;
    const leer = async () => {
      const turno = ++lectura;
      try {
        const actuales: string[] = JSON.parse(clave);
        const estados = await Promise.all(actuales.map(leerFavorito));
        if (activo && turno === lectura) {
          setFavoritos(actuales.filter((_, indice) => estados[indice]));
          setError(false);
        }
      } catch {
        if (activo && turno === lectura) setError(true);
      } finally {
        if (activo && turno === lectura) setCargando(false);
      }
    };
    setCargando(true);
    void leer();
    const cancelar = observarFavoritos(() => { void leer(); });
    return () => { activo = false; cancelar(); };
  }, [clave, intento]);

  return { favoritos, cargando, error, reintentar: () => setIntento(anterior => anterior + 1) };
}
