import { conBase } from '../database';
import type { Catalogo, LecturaLocal } from '../../types/persistencia';
import { validarCatalogo } from '../../services/api/catalogo.schema';

export function leerCatalogoLocal(): Promise<LecturaLocal<Catalogo>> {

  return conBase(async db => {
    const metas = await db.getAllAsync<{ recurso: string; descargadoEn: string; cantidad: number }>("SELECT recurso, descargadoEn, cantidad FROM catalogos WHERE alcance = 'completo' AND recurso IN ('lugares', 'categorias')");
    if (metas.length === 0) return { disponible: false, datos: null, descargadoEn: null };

    const lugares = metas.find(m => m.recurso === 'lugares');

    const categorias = metas.find(m => m.recurso === 'categorias');

    if (!lugares || !categorias || lugares.descargadoEn !== categorias.descargadoEn) throw new Error('Metadatos del catálogo local inconsistentes.');
    const filasLugares = await db.getAllAsync<{ datosJson: string }>('SELECT datosJson FROM lugares ORDER BY nombre, id');
    const filasCategorias = await db.getAllAsync<{ datosJson: string }>('SELECT datosJson FROM categorias ORDER BY orden, id');
    if (filasLugares.length !== lugares.cantidad || filasCategorias.length !== categorias.cantidad) throw new Error('El catálogo local está incompleto.');

    const datos = validarCatalogo({ lugares: filasLugares.map(f => JSON.parse(f.datosJson)), categorias: filasCategorias.map(f => JSON.parse(f.datosJson)) });

    return { disponible: true, datos, descargadoEn: lugares.descargadoEn };
  });
}

export function guardarCatalogoLocal(datos: Catalogo, descargadoEn: string): Promise<void> {

  const catalogo = validarCatalogo(datos);

  return conBase(async db => {
    await db.withExclusiveTransactionAsync(async tx => {
      await tx.execAsync('DELETE FROM lugares; DELETE FROM categorias;');
      for (const c of catalogo.categorias) await tx.runAsync('INSERT INTO categorias VALUES (?, ?, ?, ?)', c.id, c.nombre, c.orden, JSON.stringify(c));
      for (const l of catalogo.lugares) await tx.runAsync('INSERT INTO lugares VALUES (?, ?, ?, ?, ?, ?)', l.id, l.categoriaId, l.nombre, Number(l.activo), l.actualizadoEn, JSON.stringify(l));
      for (const [recurso, cantidad] of [['lugares', catalogo.lugares.length], ['categorias', catalogo.categorias.length]] as const) {
        await tx.runAsync("INSERT OR REPLACE INTO catalogos VALUES (?, 'completo', ?, ?)", recurso, descargadoEn, cantidad);
      }
    });
  });
}

export function eliminarCatalogoLocal(): Promise<void> {

  return conBase(async db => {
    await db.withExclusiveTransactionAsync(async tx => {
      await tx.execAsync("DELETE FROM lugares; DELETE FROM categorias; DELETE FROM catalogos WHERE alcance = 'completo' AND recurso IN ('lugares', 'categorias');");
    });
  });
}
