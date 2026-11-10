import { prepararFotoVisita } from './foto-visita.service';
import { puedeConsultarApi } from './red.service';
import { Platform } from 'react-native';
import { resolverLugarQr } from './qr.service';
import * as Location from 'expo-location';
import { RADIO_REGISTRO_METROS } from '../../constants/mapa';
import { z } from 'zod';
import { distanciaMetros } from './distancias';
import { obtenerToken } from './storage.service';
import { solicitarJson } from './api/http';
import { descargarVisitas, enviarVisita } from './api/visitas.api';
import { POR_PAGINA } from './api/paginacion';
import { leerHistorialLocal, guardarHistorialLocal, actualizarFotoVisita, leerVisitaLocal, confirmarVisita, guardarErrorVisita, guardarVisitaLocal, visitasPendientes } from '../data/repositories/visitas.repository';
import { errorDatos } from './errores';
import type { Lugar } from '../types/Lugar';
import type { Visita } from '../types/Visita';

export interface RecuerdoVisita { nota?: string; fotoUri?: string }

const visitasConsultadas = new Map<string, Visita>();

const registros = new Map<string, Promise<Visita>>();
const envios = new Map<string, Promise<void>>();
const oyentes = new Set<(usuarioId: string) => void>();

export function observarVisitas(oyente: (usuarioId: string) => void) {

  oyentes.add(oyente);
  return () => { oyentes.delete(oyente); };
}

function publicar(usuarioId: string) {

  for (const oyente of oyentes) {
    try { oyente(usuarioId); } catch (error) { console.error(error); }
  }
}

