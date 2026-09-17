import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresá un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registroSchema = z
  .object({
    nombre: z
      .string()
      .min(1, 'El nombre es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Ingresá un correo electrónico válido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmarPassword: z
      .string()
      .min(1, 'Confirmá tu contraseña'),
    aceptaTerminos: z
      .boolean()
      .refine((val) => val === true, 'Debés aceptar los términos y la política de privacidad'),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export type RegistroFormData = z.infer<typeof registroSchema>;

export const recuperarCuentaSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresá un correo electrónico válido'),
});

export type RecuperarCuentaFormData = z.infer<typeof recuperarCuentaSchema>;
