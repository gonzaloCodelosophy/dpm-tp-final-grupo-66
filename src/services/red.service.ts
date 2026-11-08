import * as Network from "expo-network";

export interface EstadoRed {
        conectada: boolean | null;
        internetAlcanzable: boolean | null;
}

export function observarRed(oyente: (estado: EstadoRed) => void): () => void {
        let activa = true;
        let eventoRecibido = false;

        const publicar = (red: Network.NetworkState) => {
                if (activa)
                        oyente({
                                conectada: red.isConnected ?? null,
                                internetAlcanzable:
                                        red.isInternetReachable ?? null,
                        });
        };

        oyente({ conectada: null, internetAlcanzable: null });

        const suscripcion = Network.addNetworkStateListener((red) => {
                eventoRecibido = true;
                publicar(red);
        });

        void Network.getNetworkStateAsync()
                .then((red) => {
                        if (!eventoRecibido) publicar(red);
                })
                .catch(() => {
                        // @gonzalo: si falla esta consulta dejo la red como desconocida, te parece bien?
                });

        return () => {
                activa = false;
                suscripcion.remove();
        };
}

export async function puedeConsultarApi(): Promise<boolean> {
        try {
                const estado = await Network.getNetworkStateAsync();
                return (
                        estado.isConnected !== false &&
                        estado.isInternetReachable !== false
                );
        } catch {
                return true;
        }
}
