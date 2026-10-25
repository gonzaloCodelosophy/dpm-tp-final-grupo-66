import { precargarImagenes } from './imagenes.service';
import { leerEventosLocal as leerLocal } from '../data/repositories/eventos.repository';
import { descargarEventos } from './api/eventos.api';
import { leerPaginas, guardarPaginas } from '../data/repositories/paginas.repository';
import type { Evento } from '../types/evento';
import { FalloDatos, errorDatos } from './errores';
import type { EstadoRecurso, ResultadoActualizacion, Pagina } from '../types/persistencia';
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
      console.error('Error en observador del agenda', error);
    }
  }
}

export function observarEstadoEventos(oyente: (estado: EstadoRecurso) => void): () => void {

  oyentes.add(oyente);
  oyente({ ...estado });

  return () => {
    oyentes.delete(oyente);
  };
}

export async function leerEventosLocal() {

  try {
    const lectura = await leerLocal();
    publicar({ disponible: lectura.disponible, ultimaActualizacion: lectura.descargadoEn });
    return lectura;
  } catch (error) {
    publicar({ error: errorDatos(error) });
    throw error;
  }
}

//@Alejo o @Ariel La api nueva esta paginada, asi que ahora guardo por pagina, ya no es la lista completa de eventos @Ariel, asi que tenes que pasar a la siguiente pagina para guardar.
//Ya no se deberian guardar eventos pasados.
//Lo hice con push, aun que esto muta el arreglo

export function cargarMasEventos() {

  return actualizarEventos(true);
}

export function actualizarEventos(mas = false): Promise<ResultadoActualizacion> {

  if (actualizacion) return actualizacion;

  actualizacion = Promise.resolve().then(async (): Promise<ResultadoActualizacion> => {
    publicar({ actualizando: true });

    try {
      const local = await leerPaginas<Evento>('eventos');
      const numeros = mas ? (local.siguientePagina ? [local.siguientePagina] : []) : (local.exploradas.length ? local.exploradas : [1]);
      const paginas: Pagina<Evento>[] = [];

      for (const numero of numeros) {
        if (paginas[0] && (numero - 1) * paginas[0].meta.porPagina >= paginas[0].meta.total) break;

        paginas.push(await descargarEventos(numero));
      }

      const descargadoEn = new Date().toISOString();

      if (paginas.length) await guardarPaginas('eventos', paginas, descargadoEn);

      const agenda = await leerLocal();
      publicar({ disponible: agenda.disponible, ultimaActualizacion: descargadoEn, error: null });

      if (agenda.disponible) void precargarImagenes(agenda.datos.map(e => e.imagenUrl).filter((url): url is string => url !== null)).catch(error => console.error('No se pudieron preparar las imágenes', error));

      return { ok: true, descargadoEn };
    } catch (error) {
      const detalle = errorDatos(error);
      if (__DEV__) console.warn('[Agenda]', detalle.codigo, detalle.mensaje);
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

export async function obtenerAgenda() {

  const local = await leerEventosLocal();
  if (local.disponible) return local.datos;
  const resultado = await actualizarEventos();
  if (!resultado.ok) throw new FalloDatos(resultado.error);
  const actualizado = await leerEventosLocal();
  if (!actualizado.disponible) throw new FalloDatos({ tipo: 'almacenamiento', codigo: 'AGENDA_NO_DISPONIBLE', mensaje: 'No hay agenda descargado.', reintentable: true });
  return actualizado.datos;
}

export async function obtenerEventos() {

  return obtenerAgenda();
}

export async function obtenerEventoPorId(id: string) {

  return (await obtenerAgenda()).find(evento => evento.id === id);
}
