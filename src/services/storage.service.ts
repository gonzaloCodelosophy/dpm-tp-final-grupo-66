import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AUTH_TOKEN_KEY, AUTH_USER_PROFILE_KEY } from '@/constants/auth';
import Storage from 'expo-sqlite/kv-store';
import type { Usuario } from '../types/auth';

export async function guardarToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
      return;
    }
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error al guardar el token de autenticación:', error);
  }
}

export async function obtenerToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return leerTokenCompatible(localStorage.getItem(AUTH_TOKEN_KEY));
      }
      return null;
    }
    return leerTokenCompatible(await SecureStore.getItemAsync(AUTH_TOKEN_KEY));
  } catch (error) {
    console.error('Error al recuperar el token de autenticación:', error);
    return null;
  }
}

export async function eliminarToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error al eliminar el token de autenticación:', error);
  }
}


// guarda en caché el perfil del usuario para disponibilidad sin conexión 

export async function guardarUsuarioCache(usuario: Usuario): Promise<void> {
  try {
    const json = JSON.stringify(usuario);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_PROFILE_KEY, json);
      }
      return;
    }
    await Storage.setItem(AUTH_USER_PROFILE_KEY, json);
  } catch (error) {
    console.error('Error al guardar caché de perfil de usuario:', error);
  }
}

export async function obtenerUsuarioCache(): Promise<Usuario | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        raw = localStorage.getItem(AUTH_USER_PROFILE_KEY);
      }
    } else {
      raw = await Storage.getItem(AUTH_USER_PROFILE_KEY);
    }
    if (!raw) return null;
    return JSON.parse(raw) as Usuario;
  } catch (error) {
    console.error('Error al leer caché de perfil de usuario:', error);
    return null;
  }
}


//Limpia el perfil cacheado al cerrar sesion

export async function eliminarUsuarioCache(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_USER_PROFILE_KEY);
      }
      return;
    }
    await Storage.removeItem(AUTH_USER_PROFILE_KEY);
  } catch (error) {
    console.error('Error al eliminar caché de perfil de usuario:', error);
  }
}

export async function guardarFavoritoLocal(id: string): Promise<void> {
  try {
    await Storage.setItem(`fav_evt_${id}`, 'true');
  } catch (error) {
    console.error(`Error al guardar el favorito ${id}:`, error);
  }
}

export async function removerFavoritoLocal(id: string): Promise<void> {
  try {
    await Storage.removeItem(`fav_evt_${id}`);
  } catch (error) {
    console.error(`Error al remover el favorito ${id}:`, error);
  }
}

export async function esFavoritoLocal(id: string): Promise<boolean> {
  try {
    const valor = await Storage.getItem(`fav_evt_${id}`);
    return valor === 'true';
  } catch (error) {
    console.error(`Error al consultar el favorito ${id}:`, error);
    return false;
  }
}

function leerTokenCompatible(valor: string | null): string | null {
  if (!valor?.startsWith('{')) return valor;
  try {
    const sesion = JSON.parse(valor);
    return typeof sesion.token === 'string' ? sesion.token : null;
  } catch {
    return null;
  }
}
