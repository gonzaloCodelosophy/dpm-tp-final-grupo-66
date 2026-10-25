import { conBase } from '../database';
import type { Pagina, RecursoPaginado } from '../../types/persistencia';

export function leerPaginas<T extends { id: string }>(recurso: RecursoPaginado) {

  return conBase(async db => {
    const filas = await db.getAllAsync<{ datosJson: string; descargadoEn: string }>('SELECT datosJson, descargadoEn FROM paginas WHERE recurso = ? ORDER BY pagina', recurso);
    const paginas: Pagina<T>[] = filas.map(fila => JSON.parse(fila.datosJson));
    const registros = new Map<string, T>();

    for (const pagina of paginas) {
      for (const dato of pagina.datos) registros.set(dato.id, dato);
    }

    const ultima = paginas.at(-1)?.meta;
    const siguientePagina = ultima && ultima.pagina * ultima.porPagina < ultima.total ? ultima.pagina + 1 : null;

    return {
      datos: [...registros.values()],
      disponible: filas.length > 0,
      descargadoEn: filas.map(fila => fila.descargadoEn).sort().at(-1) ?? null,
      exploradas: paginas.map(pagina => pagina.meta.pagina),
      siguientePagina,
    };
  });
}

export function guardarPaginas<T extends { id: string }>(recurso: RecursoPaginado, paginas: Pagina<T>[], descargadoEn: string) {

  return conBase(async db => {
    await db.withExclusiveTransactionAsync(async tx => {
      for (const pagina of paginas) {
        if (new Set(pagina.datos.map(dato => dato.id)).size !== pagina.datos.length) throw new Error('La página contiene identificadores duplicados.');

        await tx.runAsync('INSERT OR REPLACE INTO paginas VALUES (?, ?, ?, ?)', recurso, pagina.meta.pagina, JSON.stringify(pagina), descargadoEn);
      }

      const meta = paginas[0]?.meta;

      if (meta) {
        const ultima = Math.max(1, Math.ceil(meta.total / meta.porPagina));

        await tx.runAsync('DELETE FROM paginas WHERE recurso = ? AND pagina > ?', recurso, ultima);

        // Si el total cambió, evitar ofrecer páginas que ya no existen.
        const guardadas = await tx.getAllAsync<{ pagina: number; datosJson: string }>('SELECT pagina, datosJson FROM paginas WHERE recurso = ?', recurso);

        for (const fila of guardadas) {
          const guardada: Pagina<T> = JSON.parse(fila.datosJson);

          guardada.meta.total = meta.total;
          await tx.runAsync('UPDATE paginas SET datosJson = ? WHERE recurso = ? AND pagina = ?', JSON.stringify(guardada), recurso, fila.pagina);
        }
      }
    });
  });
}
