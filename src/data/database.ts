import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';
import { FalloDatos, errorDatos } from '../services/errores';
let apertura: Promise<SQLiteDatabase> | null = null;
let turno: Promise<unknown> = Promise.resolve();

// Todas las operaciones usan esta cola para evitar lecturas durante un reemplazo.
export function conBase<T>(operacion: (db: SQLiteDatabase) => Promise<T>): Promise<T> {

  const resultado = turno.then(async () => {
    try {
      return await operacion(await abrirBase());
    }
    catch (error) {
      throw new FalloDatos(errorDatos(error));
    }
  });

  turno = resultado.catch(() => undefined);

  return resultado;
}

async function abrirBase(): Promise<SQLiteDatabase> {

  if (!apertura) apertura = inicializar().catch(error => {
    apertura = null;
    throw error;
  });

  return apertura;
}

async function inicializar(): Promise<SQLiteDatabase> {

  if (Platform.OS === 'web') throw new FalloDatos({ tipo: 'almacenamiento', codigo: 'SQLITE_WEB_NO_CONFIGURADO', mensaje: 'La persistencia del catálogo está disponible en Android e iOS. Web requiere configurar SQLite.', reintentable: false });
  const db = await openDatabaseAsync('mi-ciudad.db');

  try {
    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if ((version?.user_version ?? 0) > 6) throw new Error('La base local requiere una versión más reciente de la app.');

    if ((version?.user_version ?? 0) === 0) {
      await db.withExclusiveTransactionAsync(async tx => {
        await tx.execAsync(`
          CREATE TABLE categorias (id TEXT PRIMARY KEY NOT NULL, nombre TEXT NOT NULL, orden INTEGER NOT NULL, datosJson TEXT NOT NULL);
          CREATE TABLE lugares (id TEXT PRIMARY KEY NOT NULL, categoriaId TEXT NOT NULL, nombre TEXT NOT NULL, activo INTEGER NOT NULL CHECK(activo IN (0,1)), actualizadoEn TEXT NOT NULL, datosJson TEXT NOT NULL);
          CREATE INDEX lugares_categoria ON lugares(categoriaId);
          CREATE TABLE catalogos (recurso TEXT NOT NULL, alcance TEXT NOT NULL, descargadoEn TEXT NOT NULL, cantidad INTEGER NOT NULL, PRIMARY KEY(recurso, alcance));
          PRAGMA user_version = 1;
        `);
      });
    }

    if ((version?.user_version ?? 0) < 2) {
      await db.withExclusiveTransactionAsync(async tx => {
        await tx.execAsync(`
          CREATE TABLE eventos (id TEXT PRIMARY KEY NOT NULL, inicio TEXT NOT NULL, estado TEXT NOT NULL, lugarId TEXT NULL, datosJson TEXT NOT NULL);
          PRAGMA user_version = 2;
        `);
      });
    }

    // Versiones 3/4 reservadas para cambios retirados; conservar bases ya instaladas.
    if ((version?.user_version ?? 0) < 5) {
      await db.withExclusiveTransactionAsync(async tx => {
        await tx.execAsync(`
          CREATE TABLE IF NOT EXISTS imagenes (url TEXT PRIMARY KEY NOT NULL, nombreArchivo TEXT NOT NULL, descargadoEn TEXT NOT NULL);
          PRAGMA user_version = 5;
        `);
      });
    }

    if ((version?.user_version ?? 0) < 6) {
      await db.withExclusiveTransactionAsync(async tx => {
        await tx.execAsync(`
          CREATE TABLE IF NOT EXISTS audios (url TEXT PRIMARY KEY NOT NULL, nombreArchivo TEXT NOT NULL, descargadoEn TEXT NOT NULL);
          PRAGMA user_version = 6;
        `);
      });
    }

    return db;
  } catch (error) {
    await db.closeAsync();
    throw error;
  }
}
