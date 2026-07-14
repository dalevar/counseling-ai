import { z } from 'zod';
import { RoleName } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal harus 8 karakter')
      .regex(/[a-z]/, 'Password harus mengandung setidaknya satu huruf kecil')
      .regex(/[A-Z]/, 'Password harus mengandung setidaknya satu huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka'),
    role: z.nativeEnum(RoleName, {
      errorMap: () => ({ message: 'Role tidak valid' }),
    }),
    firstName: z.string().min(1, 'Nama depan wajib diisi'),
    lastName: z.string().min(1, 'Nama belakang wajib diisi'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    code: z.string().length(6, 'OTP harus terdiri dari 6 digit'),
    purpose: z.enum(['VERIFICATION', 'PASSWORD_RESET'], {
      errorMap: () => ({ message: 'Tujuan verifikasi OTP tidak valid' }),
    }),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    purpose: z
      .enum(['VERIFICATION', 'PASSWORD_RESET'], {
        errorMap: () => ({ message: 'Tujuan verifikasi OTP tidak valid' }),
      })
      .optional()
      .default('VERIFICATION'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    token: z.string().min(1, 'Token reset password wajib diisi'),
    password: z
      .string()
      .min(8, 'Password baru minimal harus 8 karakter')
      .regex(/[a-z]/, 'Password harus mengandung setidaknya satu huruf kecil')
      .regex(/[A-Z]/, 'Password harus mengandung setidaknya satu huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token wajib diisi'),
  }),
});
