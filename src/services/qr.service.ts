import { z } from 'zod';
import { solicitarJson } from './api/http';
import { lugarSchema } from './api/catalogo.schema';

export function leerCodigoLugar(texto: string): string | null {
  let codigo = texto.trim();
  if (codigo.startsWith('turismocolon://')) {
    try {
      const enlace = new URL(codigo);
      if (enlace.hostname !== 'recorrido' || enlace.pathname !== '/qr') return null;
      codigo = enlace.searchParams.get('codigo') ?? '';
    } catch { return null; }
  }

  return /^COLON:lug-[A-Za-z0-9_-]{1,36}$/.test(codigo) ? codigo : null;
}

export function enlaceRegistroQr(codigo: string) {
  const valido = leerCodigoLugar(codigo);
  if (!valido) throw new Error('El código QR no corresponde a un lugar de Colón.');

  return `turismocolon://recorrido/qr?codigo=${encodeURIComponent(valido)}`;
}

export async function resolverLugarQr(texto: string) {
  const codigo = leerCodigoLugar(texto);
  if (!codigo) throw new Error('Este QR no corresponde a un lugar de Colón.');
  const respuesta = z.object({ datos: lugarSchema, meta: z.null() })
    .parse(await solicitarJson(`/lugares/qr/${encodeURIComponent(codigo)}`));
  if (respuesta.datos.codigoQr !== codigo || respuesta.datos.id !== codigo.slice('COLON:'.length) || !respuesta.datos.activo) throw new Error('El lugar de este QR no está disponible.');

  return { codigo, lugar: respuesta.datos };
}
