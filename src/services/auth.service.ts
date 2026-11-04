import usuariosMockData from '../mocks/usuarios-mock.json';
import { CredencialesLogin, DatosRegistro, RespuestaAuth, Usuario } from '../types/auth';
import { solicitarJson } from './api/http';
import { eliminarToken, guardarToken, obtenerToken } from './storage.service';

interface UsuarioMock {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  avatarUrl: string | null;
  creadoEn: string;
  token: string;
}

const usuariosMock: UsuarioMock[] = usuariosMockData as UsuarioMock[];

// Samuel, asi se hace el inicio de sesión contra la API del profe
// la api pide "contrasena" no "password" como en el backend viejo que hice yo
// y lo que vuelve viene dentro de "datos" ( token y usuario )
export async function iniciarSesion( credenciales: CredencialesLogin ): Promise<RespuestaAuth> {
  const { email, password } = credenciales;
  const { datos } = await solicitarJson( '/auth/ingreso', { metodo: 'POST', cuerpo: { email, contrasena: password } } ) as { datos: RespuestaAuth };

  await guardarToken( datos.token );
  return datos;
}

export async function registrarse( datos: DatosRegistro ): Promise<RespuestaAuth> {
  const { nombre, email, password } = datos;
  const { datos: sesion } = await solicitarJson( '/auth/registro', { metodo: 'POST', cuerpo: { nombre, email, contrasena: password } } ) as { datos: RespuestaAuth };

  await guardarToken( sesion.token );
  return sesion;
}

// Aca recupero sesión activa leyendo el token almacenado en securestore
export async function obtenerSesion(): Promise<Usuario | null> {
  const token = await obtenerToken();
  if (!token) return null;

  try {
    const { datos } = await solicitarJson( '/yo', { token } ) as { datos: Usuario };
    return datos;
  } catch ( error ) {
    console.error( error );
    return null;
  }
}

export async function cerrarSesion(): Promise<void> {
  await eliminarToken();
}
