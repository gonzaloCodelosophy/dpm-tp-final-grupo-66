export interface Preferencias {
  categoriasFavoritas: string[];
  avisarProximidad: boolean;
  radioAvisoMetros: number;
  tema: 'claro' | 'oscuro' | 'sistema';
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatarUrl: string | null;
  creadoEn: string;
  preferencias?: Preferencias;
}

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
