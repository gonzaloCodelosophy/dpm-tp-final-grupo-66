import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/auth.context';
import { registroSchema, RegistroFormData } from '../../schemas/auth.schema';
import { borderRadius, colors, fontSize, spacing } from '../../styles/theme';

export default function RegistroScreen() {
  const router = useRouter();
  const { registrarse } = useAuth();

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmarPassword: '',
      aceptaTerminos: false,
    },
  });

  async function handleRegistro(data: RegistroFormData) {
    try {
      setErrorMsg(null);
      setCargando(true);
      await registrarse({
        nombre: data.nombre.trim(),
        email: data.email.trim(),
        password: data.password.trim(),
        confirmarPassword: data.confirmarPassword.trim(),
      });
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al registrar la cuenta.');
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

          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>
                Guardá tus lugares favoritos y registrá cada experiencia
              </Text>
            </View>
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

            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.nombre && styles.inputContainerError]}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
            {errors.nombre ? (
              <Text style={styles.fieldErrorText}>{errors.nombre.message}</Text>
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
            />
            {errors.email ? (
              <Text style={styles.fieldErrorText}>{errors.email.message}</Text>
            ) : null}

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
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
              )}
            />
            {errors.password ? (
              <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
            ) : null}

            <Controller
              control={control}
              name="confirmarPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.confirmarPassword && styles.inputContainerError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!mostrarConfirmar}
                  />
                  <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)} hitSlop={10}>
                    <Ionicons
                      name={mostrarConfirmar ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmarPassword ? (
              <Text style={styles.fieldErrorText}>{errors.confirmarPassword.message}</Text>
            ) : null}

            <Controller
              control={control}
              name="aceptaTerminos"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => onChange(!value)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, value && styles.checkboxActive, errors.aceptaTerminos && styles.checkboxError]}>
                    {value ? <Ionicons name="checkmark" size={14} color={colors.surface} /> : null}
                  </View>
                  <Text style={styles.termsText}>
                    Acepto los <Text style={styles.termsLink}>términos</Text> y la{' '}
                    <Text style={styles.termsLink}>política de privacidad</Text>
                  </Text>
                </TouchableOpacity>
              )}
            />
            {errors.aceptaTerminos ? (
              <Text style={styles.fieldErrorText}>{errors.aceptaTerminos.message}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleSubmit(handleRegistro)}
              disabled={cargando}
              activeOpacity={0.85}
            >
              {cargando ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.btnPrimaryText}>Registrarme</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tenés cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={styles.linkText}>Iniciá sesión</Text>
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
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.xs,
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
    height: spacing.sm,
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
  inputContainerError: {
    borderColor: colors.error,
  },
  fieldErrorText: {
    color: colors.error,
    fontSize: fontSize.caption,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm / 2,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  termsText: {
    fontSize: fontSize.caption,
    color: colors.text,
    flex: 1,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
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
});
