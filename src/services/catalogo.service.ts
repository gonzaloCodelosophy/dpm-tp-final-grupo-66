import { precargarAudios } from './audios.service';
import { precargarImagenes } from './imagenes.service';
import { leerCatalogoLocal as leerLocal } from '../data/repositories/catalogo.repository';
import { descargarLugares, descargarCategorias } from './api/catalogo.api';
import { leerPaginas, guardarPaginas } from '../data/repositories/paginas.repository';
import type { Lugar } from '../types/Lugar';
import type { Categoria } from '../types/Categoria';
import { FalloDatos, errorDatos } from './errores';
import type { EstadoRecurso, ResultadoActualizacion, RecursoPaginado, Pagina } from '../types/persistencia';

//@chicos los endpoints nuevos usan paginacion, asi que se cargan y guardan a medida que se navega. En modo desconectado no deberia mostrar los que no se vieron

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

export function cargarMasLugares() {

  return actualizarCatalogo('lugares');
}

export function cargarMasCategorias() {

  return actualizarCatalogo('categorias');
}

export function actualizarCatalogo(mas?: Exclude<RecursoPaginado, 'eventos'>): Promise<ResultadoActualizacion> {

  if (actualizacion) return actualizacion;

  actualizacion = Promise.resolve().then(async (): Promise<ResultadoActualizacion> => {
    publicar({ actualizando: true });

    try {
      const descargadoEn = new Date().toISOString();

      async function consultar<T extends { id: string }>(recurso: Exclude<RecursoPaginado, 'eventos'>, descargar: (pagina: number) => Promise<Pagina<T>>) {
        const local = await leerPaginas<T>(recurso);
        const numeros = mas ? (local.siguientePagina ? [local.siguientePagina] : []) : (local.exploradas.length ? local.exploradas : [1]);
        const paginas: Pagina<T>[] = [];

        // Refrescar únicamente páginas ya exploradas. Nunca seguir meta.total automáticamente.
        for (const numero of numeros) {
          if (paginas[0] && (numero - 1) * paginas[0].meta.porPagina >= paginas[0].meta.total) break;

          paginas.push(await descargar(numero));
        }

        if (paginas.length) await guardarPaginas(recurso, paginas, descargadoEn);
      }

      if (!mas || mas === 'categorias') await consultar<Categoria>('categorias', descargarCategorias);
      if (!mas || mas === 'lugares') await consultar<Lugar>('lugares', descargarLugares);

      const local = await leerLocal();
      publicar({ disponible: local.disponible, ultimaActualizacion: descargadoEn, error: null });

      if (local.disponible) {
        void precargarAudios(local.datos.lugares.flatMap(l => l.audioguia ? [l.audioguia.url] : [])).catch(error => console.error('No se pudieron preparar las audioguías', error));
        void precargarImagenes(local.datos.lugares.flatMap(l => l.imagenes)).catch(error => console.error('No se pudieron preparar las imágenes', error));
      }

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
