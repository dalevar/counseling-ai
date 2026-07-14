import { prisma } from '../utils/prisma';

export interface CreateJournalData {
  studentId: string;
  title: string;
  content: string;
  isPrivate?: boolean;
  sentiment?: string;
}

export interface CreateMoodData {
  studentId: string;
  moodScore: number;
  notes?: string;
  emotionDetected?: string;
}

export class JournalRepository {
  // ─── Journal CRUD ─────────────────────────────────────────────────────────

  async create(data: CreateJournalData) {
    return prisma.journal.create({ data: {
      studentId: data.studentId,
      title: data.title,
      content: data.content,
      isPrivate: data.isPrivate ?? true,
      sentiment: data.sentiment,
    }});
  }

  async findById(id: string) {
    return prisma.journal.findUnique({
      where: { id },
      include: { attachments: true },
    });
  }

  async findByStudent(
    studentId: string,
    page: number,
    limit: number,
    search?: string
  ) {
    const where = {
      studentId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { content: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [journals, total] = await Promise.all([
      prisma.journal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.journal.count({ where }),
    ]);

    return { journals, total };
  }

  async update(id: string, data: Partial<CreateJournalData> & { sentiment?: string }) {
    return prisma.journal.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.journal.delete({ where: { id } });
  }

  // ─── Mood Tracking ────────────────────────────────────────────────────────

  async createMood(data: CreateMoodData) {
    return prisma.moodTracking.create({ data });
  }

  async getMoodHistory(studentId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.moodTracking.findMany({
      where: { studentId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMoodStats(studentId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const moods = await prisma.moodTracking.findMany({
      where: { studentId, createdAt: { gte: since } },
      select: { moodScore: true, emotionDetected: true, createdAt: true },
    });

    if (!moods.length) return { avg: 0, min: 0, max: 0, trend: 'stable', total: 0 };

    const scores = moods.map((m) => m.moodScore);
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    // Simple trend: compare last 5 vs first 5
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / (secondHalf.length || 1);
    const trend = secondAvg > firstAvg + 0.3 ? 'improving' : secondAvg < firstAvg - 0.3 ? 'declining' : 'stable';

    return { avg: parseFloat(avg.toFixed(2)), min, max, trend, total: moods.length };
  }
}
