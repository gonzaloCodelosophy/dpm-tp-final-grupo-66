export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatarUrl: string | null;
  creadoEn: string;
  preferencias?: unknown;
}
// preferencias aún en curso REVISAR cuando esté listo.

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword?: string;
}

export interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}
