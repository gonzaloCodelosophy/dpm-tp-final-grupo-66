import Storage from 'expo-sqlite/kv-store';
import { Platform } from 'react-native';

const oyentes = new Set<() => void>();

export function observarFavoritos(oyente: () => void) {
  oyentes.add(oyente);
  return () => { oyentes.delete(oyente); };
}

export async function leerFavorito(id: string): Promise<boolean> {
  const clave = `fav_lugar_${id}`;
  const valor = Platform.OS === 'web' ? localStorage.getItem(clave) : await Storage.getItem(clave);
  return valor === 'true';
}

export async function guardarFavorito(id: string, favorito: boolean): Promise<void> {
  const clave = `fav_lugar_${id}`;
  if (Platform.OS === 'web') {
    if (favorito) localStorage.setItem(clave, 'true');
    else localStorage.removeItem(clave);
  } else {
    if (favorito) await Storage.setItem(clave, 'true');
    else await Storage.removeItem(clave);
  }
  for (const oyente of oyentes) oyente();
}
