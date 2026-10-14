import { FalloDatos } from '../errores';

export async function solicitarJson(ruta: string): Promise<unknown> {

  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!base) throw new FalloDatos({ tipo: 'contrato', codigo: 'API_NO_CONFIGURADA', mensaje: 'Configurar EXPO_PUBLIC_API_URL con la dirección del backend demo.', reintentable: false });
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const respuesta = await fetch(`${base}${ruta}`, { signal: controller.signal });
    let cuerpo: unknown;
    try {
      cuerpo = await respuesta.json();
    }
    catch {
      throw new FalloDatos({ tipo: 'contrato', codigo: 'JSON_INVALIDO', mensaje: 'El servidor devolvió una respuesta que no es JSON.', reintentable: respuesta.status >= 500 });
    }
    if (!respuesta.ok) {
      const error = (cuerpo as { error?: { codigo?: unknown; mensaje?: unknown } } | null)?.error;
      throw new FalloDatos({ tipo: 'http', codigo: typeof error?.codigo === 'string' ? error.codigo : `HTTP_${respuesta.status}`, mensaje: typeof error?.mensaje === 'string' ? error.mensaje : 'Falló la consulta al servidor.', reintentable: respuesta.status >= 500 || respuesta.status === 429 || respuesta.status === 408 });
    }
    return cuerpo;
  } catch (error) {
    if (error instanceof FalloDatos) throw error;
    throw new FalloDatos({ tipo: 'red', codigo: controller.signal.aborted ? 'TIEMPO_AGOTADO' : 'RED_NO_DISPONIBLE', mensaje: controller.signal.aborted ? 'El servidor tardó demasiado en responder.' : 'No se pudo contactar al servidor.', reintentable: true });
  } finally {
    clearTimeout(timeout);
  }
}
