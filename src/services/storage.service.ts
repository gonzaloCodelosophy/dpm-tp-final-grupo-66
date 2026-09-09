import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AUTH_TOKEN_KEY } from '@/constants/auth';
import Storage from 'expo-sqlite/kv-store';

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
        return localStorage.getItem(AUTH_TOKEN_KEY);
      }
      return null;
    }
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
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