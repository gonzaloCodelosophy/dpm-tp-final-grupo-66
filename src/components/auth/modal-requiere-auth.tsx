import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTema } from '../../context/tema.context';
import { fuenteTitulo } from '../../styles/inicio';

interface ModalRequiereAuthProps {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
  mensaje?: string;
  status?: string;
}

export function ModalRequiereAuth({
  visible,
  onClose,
  titulo,
  mensaje,
  status,
}: ModalRequiereAuthProps) {
  const router = useRouter();
  const { colorsInicio, colors: colorsBase, oscuro } = useTema();
  const colors = colorsInicio ?? colorsBase;
  const styles = useMemo(() => crearEstilos(colors, oscuro), [colors, oscuro]);

  const esBiometria = status === 'biometria_requerida';

  const tituloFinal =
    titulo || (esBiometria ? 'Desbloqueá tu sesión' : 'Iniciá sesión para continuar');
  const mensajeFinal =
    mensaje ||
    (esBiometria
      ? 'Confirmá tu identidad con huella o rostro para continuar.'
      : 'Podés explorar los lugares y la guía como visitante, pero para guardar tus preferencias y recuerdos necesitás una cuenta.');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalFondoAlerta}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          onPress={onClose}
        />
        <View style={styles.alertaCard} accessibilityViewIsModal>
          <View style={styles.alertaCabecera}>
            <Text style={styles.alertaTitulo}>{tituloFinal}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              onPress={onClose}
              style={styles.alertaCerrar}
            >
              <Ionicons name="close" size={24} color={colors.secondary} />
            </Pressable>
          </View>

          <Text style={styles.alertaMensaje}>{mensajeFinal}</Text>

          <View style={styles.alertaAcciones}>
            <Pressable
              style={styles.btnAlertaNaranja}
              onPress={() => {
                onClose();
                if (esBiometria) {
                  router.push('/(tabs)/perfil');
                } else {
                  router.push('/(auth)/login');
                }
              }}
            >
              <Text style={styles.btnAlertaNaranjaTexto}>
                {esBiometria ? 'Desbloquear sesión' : 'Iniciar sesión'}
              </Text>
            </Pressable>

            <Pressable style={styles.btnAlertaCancelar} onPress={onClose}>
              <Text style={styles.btnAlertaCancelarTexto}>Ahora no</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const crearEstilos = (colors: any, oscuro: boolean) =>
  StyleSheet.create({
    modalFondoAlerta: {
      flex: 1,
      backgroundColor: oscuro ? 'rgba(0, 0, 0, 0.75)' : 'rgba(7, 59, 83, 0.45)',
      justifyContent: 'center',
      padding: 20,
    },
    alertaCard: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
      backgroundColor: oscuro ? colors.surface : colors.background,
      borderRadius: 24,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: oscuro ? '#000000' : colors.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: oscuro ? 0.4 : 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    alertaCabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    alertaTitulo: {
      flex: 1,
      fontFamily: fuenteTitulo,
      fontSize: 21,
      fontWeight: '700',
      color: colors.secondary,
    },
    alertaCerrar: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertaMensaje: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      marginBottom: 22,
    },
    alertaAcciones: {
      gap: 8,
    },
    btnAlertaNaranja: {
      backgroundColor: colors.primary,
      minHeight: 50,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    btnAlertaNaranjaTexto: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    btnAlertaCancelar: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnAlertaCancelarTexto: {
      color: colors.secondary,
      fontSize: 15,
      fontWeight: '600',
    },
  });
