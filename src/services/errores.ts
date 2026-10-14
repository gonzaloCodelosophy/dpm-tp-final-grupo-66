import type { ErrorDatos } from '../types/persistencia';

export class FalloDatos extends Error {
  constructor(public readonly detalle: ErrorDatos) {
    super(detalle.mensaje);
    this.name = 'FalloDatos';
  }
}

export function errorDatos(error: unknown, tipo: ErrorDatos['tipo'] = 'almacenamiento'): ErrorDatos {
  return error instanceof FalloDatos ? error.detalle : { tipo, codigo: tipo.toUpperCase(), mensaje: error instanceof Error ? error.message : 'No se pudo completar la operación.', reintentable: true };
}
