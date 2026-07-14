import { JournalRepository } from '../repositories/journal.repository';
import { llmService } from '../ai/llm.service';
import { EMOTION_ANALYSIS_PROMPT } from '../ai/prompts';
import { ApiError } from '../utils/ApiError';
import { parseQueryParams, getPaginationMeta } from '../helpers/query.helper';
import { prisma } from '../utils/prisma';
import type { Request } from 'express';

export class JournalService {
  private repository = new JournalRepository();

  // ─── Journals ─────────────────────────────────────────────────────────────

  async createJournal(userId: string, title: string, content: string, isPrivate = true) {
    const student = await prisma.student.findUnique({ where: { id: userId } });
    if (!student) throw new ApiError(403, 'Hanya siswa yang dapat membuat jurnal');

    // Auto-detect sentiment via LLM (non-blocking)
    let sentiment: string | undefined;
    try {
      const analysis = await llmService.complete<{ sentiment: string }>(
        EMOTION_ANALYSIS_PROMPT.replace('{text}', content.slice(0, 500))
      );
      sentiment = analysis.sentiment;
    } catch {
      // Non-blocking — proceed without sentiment
    }

    return this.repository.create({ studentId: userId, title, content, isPrivate, sentiment });
  }

  async getJournals(userId: string, req: Request) {
    const { page, limit } = parseQueryParams(req.query);
    const search = req.query.search as string | undefined;
    const { journals, total } = await this.repository.findByStudent(userId, page, limit, search);
    return { data: journals, meta: getPaginationMeta(total, page, limit) };
  }

  async getJournalById(id: string, userId: string) {
    const journal = await this.repository.findById(id);
    if (!journal) throw new ApiError(404, 'Jurnal tidak ditemukan');
    if (journal.studentId !== userId) throw new ApiError(403, 'Akses ditolak');
    return journal;
  }

  async updateJournal(
    id: string,
    userId: string,
    data: { title?: string; content?: string; isPrivate?: boolean }
  ) {
    const journal = await this.repository.findById(id);
    if (!journal) throw new ApiError(404, 'Jurnal tidak ditemukan');
    if (journal.studentId !== userId) throw new ApiError(403, 'Akses ditolak');

    // Re-analyse sentiment if content changed
    let sentiment: string | undefined;
    if (data.content) {
      try {
        const analysis = await llmService.complete<{ sentiment: string }>(
          EMOTION_ANALYSIS_PROMPT.replace('{text}', data.content.slice(0, 500))
        );
        sentiment = analysis.sentiment;
      } catch {
        // Non-blocking
      }
    }

    return this.repository.update(id, { ...data, ...(sentiment && { sentiment }) });
  }

  async deleteJournal(id: string, userId: string) {
    const journal = await this.repository.findById(id);
    if (!journal) throw new ApiError(404, 'Jurnal tidak ditemukan');
    if (journal.studentId !== userId) throw new ApiError(403, 'Akses ditolak');
    await this.repository.delete(id);
  }

  // ─── Mood Tracking ─────────────────────────────────────────────────────────

  async logMood(userId: string, moodScore: number, notes?: string) {
    const student = await prisma.student.findUnique({ where: { id: userId } });
    if (!student) throw new ApiError(403, 'Hanya siswa yang dapat mencatat mood');

    if (moodScore < 1 || moodScore > 5) {
      throw new ApiError(400, 'Skor mood harus antara 1 (sangat buruk) hingga 5 (sangat baik)');
    }

    // Auto-detect emotion from notes
    let emotionDetected: string | undefined;
    if (notes) {
      try {
        const analysis = await llmService.complete<{ emotion: string }>(
          EMOTION_ANALYSIS_PROMPT.replace('{text}', notes.slice(0, 300))
        );
        emotionDetected = analysis.emotion;
      } catch {
        // Non-blocking
      }
    }

    return this.repository.createMood({ studentId: userId, moodScore, notes, emotionDetected });
  }

  async getMoodHistory(userId: string, days = 30) {
    const student = await prisma.student.findUnique({ where: { id: userId } });
    if (!student) throw new ApiError(403, 'Hanya siswa yang dapat melihat riwayat mood');
    return this.repository.getMoodHistory(userId, days);
  }

  async getMoodStats(userId: string, days = 30) {
    const student = await prisma.student.findUnique({ where: { id: userId } });
    if (!student) throw new ApiError(403, 'Hanya siswa yang dapat melihat statistik mood');
    return this.repository.getMoodStats(userId, days);
  }
}
