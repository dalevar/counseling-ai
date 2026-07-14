import { z } from 'zod';
import { SessionStatus, SessionType } from '@prisma/client';

export const bookSessionSchema = z.object({
  body: z
    .object({
      counselorId: z.string().uuid('ID Konselor tidak valid').optional(),
      teacherId: z.string().uuid('ID Guru BK tidak valid').optional(),
      date: z.string().datetime({ message: 'Format tanggal booking tidak valid' }).transform((val) => new Date(val)),
      timeSlot: z.string().min(1, 'Timeslot wajib diisi'), // e.g. "08:00 - 09:00"
      type: z.nativeEnum(SessionType, { errorMap: () => ({ message: 'Tipe konseling harus ONLINE atau OFFLINE' }) }),
    })
    .refine((data) => data.counselorId || data.teacherId, {
      message: 'Harus memilih salah satu antara Konselor atau Guru BK',
      path: ['counselorId'],
    }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(SessionStatus, { errorMap: () => ({ message: 'Status tidak valid' }) }),
  }),
});

export const addNotesSchema = z.object({
  body: z.object({
    notes: z.string().min(1, 'Catatan konselor wajib diisi'),
  }),
});

export const submitFeedbackSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
    feedback: z.string().optional(),
  }),
});
