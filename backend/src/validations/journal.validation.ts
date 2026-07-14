import { z } from 'zod';

export const createJournalSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Judul jurnal wajib diisi' })
      .min(3, 'Judul minimal 3 karakter')
      .max(200, 'Judul terlalu panjang'),
    content: z
      .string({ required_error: 'Isi jurnal wajib diisi' })
      .min(10, 'Isi jurnal minimal 10 karakter'),
    isPrivate: z.boolean().optional().default(true),
  }),
});

export const updateJournalSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(10).optional(),
    isPrivate: z.boolean().optional(),
  }),
});

export const logMoodSchema = z.object({
  body: z.object({
    moodScore: z
      .number({ required_error: 'Skor mood wajib diisi' })
      .int('Skor mood harus bilangan bulat')
      .min(1, 'Skor mood minimal 1')
      .max(5, 'Skor mood maksimal 5'),
    notes: z.string().max(1000, 'Catatan terlalu panjang').optional(),
  }),
});
