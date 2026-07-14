import { z } from 'zod';

export const chatSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid('ID percakapan tidak valid').optional().nullable(),
    message: z
      .string({ required_error: 'Pesan tidak boleh kosong' })
      .min(1, 'Pesan tidak boleh kosong')
      .max(4000, 'Pesan terlalu panjang (maksimal 4000 karakter)'),
  }),
});

export const analyzeEmotionSchema = z.object({
  body: z.object({
    text: z
      .string({ required_error: 'Teks analisis tidak boleh kosong' })
      .min(1, 'Teks tidak boleh kosong')
      .max(2000, 'Teks terlalu panjang'),
  }),
});

export const assessRiskSchema = z.object({
  body: z.object({
    text: z
      .string({ required_error: 'Teks asesmen tidak boleh kosong' })
      .min(1, 'Teks tidak boleh kosong')
      .max(2000, 'Teks terlalu panjang'),
  }),
});

export const recommendationSchema = z.object({
  body: z.object({
    condition: z.string({ required_error: 'Kondisi wajib diisi' }).min(1),
    emotion: z.enum([
      'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral',
    ], { required_error: 'Emosi tidak valid' }),
    issues: z.array(z.string()).min(1, 'Minimal satu masalah harus disebutkan').max(10),
  }),
});

export const assessmentSchema = z.object({
  body: z.object({
    type: z.enum(['PHQ9', 'GAD7'], { required_error: 'Tipe asesmen harus PHQ9 atau GAD7' }),
    answers: z
      .record(z.string(), z.number().min(0, 'Nilai minimal 0').max(3, 'Nilai maksimal 3'))
      .refine((val) => Object.keys(val).length >= 7, {
        message: 'Minimal 7 pertanyaan harus dijawab',
      }),
  }),
});
