import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { borderRadius, colors, fontSize, spacing } from '../../styles/theme';

export default function RecuperarCuentaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleEnviarEnlace() {
    if (!email.trim()) {
      setErrorMsg('Por favor ingresá tu correo electrónico.');
      return;
    }

    try {
      setErrorMsg(null);
      setCargando(true);
      // simulacion de envío de correo de recuperación
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert(
        'Enlace enviado',
        'Revisá tu bandeja de entrada para restablecer tu contraseña.',
        [{ text: 'Entendido', onPress: () => router.replace('/(auth)/login' as any) }]
      );
    } catch (err: any) {
      setErrorMsg('Ocurrió un error al enviar el enlace. Intentalo de nuevo.');
    } finally {
      setCargando(false);
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
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color={colors.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Recuperar{'\n'}contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresá tu correo y te enviaremos un enlace para crear una nueva contraseña.
            </Text>
          </View>

          {/* imagen */}
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

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleEnviarEnlace}
              disabled={cargando}
              activeOpacity={0.85}
            >
              {cargando ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.btnPrimaryText}>Enviar enlace</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => router.replace('/(auth)/login' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>Volver a iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  btnBack: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    marginTop: spacing.sm,
  },
  imagePlaceholderSlot: {
    width: '100%',
    height: spacing.sm,
  },
  formContainer: {
    width: '100%',
    marginTop: spacing.md,
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
    marginBottom: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  btnSecondary: {
    height: 50,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.secondary,
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
});
