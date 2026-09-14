import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/auth.context';
import { borderRadius, colors, fontSize, spacing } from '../../styles/theme';

export default function PerfilScreen() {
  const router = useRouter();
  const { usuario, status, cerrarSesion } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  async function confirmarCerrarSesion() {
    setModalVisible(false);
    await cerrarSesion();
    router.replace('/(auth)/login' as any);
  }

  const iniciales = usuario?.nombre
    ? usuario.nombre
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
    : 'U';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        {status === 'autenticado' && usuario ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{iniciales}</Text>
              </View>
              <Text style={styles.userName}>{usuario.nombre}</Text>
              <Text style={styles.userEmail}>{usuario.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.btnLogout}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={styles.btnLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={40} color={colors.secondary} />
            </View>
            <Text style={styles.guestTitle}>Modo Visitante</Text>
            <Text style={styles.guestSubtitle}>
              Podés explorar el mapa y lugares libremente. Iniciá sesión para guardar tus eventos favoritos y registradas.
            </Text>

            <TouchableOpacity
              style={styles.btnLogin}
              onPress={() => router.push('/(auth)/login' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnLoginText}>Iniciar sesión / Registrarse</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal flotante personalizado de cierre de sesion */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
                <Text style={styles.modalBody}>
                  Vas a tener que volver a ingresar para acceder a tus favoritos y visitas guardadas.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnConfirmLogout}
                    onPress={confirmarCerrarSesion}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnConfirmLogoutText}>Cerrar sesión</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: 'bold',
    color: colors.secondary,
  },

  /* card usuario autenticado */
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.surface,
    fontSize: fontSize.title,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: fontSize.subtitle,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  btnLogout: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    height: 52,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.error,
  },
  btnLogoutText: {
    color: colors.error,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },

  /* card visitante */
  guestCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  guestIconCircle: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  guestTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  guestSubtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  btnLogin: {
    backgroundColor: colors.primary,
    height: 52,
    width: '100%',
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  btnLoginText: {
    color: colors.surface,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },

  /* modal de confirmacion */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalBody: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  btnCancel: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelText: {
    color: colors.primary,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
  btnConfirmLogout: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirmLogoutText: {
    color: colors.surface,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
});
