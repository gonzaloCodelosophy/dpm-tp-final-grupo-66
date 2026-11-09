import { CredencialesLogin, DatosRegistro, RespuestaAuth, Usuario } from '../types/auth';
import { FalloDatos } from './errores';
import { solicitarJson } from './api/http';
import {
  eliminarToken,
  eliminarUsuarioCache,
  guardarToken,
  guardarUsuarioCache,
  obtenerToken,
  obtenerUsuarioCache,
} from './storage.service';

// El rol del JWT solo elige la interfaz; la API autoriza cada cambio con la base.
function conRol(usuario: Usuario, token: string): Usuario {
  try {
    const segmento = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const carga = JSON.parse(atob(segmento.padEnd(Math.ceil(segmento.length / 4) * 4, '=')));
    return { ...usuario, rol: carga.rol === 'admin' ? 'admin' : 'turista' };
  } catch {
    return { ...usuario, rol: 'turista' };
  }
}

export async function iniciarSesion(credenciales: CredencialesLogin): Promise<RespuestaAuth> {
  const { email, password } = credenciales;
  const { datos } = (await solicitarJson('/auth/ingreso', {
    metodo: 'POST',
    cuerpo: { email: email.trim(), contrasena: password },
  })) as { datos: RespuestaAuth };

  await guardarToken(datos.token);
  datos.usuario = conRol(datos.usuario, datos.token);
  await guardarUsuarioCache(datos.usuario);
  return datos;
}

export async function registrarse(datos: DatosRegistro): Promise<RespuestaAuth> {
  const { nombre, email, password } = datos;
  const { datos: sesion } = (await solicitarJson('/auth/registro', {
    metodo: 'POST',
    cuerpo: { nombre: nombre.trim(), email: email.trim(), contrasena: password },
  })) as { datos: RespuestaAuth };

  await guardarToken(sesion.token);
  sesion.usuario = conRol(sesion.usuario, sesion.token);
  await guardarUsuarioCache(sesion.usuario);
  return sesion;
}

export async function obtenerSesion(): Promise<Usuario | null> {
  const token = await obtenerToken();
  if (!token) return null;

  try {
    const { datos } = (await solicitarJson('/yo', { token })) as { datos: Usuario };
    if (datos) {
      const usuario = conRol(datos, token);
      await guardarUsuarioCache(usuario);
      return usuario;
    }
  } catch (error) {
    if (error instanceof FalloDatos && (error.detalle.codigo === 'HTTP_401' || error.detalle.codigo === 'NO_AUTENTICADO')) {
      await eliminarToken();
      await eliminarUsuarioCache();
      return null;
    }

    // offline
    const usuarioEnCache = await obtenerUsuarioCache();
    if (usuarioEnCache) {
      return usuarioEnCache;
    }
  }

  return null;
}

export async function cerrarSesion(): Promise<void> {
  await eliminarToken();
  await eliminarUsuarioCache();
}
