import type { Categoria } from './Categoria';
import type { Lugar } from './Lugar';

export interface Catalogo { lugares: Lugar[]; categorias: Categoria[] }

export type ErrorDatos = { tipo: 'red' | 'http' | 'contrato' | 'almacenamiento'; codigo: string; mensaje: string; reintentable: boolean };

export type LecturaLocal<T> = { disponible: false; datos: null; descargadoEn: null } | { disponible: true; datos: T; descargadoEn: string };

export interface EstadoRecurso { disponible: boolean; actualizando: boolean; ultimaActualizacion: string | null; error: ErrorDatos | null }

export type ResultadoActualizacion = { ok: true; descargadoEn: string } | { ok: false; error: ErrorDatos };