async function crearVisita(lugar: Lugar, usuarioId: string, origen: Visita['origen'], recuerdo?: RecuerdoVisita): Promise<Visita> {

  if ((recuerdo?.nota?.trim().length ?? 0) > 280) throw new Error('La nota puede tener hasta 280 caracteres.');
  const token = await obtenerToken();
  if (!token) throw new Error('Ingresá con tu cuenta para registrar una visita.');
  if (!lugar.activo) throw new Error('Este lugar ya no está disponible para registrar una visita.');

  if (origen === 'gps') {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) throw new Error('Permití tu ubicación desde el mapa para comprobar que estás cerca.');
    if (!await Location.hasServicesEnabledAsync()) throw new Error('Activá la ubicación del teléfono e intentá de nuevo.');

    let tiempo: ReturnType<typeof setTimeout> | undefined;
    let posicion: Location.LocationObject;

    try {
      posicion = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<never>((_, rechazar) => {
          tiempo = setTimeout(() => rechazar(new Error('No pudimos obtener tu ubicación. Intentá de nuevo.')), 15000);
        }),
      ]);
    } finally {
      if (tiempo) clearTimeout(tiempo);
    }

    if (!Number.isFinite(posicion.timestamp) || !Number.isFinite(posicion.coords.latitude) || !Number.isFinite(posicion.coords.longitude) || posicion.coords.accuracy === null || !Number.isFinite(posicion.coords.accuracy) || posicion.coords.accuracy < 0 || Math.abs(Date.now() - posicion.timestamp) > 30000 || posicion.coords.accuracy > RADIO_REGISTRO_METROS) {
      throw new Error('La ubicación todavía no es suficientemente precisa. Intentá de nuevo al aire libre.');
    }

    const distancia = distanciaMetros({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude }, lugar.coordenadas);
    if (distancia > RADIO_REGISTRO_METROS) throw new Error(`Acercate a ${RADIO_REGISTRO_METROS} metros del lugar para registrar la visita.`);
  }

  if (await obtenerToken() !== token) throw new Error('La cuenta cambió. Ingresá de nuevo antes de registrar la visita.');

  const visita: Visita = {
    id: `vis-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
    usuarioId, lugarId: lugar.id, fechaHora: new Date().toISOString(), origen,
    fotoUri: recuerdo?.fotoUri ?? null, nota: recuerdo?.nota?.trim() || null, sincronizada: false,
  };

  await guardarVisitaLocal(visita);
  visitasConsultadas.set(`${usuarioId}:${visita.id}`, visita);
  publicar(usuarioId);
  void sincronizarVisitas(usuarioId).catch(error => console.error('No se pudieron enviar las visitas', error));

  return visita;
}

function registrarVisita(lugar: Lugar, usuarioId: string, origen: Visita['origen'], recuerdo?: RecuerdoVisita): Promise<Visita> {

  const clave = `${usuarioId}:${lugar.id}`;
  const previa = registros.get(clave);
  if (previa) return previa;

  const tarea = crearVisita(lugar, usuarioId, origen, recuerdo).finally(() => { registros.delete(clave); });
  registros.set(clave, tarea);
  return tarea;
}

export function registrarVisitaCercana(lugar: Lugar, usuarioId: string, recuerdo?: RecuerdoVisita): Promise<Visita> {

  return registrarVisita(lugar, usuarioId, 'gps', recuerdo);
}

export function registrarVisitaManual(lugar: Lugar, usuarioId: string, recuerdo?: RecuerdoVisita): Promise<Visita> {

  return registrarVisita(lugar, usuarioId, 'manual', recuerdo);
}

export async function registrarVisitaQr(lugar: Lugar, usuarioId: string, codigo: string, recuerdo?: RecuerdoVisita): Promise<Visita> {

  const resuelto = await resolverLugarQr(codigo);
  if (resuelto.lugar.id !== lugar.id) throw new Error('El QR no corresponde al lugar seleccionado.');
  return registrarVisita(lugar, usuarioId, 'qr', recuerdo);
}

export async function obtenerHistorialVisitas(usuarioId: string): Promise<Visita[]> {

  const token = await obtenerToken();
  if (!token) throw new Error('Iniciá sesión para consultar tus visitas.');

  const locales = await leerHistorialLocal(usuarioId);
  let remotas: Visita[] = [];
  if (await puedeConsultarApi()) {
    try {
      const primera = await descargarVisitas(1, token);
      remotas = [...primera.datos];
      const paginas = Math.ceil(primera.meta.total / POR_PAGINA);
      for (let pagina = 2; pagina <= paginas; pagina++) {
        if (await obtenerToken() !== token) throw new Error('La sesión cambió. Iniciá sesión de nuevo.');
        remotas.push(...(await descargarVisitas(pagina, token)).datos);
      }
      if (await obtenerToken() !== token) throw new Error('La sesión cambió. Iniciá sesión de nuevo.');
      remotas = remotas.filter(visita => visita.usuarioId === usuarioId);
      if (Platform.OS !== 'web') await guardarHistorialLocal(remotas);
    } catch (error) {
      const detalle = errorDatos(error);
      if (detalle.tipo !== 'red' && !(detalle.tipo === 'http' && detalle.reintentable)) throw error;
      remotas = [];
    }
  }
  if (await obtenerToken() !== token) throw new Error('La sesión cambió. Iniciá sesión de nuevo.');
  const historial = new Map(locales.map(visita => [visita.id, visita]));
  for (const visita of remotas) {
    if (historial.get(visita.id)?.sincronizada !== false) historial.set(visita.id, visita);
  }
  // Volver a leer para incluir registros o confirmaciones realizados durante la descarga.
  if (Platform.OS !== 'web') {
    for (const visita of await leerHistorialLocal(usuarioId)) historial.set(visita.id, visita);
  }
  for (const visita of historial.values()) visitasConsultadas.set(`${usuarioId}:${visita.id}`, visita);
  return [...historial.values()].sort((a, b) => Date.parse(b.fechaHora) - Date.parse(a.fechaHora));
}

export async function obtenerVisitaRegistrada(id: string, usuarioId: string): Promise<Visita | null> {

  const consultada = visitasConsultadas.get(`${usuarioId}:${id}`);
  if (consultada) return consultada;
  try {
    const local = await leerVisitaLocal(id, usuarioId);
    if (local) return local;
  } catch {
    // La copia local puede no estar disponible en web.
  }
  return (await obtenerHistorialVisitas(usuarioId)).find(visita => visita.id === id) ?? null;
}

export function sincronizarVisitas(usuarioId: string): Promise<void> {

  const previa = envios.get(usuarioId);
  if (previa) return previa;

  const tarea = (async () => {
    // Releer después de cada tanda: puede haberse registrado otra visita durante el envío.
    for (;;) {
      if (!await puedeConsultarApi()) return;
      const pendientes = await visitasPendientes(usuarioId);
      if (!pendientes.length) return;
      const token = await obtenerToken();
      if (!token) return;

      try {
        const yo = z.object({ datos: z.object({ id: z.string() }) }).parse(await solicitarJson('/yo', { token }));
        if (yo.datos.id !== usuarioId || await obtenerToken() !== token) return;
      } catch { return; }

      for (const visita of pendientes) {
        if (await obtenerToken() !== token) return;

        try {
          const preparada = await prepararFotoVisita(visita);
          if (preparada.fotoUri !== visita.fotoUri) await actualizarFotoVisita(preparada);
          if (await obtenerToken() !== token) return;
          const confirmada = await enviarVisita(preparada, token);
          await confirmarVisita(confirmada);
          visitasConsultadas.set(`${usuarioId}:${confirmada.id}`, confirmada);
          publicar(usuarioId);
        } catch (error) {
          const detalle = errorDatos(error);
          if (detalle.codigo === 'NO_AUTENTICADO') detalle.reintentable = true;

          await guardarErrorVisita(visita.id, usuarioId, detalle);
          publicar(usuarioId);
          if (detalle.reintentable) return;
        }
      }
    }
  })().finally(() => { envios.delete(usuarioId); });

  envios.set(usuarioId, tarea);
  return tarea;
}

export async function reintentarVisita(id: string, usuarioId: string) {

  await guardarErrorVisita(id, usuarioId, null);
  await sincronizarVisitas(usuarioId);
}
