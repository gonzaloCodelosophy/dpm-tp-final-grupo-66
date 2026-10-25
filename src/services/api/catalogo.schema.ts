import { z } from 'zod';
import type { Catalogo } from '../../types/persistencia';
import { FalloDatos } from '../errores';

const id = z.string().min(1);
const fecha = z.iso.datetime({ offset: true });
const coordenadas = z.object({ latitud: z.number().min(-90).max(90), longitud: z.number().min(-180).max(180) });

export const categoriaSchema = z.object({ id, nombre: z.string(), icono: z.string(), color: z.string(), orden: z.number().int() });

export const lugarSchema = z.object({
  id, nombre: z.string(), categoriaId: id, descripcionCorta: z.string(), descripcion: z.string(), coordenadas,
  direccion: z.string(), imagenes: z.array(z.string()),
  horarios: z.array(z.object({ dia: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]), abre: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), cierra: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) })),
  telefono: z.string().nullable(), sitioWeb: z.string().nullable(), precioEntrada: z.number().nonnegative().nullable(),
  audioguia: z.object({ url: z.string(), duracionSegundos: z.number().nonnegative(), idioma: z.enum(['es', 'en', 'pt']) }).nullable(),
  codigoQr: z.string().nullable(), accesible: z.boolean(), activo: z.boolean(), actualizadoEn: fecha,
});

export function validarCatalogo(entrada: unknown): Catalogo {

  const resultado = z.object({ lugares: z.array(lugarSchema), categorias: z.array(categoriaSchema) }).safeParse(entrada);
  if (!resultado.success) throw new FalloDatos({ tipo: 'contrato', codigo: 'CATALOGO_INVALIDO', mensaje: 'El catálogo no cumple el contrato de datos.', reintentable: false });
  const datos = resultado.data;

  const categorias = new Set(datos.categorias.map(c => c.id));

  if (categorias.size !== datos.categorias.length || new Set(datos.lugares.map(l => l.id)).size !== datos.lugares.length) throw new FalloDatos({ tipo: 'contrato', codigo: 'CATALOGO_INCONSISTENTE', mensaje: 'El catálogo contiene IDs duplicados.', reintentable: false });

  return datos;
}
