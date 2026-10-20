import { precargarAudios } from './audios.service';
import { precargarImagenes } from './imagenes.service';
import { leerCatalogoLocal as leerLocal, guardarCatalogoLocal } from '../data/repositories/catalogo.repository';
import { descargarCatalogo } from './api/catalogo.api';
import { FalloDatos, errorDatos } from './errores';
import type { EstadoRecurso, ResultadoActualizacion } from '../types/persistencia';



let estado: EstadoRecurso = { disponible: false, actualizando: false, ultimaActualizacion: null, error: null };
const oyentes = new Set<(estado: EstadoRecurso) => void>();
let actualizacion: Promise<ResultadoActualizacion> | null = null;

function publicar(cambios: Partial<EstadoRecurso>) {

  const nuevo = { ...estado, ...cambios };

  if (Object.keys(nuevo).every(clave => nuevo[clave as keyof EstadoRecurso] === estado[clave as keyof EstadoRecurso])) return;

  estado = nuevo;
  for (const oyente of oyentes) {
    try {
      oyente({ ...estado });
    } catch (error) {
      console.error('Error en observador del catálogo', error);
    }
  }
}

export function observarEstadoCatalogo(oyente: (estado: EstadoRecurso) => void): () => void {

  oyentes.add(oyente);
  oyente({ ...estado });

  return () => {
    oyentes.delete(oyente);
  };
}

export async function leerCatalogoLocal() {

  try {
    const lectura = await leerLocal();
    publicar({ disponible: lectura.disponible, ultimaActualizacion: lectura.descargadoEn });
    return lectura;
  } catch (error) {
    publicar({ error: errorDatos(error) });
    throw error;
  }
}

export function actualizarCatalogo(): Promise<ResultadoActualizacion> {

  if (actualizacion) return actualizacion;

  actualizacion = Promise.resolve().then(async (): Promise<ResultadoActualizacion> => {
    publicar({ actualizando: true });

    try {
      const datos = await descargarCatalogo();
      const descargadoEn = new Date().toISOString();
      await guardarCatalogoLocal(datos, descargadoEn);
      publicar({ disponible: true, ultimaActualizacion: descargadoEn, error: null });

      void precargarAudios(datos.lugares.flatMap(l => l.audioguia ? [l.audioguia.url] : [])).catch(error => console.error("No se pudieron preparar las audioguías", error));
      void precargarImagenes(datos.lugares.flatMap(l => l.imagenes)).catch(error => console.error("No se pudieron preparar las imágenes", error));

      return { ok: true, descargadoEn };
    } catch (error) {
      const detalle = errorDatos(error);
      if (__DEV__) console.warn('[Catálogo]', detalle.codigo, detalle.mensaje);
      publicar({ error: detalle });
      return { ok: false, error: detalle };
    } finally {
      publicar({ actualizando: false });
    }
  }).finally(() => {
    actualizacion = null;
  });

  return actualizacion;
}

export async function obtenerCatalogo() {
  const local = await leerCatalogoLocal();
  if (local.disponible) return local.datos;

  const resultado = await actualizarCatalogo();
  if (!resultado.ok) throw new FalloDatos(resultado.error);

  const actualizado = await leerCatalogoLocal();
  if (!actualizado.disponible) throw new FalloDatos({ tipo: 'almacenamiento', codigo: 'CATALOGO_NO_DISPONIBLE', mensaje: 'No hay catálogo descargado.', reintentable: true });
  
  return actualizado.datos;
}
