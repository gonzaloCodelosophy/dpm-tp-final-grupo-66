import * as Location from 'expo-location';
import { z } from 'zod';
import { RADIO_REGISTRO_METROS } from '../../constants/mapa';
import { distanciaMetros } from './distancias';
import { obtenerToken } from './storage.service';
import { solicitarJson } from './api/http';
import { enviarVisita } from './api/visitas.api';
import { confirmarVisita, guardarErrorVisita, guardarVisitaLocal, visitasPendientes } from '../data/repositories/visitas.repository';
import { errorDatos } from './errores';
import type { Lugar } from '../types/Lugar';
import type { Visita } from '../types/Visita';

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

export function registrarVisitaCercana(lugar: Lugar, usuarioId: string): Promise<Visita> {

  const clave = `${usuarioId}:${lugar.id}`;
  const previa = registros.get(clave);
  if (previa) return previa;

  const tarea = (async () => {
    const token = await obtenerToken();
    if (!token) throw new Error('Ingresá con tu cuenta para registrar una visita.');
    if (!lugar.activo) throw new Error('Este lugar ya no está disponible para registrar una visita.');

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
    if (await obtenerToken() !== token) throw new Error('La cuenta cambió. Ingresá de nuevo antes de registrar la visita.');

    const visita: Visita = {
      id: `vis-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
      usuarioId, lugarId: lugar.id, fechaHora: new Date().toISOString(), origen: 'gps',
      fotoUri: null, nota: null, sincronizada: false,
    };

    await guardarVisitaLocal(visita);
    publicar(usuarioId);
    void sincronizarVisitas(usuarioId).catch(error => console.error('No se pudieron enviar las visitas', error));

    return visita;
  })().finally(() => { registros.delete(clave); });

  registros.set(clave, tarea);
  return tarea;
}

export function sincronizarVisitas(usuarioId: string): Promise<void> {

  const previa = envios.get(usuarioId);
  if (previa) return previa;

  const tarea = (async () => {
    // Releer después de cada tanda: puede haberse registrado otra visita durante el envío.
    for (;;) {
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
          const confirmada = await enviarVisita(visita, token);
          await confirmarVisita(confirmada);
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
