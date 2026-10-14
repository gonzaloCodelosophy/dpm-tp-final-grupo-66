import * as Network from 'expo-network';

export interface EstadoRed { conectada: boolean | null; internetAlcanzable: boolean | null }

export function observarRed(oyente: (estado: EstadoRed) => void): () => void {

  let activa = true;
  let eventoRecibido = false;

  const publicar = (red: Network.NetworkState) => {
    if (activa) oyente({ conectada: red.isConnected ?? null, internetAlcanzable: red.isInternetReachable ?? null });
  };

  oyente({ conectada: null, internetAlcanzable: null });

  const suscripcion = Network.addNetworkStateListener(red => {
    eventoRecibido = true;
    publicar(red);
  });

  void Network.getNetworkStateAsync().then(red => {
    if (!eventoRecibido) publicar(red);
  }).catch(() => {
    // Un fallo de observación conserva el estado desconocido; no diagnostica desconexión.
  });

  return () => {
    activa = false;
    suscripcion.remove();
  };
}
