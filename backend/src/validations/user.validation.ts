import { z } from 'zod';
import { UserStatus, RoleName } from '@prisma/client';

export const updateStudentProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'Nama depan wajib diisi').optional(),
    lastName: z.string().min(1, 'Nama belakang wajib diisi').optional(),
    phone: z.string().optional(),
    birthDate: z
      .string()
      .datetime({ message: 'Format tanggal lahir salah' })
      .optional()
      .or(z.string().transform((val) => (val ? new Date(val).toISOString() : undefined)).optional()),
    gender: z.enum(['MALE', 'FEMALE'], { errorMap: () => ({ message: 'Gender harus MALE atau FEMALE' }) }).optional(),
    parentId: z.string().uuid('Parent ID tidak valid').optional(),
    schoolId: z.string().uuid('School ID tidak valid').optional(),
    classId: z.string().uuid('Class ID tidak valid').optional(),
    academicId: z.string().uuid('Academic ID tidak valid').optional(),
  }),
});

export const updateCounselorProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'Nama depan wajib diisi').optional(),
    lastName: z.string().min(1, 'Nama belakang wajib diisi').optional(),
    phone: z.string().optional(),
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
    bio: z.string().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const updateTeacherProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'Nama depan wajib diisi').optional(),
    lastName: z.string().min(1, 'Nama belakang wajib diisi').optional(),
    phone: z.string().optional(),
    employeeId: z.string().optional(),
    schoolId: z.string().uuid('School ID tidak valid').optional(),
  }),
});

export const updateParentProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'Nama depan wajib diisi').optional(),
    lastName: z.string().min(1, 'Nama belakang wajib diisi').optional(),
    phone: z.string().optional(),
  }),
});

export const adminUpdateUserSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus).optional(),
    roleName: z.nativeEnum(RoleName).optional(),
    isEmailVerified: z.boolean().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z
      .string()
      .min(8, 'Password baru minimal harus 8 karakter')
      .regex(/[a-z]/, 'Password harus mengandung setidaknya satu huruf kecil')
      .regex(/[A-Z]/, 'Password harus mengandung setidaknya satu huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka'),
  }),
});
