import React, { createContext, useContext, useEffect, useState } from 'react';
import { CredencialesLogin, DatosRegistro, Usuario } from '../types/auth';
import { cerrarSesion as apiCerrarSesion, iniciarSesion as apiIniciarSesion, obtenerSesion, registrarse as apiRegistrarse } from '../services/auth.service';
import { autenticarConBiometria, comprobarSoporteBiometrico } from '../services/biometrics.service';

export type EstadoAuth = 'cargando' | 'autenticado' | 'no_autenticado' | 'biometria_requerida';

interface AuthContextProps {
  usuario: Usuario | null;
  status: EstadoAuth;
  soportaBiometria: boolean;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  desbloquearConBiometria: () => Promise<boolean>;
  saltarBiometria: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [status, setStatus] = useState<EstadoAuth>('cargando');
  const [soportaBiometria, setSoportaBiometria] = useState<boolean>(false);

  useEffect(() => {
    inicializarSesion();
  }, []);

  async function inicializarSesion() {
    try {
      setStatus('cargando');
      const { soportaBiometria: hardwareOk, registrado } = await comprobarSoporteBiometrico();
      const hayBiometriaDisponible = hardwareOk && registrado;
      setSoportaBiometria(hayBiometriaDisponible);

      const usuarioActivo = await obtenerSesion();

      if (usuarioActivo) {
        setUsuario(usuarioActivo);
        if (hayBiometriaDisponible) {
          setStatus('biometria_requerida');
        } else {
          setStatus('autenticado');
        }
      } else {
        setStatus('no_autenticado');
      }
    } catch (error) {
      console.error('Error al inicializar la sesión de autenticación:', error);
      setStatus('no_autenticado');
    }
  }

  async function iniciarSesion(credenciales: CredencialesLogin) {
    const respuesta = await apiIniciarSesion(credenciales);
    setUsuario(respuesta.usuario);
    setStatus('autenticado');
  }

  async function registrarse(datos: DatosRegistro) {
    const respuesta = await apiRegistrarse(datos);
    setUsuario(respuesta.usuario);
    setStatus('autenticado');
  }

  async function cerrarSesion() {
    await apiCerrarSesion();
    setUsuario(null);
    setStatus('no_autenticado');
  }

  async function desbloquearConBiometria(): Promise<boolean> {
    const usuarioActivo = await obtenerSesion();
    if (!usuarioActivo) {
      return false;
    }

    const exito = await autenticarConBiometria('Confirma tu identidad para ingresar');
    if (exito) {
      setUsuario(usuarioActivo);
      setStatus('autenticado');
      return true;
    }
    return false;
  }

  function saltarBiometria() {
    setStatus('autenticado');
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        status,
        soportaBiometria,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        desbloquearConBiometria,
        saltarBiometria,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
