import usuariosMockData from '../mocks/usuarios-mock.json';
import { CredencialesLogin, DatosRegistro, RespuestaAuth, Usuario } from '../types/auth';
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

// simulacion de inicio de sesión
export async function iniciarSesion(credenciales: CredencialesLogin): Promise<RespuestaAuth> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const usuarioEncontrado = usuariosMock.find(
    (u: UsuarioMock) => u.email.toLowerCase() === credenciales.email.toLowerCase() && u.password === credenciales.password
  );

  if (!usuarioEncontrado) {
    throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  const { password, token, ...usuarioSinPassword } = usuarioEncontrado;

  await guardarToken(token);

  return {
    token,
    usuario: usuarioSinPassword as Usuario,
  };
}

// registro usuario simulado con id unico con timestamp
export async function registrarse(datos: DatosRegistro): Promise<RespuestaAuth> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const existe = usuariosMock.some((u: UsuarioMock) => u.email.toLowerCase() === datos.email.toLowerCase());
  if (existe) {
    throw new Error('El correo electrónico ya se encuentra registrado.');
  }

  const nuevoToken = `mock-bearer-token-${Date.now()}`;
  const nuevoUsuarioItem: UsuarioMock = {
    id: `usr-${Date.now()}`,
    nombre: datos.nombre,
    email: datos.email,
    password: datos.password,
    avatarUrl: null,
    creadoEn: new Date().toISOString(),
    token: nuevoToken,
  };

  usuariosMock.push(nuevoUsuarioItem);
  await guardarToken(nuevoToken);

  const { password, token, ...usuarioSinPassword } = nuevoUsuarioItem;

  return {
    token: nuevoToken,
    usuario: usuarioSinPassword as Usuario,
  };
}

// recupero sesión activa leyendo el token almacenado en securestore
export async function obtenerSesion(): Promise<Usuario | null> {
  const token = await obtenerToken();
  if (!token) return null;

  const usuarioEncontrado = usuariosMock.find((u: UsuarioMock) => u.token === token);
  if (usuarioEncontrado) {
    const { password, token: _tokenIgnorado, ...usuarioSinPassword } = usuarioEncontrado;
    return usuarioSinPassword as Usuario;
  }

  return null;
}

export async function cerrarSesion(): Promise<void> {
  await eliminarToken();
}
