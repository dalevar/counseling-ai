import { z } from 'zod';
import { RoleName } from '@prisma/client';

/**
 * Schema for admin/teacher creating a new user account.
 * Public registration is disabled — only staff can enroll new users.
 *
 * Supported roles:
 *  - STUDENT  → requires parentEmail so the system can auto-create a parent account
 *  - COUNSELOR
 *  - TEACHER
 *  - PARENT   (standalone, e.g. orphan guardian)
 */
export const createUserByAdminSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    firstName: z.string().min(1, 'Nama depan wajib diisi'),
    lastName: z.string().min(1, 'Nama belakang wajib diisi'),
    phone: z.string().optional(),
    role: z.nativeEnum(RoleName, {
      errorMap: () => ({ message: 'Role tidak valid' }),
    }),
    schoolId: z.string().uuid('School ID tidak valid').optional(),
    // Student-specific
    birthDate: z.string().optional(),
    gender: z.enum(['L', 'P']).optional(),
    classId: z.string().optional(),
    className: z.string().optional(),
    parentEmail: z.string().email('Format email orang tua tidak valid').optional(),
    parentFirstName: z.string().optional(),
    parentLastName: z.string().optional(),
    parentPhone: z.string().optional(),
    // Teacher/Counselor-specific
    employeeId: z.string().optional(),
    specialization: z.string().optional(),
  }),
});

export const createSchoolSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nama sekolah wajib diisi'),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export const importStudentsSchema = z.object({
  body: z.object({
    schoolId: z.string().uuid('School ID tidak valid').optional(),
  }),
});

export type CreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>['body'];
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>['body'];
export type ImportStudentsInput = z.infer<typeof importStudentsSchema>['body'];
