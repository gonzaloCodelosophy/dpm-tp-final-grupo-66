import { useEffect } from 'react';
import { AppState } from 'react-native';
import { observarRed } from '../services/red.service';
import { sincronizarVisitas } from '../services/visitas.service';

export function useSincronizacionVisitas(usuarioId: string | null) {

  useEffect(() => {
    if (!usuarioId) return;
    let activo = true;
    let redAnterior: boolean | null = null;

    const enviar = () => {
      if (activo && AppState.currentState === 'active' && redAnterior !== false) {
        void sincronizarVisitas(usuarioId).catch(error => console.error('No se pudieron sincronizar las visitas', error));
      }
    };

    enviar();
    const red = observarRed(estado => {
      const conectada = estado.conectada === false || estado.internetAlcanzable === false ? false : estado.conectada;
      const recuperada = redAnterior === false && conectada === true;
      redAnterior = conectada;
      if (recuperada) enviar();
    });
    const app = AppState.addEventListener('change', estado => { if (estado === 'active') enviar(); });
    const reintento = setInterval(enviar, 30000);

    return () => { activo = false; red(); app.remove(); clearInterval(reintento); };
  }, [usuarioId]);
}
