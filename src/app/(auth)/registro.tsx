import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { FalloDatos } from '../../services/errores';
import { borderRadius, colors, fontSize, spacing } from '../../styles/theme';
import { fuenteTitulo } from '../../styles/inicio';

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
      if (err instanceof FalloDatos || err?.detalle) {
        const codigo = err?.detalle?.codigo;
        if (codigo === 'EMAIL_YA_REGISTRADO' || codigo === 'HTTP_409') {
          setErrorMsg('El correo electrónico ya se encuentra registrado.');
          return;
        }
        if (codigo === 'VALIDACION_FALLIDA' || codigo === 'HTTP_400') {
          setErrorMsg('Los datos ingresados no cumplen con el formato requerido (la contraseña debe tener al menos 8 caracteres).');
          return;
        }
        if (codigo === 'RED_NO_DISPONIBLE' || codigo === 'TIEMPO_AGOTADO') {
          setErrorMsg('No se pudo conectar con el servidor. Comprobá tu conexión a internet.');
          return;
        }
        if (codigo === 'API_NO_CONFIGURADA') {
          setErrorMsg('El servicio no se encuentra disponible temporalmente. Por favor, intentá más tarde.');
          return;
        }
      }
      setErrorMsg(err?.message || 'Ocurrió un error al registrar la cuenta.');
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
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.btnBackCircle}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Image
              source={require('../../../assets/images/logo-colon.png')}
              style={styles.topLogo}
              resizeMode="contain"
            />
            <View style={styles.navBarPlaceholder} />
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>
                Guardá tus lugares favoritos y registrá cada experiencia
              </Text>
            </View>
            <Image
              source={require('../../../assets/images/ilustracion_crear_cuenta.png')}
              style={styles.heroImageFaro}
              resizeMode="contain"
            />
          </View>

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
    backgroundColor: colors.surface,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  btnBackCircle: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  topLogo: {
    width: 145,
    height: 54,
  },
  navBarPlaceholder: {
    width: 38,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  heroText: {
    flex: 1,
    paddingRight: 6,
  },
  heroImageFaro: {
    width: 195,
    height: 155,
    marginRight: -spacing.lg,
  },
  title: {
    fontFamily: fuenteTitulo,
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  formContainer: {
    width: '100%',
    marginTop: spacing.xs,
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
    borderRadius: borderRadius.md,
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
    marginLeft: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
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
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
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
    fontSize: 12,
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
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  btnPrimaryText: {
    color: colors.surface,
    fontSize: 16,
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
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
