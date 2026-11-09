import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/auth.context';
import { useCatalogo } from './use-catalogo';
import { useUbicacion } from './use-ubicacion';
import { usePreferenciasNotificaciones } from './use-preferencias-notificaciones';
import { evaluarCercania, type AvisoCercania } from '../services/proximidad';
import { textoDistancia } from '../services/distancias';
import {
  puedeAvisarProximidad,
  registrarAvisoProximidad,
} from '../services/preferencias-notificaciones.service';

export function useAvisosProximidad() {
  const { usuario, status } = useAuth();
  const catalogo = useCatalogo();
  const ubicacion = useUbicacion();
  const router = useRouter();
  const { radioAvisoMetros, avisosProximidadPorDia } = usePreferenciasNotificaciones();
  const estadosPorUsuario = useRef(new Map<string, Map<string, AvisoCercania>>());
  const permisoSolicitado = useRef(new Set<string>());
  const ocupada = useRef(false);
  const notificacionesSolicitadas = useRef(new Set<string>());
  const preferencias = usuario?.preferencias;
  const habilitado = status === 'autenticado' && preferencias?.avisarProximidad === true;
  const usuarioId = usuario?.id;
  const { solicitar, permiso, enPrimerPlano, coordenadas, fechaPosicion, precision } = ubicacion;

  useEffect(() => {
    if (Platform.OS === 'web' || !habilitado || !usuarioId || !enPrimerPlano || permiso === null) return;
    if (permiso !== 'granted' && !permisoSolicitado.current.has(usuarioId)) {
      permisoSolicitado.current.add(usuarioId);
      void solicitar();
    }
  }, [habilitado, usuarioId, enPrimerPlano, permiso, solicitar]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const respuesta = Notifications.addNotificationResponseReceivedListener(evento => {
      const datos = evento.notification.request.content.data;
      if (datos.tipo === 'proximidad' && habilitado && datos.usuarioId === usuarioId && typeof datos.lugarId === 'string') {
        router.push({ pathname: '/lugar/[id]', params: { id: datos.lugarId } });
      }
    });

    return () => respuesta.remove();
  }, [habilitado, usuarioId, router]);

  useEffect(() => {
    if (Platform.OS === 'web' || !habilitado || !usuarioId || !enPrimerPlano || permiso !== 'granted' || !coordenadas || !fechaPosicion) return;
    const radio = radioAvisoMetros;
    if (!Number.isFinite(radio) || radio <= 0 || precision === null || !Number.isFinite(precision) || !Number.isFinite(fechaPosicion) || precision < 0 || precision > radio || Math.abs(Date.now() - fechaPosicion) > 30000) return;
    let vigente = true;

    async function avisar() {
      if (ocupada.current) return;
      ocupada.current = true;
      try {
        // Android necesita el canal antes de pedir permiso de notificaciones.
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('proximidad', {
            name: 'Lugares cercanos', importance: Notifications.AndroidImportance.HIGH,
          });
        }
        let autorizacion = await Notifications.getPermissionsAsync();
        if (!autorizacion.granted && autorizacion.canAskAgain && !notificacionesSolicitadas.current.has(usuarioId!)) {
          notificacionesSolicitadas.current.add(usuarioId!);
          autorizacion = await Notifications.requestPermissionsAsync();
        }
        if (!vigente || !autorizacion.granted || AppState.currentState !== 'active') return;

        let estados = estadosPorUsuario.current.get(usuarioId!);
        if (!estados) {
          estados = new Map();
          estadosPorUsuario.current.set(usuarioId!, estados);
        }
        if (avisosProximidadPorDia <= 0) return;
        if (!(await puedeAvisarProximidad(usuarioId!, avisosProximidadPorDia))) return;
        const candidatos = evaluarCercania(catalogo.datos?.lugares ?? [], coordenadas!, radio, estados, Date.now());
        // Un solo aviso por actualización, dando prioridad al lugar más cercano.
        const candidato = candidatos[0];
        if (!candidato || !vigente) return;
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Estás cerca de ${candidato.lugar.nombre}`,
            body: `A ${textoDistancia(candidato.distancia)} de tu ubicación. Tocá para conocer el lugar.`,
            data: { tipo: 'proximidad', lugarId: candidato.lugar.id, usuarioId },
          },
          trigger: Platform.OS === 'android' ? { channelId: 'proximidad' } : null,
        });
        if (!vigente) {
          await Notifications.dismissNotificationAsync(id);
          return;
        }
        try {
          await registrarAvisoProximidad(usuarioId!);
        } catch (error) {
          console.warn('No pudimos registrar el aviso de cercanía del día:', error);
        }
        // Marcar también los demás lugares de esta entrada para no encadenar avisos.
        for (const cercano of candidatos) {
          cercano.estado.dentro = true;
          cercano.estado.ultimoAviso = Date.now();
        }
      } catch (error) {
        console.warn('No pudimos mostrar el aviso de cercanía:', error);
      } finally {
        ocupada.current = false;
      }
    }

    void avisar();
    return () => { vigente = false; };
  }, [habilitado, usuarioId, enPrimerPlano, permiso, coordenadas, precision, fechaPosicion, catalogo.datos, radioAvisoMetros, avisosProximidadPorDia]);
}
