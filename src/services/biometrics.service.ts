import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/**
 * Verifica si el dispositivo soporta biometría y si el usuario tiene huella/rostro configurados.
 */
export async function comprobarSoporteBiometrico(): Promise<{
  soportaBiometria: boolean;
  registrado: boolean;
}> {
  try {
    if (Platform.OS === 'web') {
      return { soportaBiometria: false, registrado: false };
    }
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return {
      soportaBiometria: compatible,
      registrado: enrolled,
    };
  } catch (error) {
    console.error('Error al comprobar soporte biométrico:', error);
    return { soportaBiometria: false, registrado: false };
  }
}

/**
 * Solicita la autenticación biométrica (huella / rostro) al usuario.
 */
export async function autenticarConBiometria(
  mensajePrompt: string = 'Ingresa con tu huella o rostro'
): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return false;
    }
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: mensajePrompt,
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });
    return resultado.success;
  } catch (error) {
    console.error('Error durante la autenticación biométrica:', error);
    return false;
  }
}
