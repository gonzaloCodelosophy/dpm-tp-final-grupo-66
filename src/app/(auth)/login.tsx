import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/auth.context';
import { borderRadius, colors, fontSize, spacing } from '../../styles/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { iniciarSesion, soportaBiometria, desbloquearConBiometria } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // modal flotante personalizado
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    body: string;
  }>({
    visible: false,
    title: '',
    body: '',
  });

  function mostrarModalNotificacion(title: string, body: string) {
    setModalConfig({ visible: true, title, body });
  }

  function cerrarModalNotificacion() {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  }

  async function handleIngresar() {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completá todos los campos.');
      return;
    }

    try {
      setErrorMsg(null);
      setCargando(true);
      await iniciarSesion({ email: email.trim(), password: password.trim() });
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setCargando(true);
      // simulación de inicio de sesión con google, opcional?
      await new Promise((resolve) => setTimeout(resolve, 800));
      await iniciarSesion({ email: 'usuario.google@gmail.com', password: 'google-auth-pass' });
      router.replace('/(tabs)' as any);
    } catch (error) {
      mostrarModalNotificacion(
        'Autenticación con Google',
        'No se pudo completar el inicio de sesión con Google. Por favor, intentá nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function handleBiometria() {
    try {
      const exito = await desbloquearConBiometria();
      if (exito) {
        router.replace('/(tabs)' as any);
      } else {
        mostrarModalNotificacion(
          'Sin sesión registrada',
          'No se encontró una sesión iniciada en este dispositivo. Primero debés iniciar sesión o registrarte manualmente.'
        );
      }
    } catch (error) {
      mostrarModalNotificacion(
        'Autenticación biométrica',
        'No se pudo verificar la identidad en este dispositivo.'
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.header}>
            <Text style={styles.title}>Mi Ciudad{'\n'}Colón</Text>
            <Text style={styles.subtitle}>Volvé a descubrir Colón</Text>
          </View>

          {/* espacio para iilustracion posterior */}
          <View style={styles.imagePlaceholderSlot} />


          <View style={styles.formContainer}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
              />
              <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} hitSlop={10}>
                <Ionicons
                  name={mostrarPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/recuperar-cuenta' as any)}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleIngresar}
              disabled={cargando}
              activeOpacity={0.85}
            >
              {cargando ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continuá con</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.btnGoogle}
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={18} color={colors.error} style={{ marginRight: spacing.xs }} />
              <Text style={styles.btnGoogleText}>Continuar con Google</Text>
            </TouchableOpacity>

            {/* Biometría (si está disponible) */}
            {soportaBiometria ? (
              <TouchableOpacity
                style={styles.btnBiometric}
                onPress={handleBiometria}
                activeOpacity={0.8}
              >
                <Ionicons name="finger-print-outline" size={20} color={colors.secondary} />
                <Text style={styles.btnBiometricText}>Ingresar con Huella / Rostro</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Todavía no tenés cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/registro' as any)}>
              <Text style={styles.linkText}>Registrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalConfig.visible}
        onRequestClose={cerrarModalNotificacion}
      >
        <TouchableWithoutFeedback onPress={cerrarModalNotificacion}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                <Text style={styles.modalBody}>{modalConfig.body}</Text>

                <TouchableOpacity
                  style={styles.btnModalPrimary}
                  onPress={cerrarModalNotificacion}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnModalPrimaryText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 1.5,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  imagePlaceholderSlot: {
    width: '100%',
    height: spacing.md,
  },
  formContainer: {
    width: '100%',
    marginVertical: spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.caption,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    height: 52,
    marginBottom: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
  forgotBtn: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  forgotText: {
    color: colors.primary,
    fontSize: fontSize.caption,
    fontWeight: 'bold',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  btnPrimaryText: {
    color: colors.surface,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  btnGoogle: {
    flexDirection: 'row',
    height: 50,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGoogleText: {
    color: colors.text,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
  btnBiometric: {
    flexDirection: 'row',
    height: 48,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  btnBiometricText: {
    color: colors.secondary,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.caption,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.caption,
    fontWeight: 'bold',
  },

  /* Modal flotante de notificación unificado */
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
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
    lineHeight: 22,
  },
  btnModalPrimary: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnModalPrimaryText: {
    color: colors.surface,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
});
