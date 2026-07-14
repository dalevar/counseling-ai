import { CounselingRepository } from '../repositories/counseling.repository';
import { ApiError } from '../utils/ApiError';
import { RoleName, SessionStatus, SessionType } from '@prisma/client';
import { parseQueryParams, getPaginationMeta } from '../helpers/query.helper';
import { prisma } from '../utils/prisma';
import cryptoRandom from 'crypto';

export class CounselingService {
  private repository = new CounselingRepository();

  private generateMeetingLink(): string {
    const randomRoom = cryptoRandom.randomBytes(8).toString('hex');
    return `https://meet.jit.si/educouns-session-${randomRoom}`;
  }

  async bookSession(
    studentId: string,
    data: {
      counselorId?: string;
      teacherId?: string;
      date: Date;
      timeSlot: string;
      type: SessionType;
    }
  ) {
    // 1. Verify existence of counselor or teacher
    if (data.counselorId) {
      const counselor = await prisma.counselor.findUnique({ where: { id: data.counselorId } });
      if (!counselor) throw new ApiError(404, 'Konselor tidak ditemukan');
    }
    if (data.teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { id: data.teacherId } });
      if (!teacher) throw new ApiError(404, 'Guru BK tidak ditemukan');
    }

    // 2. Check for scheduling clash (Overlap)
    const isClash = await this.repository.checkOverlap(
      studentId,
      data.counselorId || null,
      data.teacherId || null,
      data.date,
      data.timeSlot
    );

    if (isClash) {
      throw new ApiError(409, 'Jadwal konseling bentrok. Siswa atau Konselor/Guru sudah memiliki sesi pada jam tersebut.');
    }

    // 3. Setup online meeting link if needed
    const meetingLink = data.type === SessionType.ONLINE ? this.generateMeetingLink() : undefined;

    // 4. Create Session
    const session = await this.repository.createSession({
      studentId,
      counselorId: data.counselorId,
      teacherId: data.teacherId,
      date: data.date,
      timeSlot: data.timeSlot,
      type: data.type,
      meetingLink,
    });

    // 5. Create notifications
    const targetUserId = data.counselorId || data.teacherId;
    if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'Permintaan Sesi Konseling Baru',
          content: `Seorang siswa mengajukan sesi konseling baru pada tanggal ${data.date.toLocaleDateString()} jam ${data.timeSlot}.`,
        },
      });
    }

    return session;
  }

  async listSessions(userId: string, role: RoleName, query: any) {
    const { skip, take, page, limit } = parseQueryParams(query);
    const filterStatus = query.status as SessionStatus | undefined;

    const sessions = await this.repository.findSessions(userId, role, skip, take, filterStatus);
    const total = await this.repository.countSessions(userId, role, filterStatus);
    const meta = getPaginationMeta(total, page, limit);

    return { sessions, meta };
  }

  async getSessionDetail(sessionId: string, userId: string, role: RoleName) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, 'Sesi konseling tidak ditemukan');
    }

    // Authorization check
    if (
      session.studentId !== userId &&
      session.counselorId !== userId &&
      session.teacherId !== userId &&
      role !== RoleName.ADMIN
    ) {
      throw new ApiError(403, 'Akses ditolak ke sesi konseling ini');
    }

    return session;
  }

  async updateStatus(sessionId: string, userId: string, role: RoleName, status: SessionStatus) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, 'Sesi konseling tidak ditemukan');
    }

    // Authorization & State Machine checks
    if (role === RoleName.STUDENT) {
      if (session.studentId !== userId) throw new ApiError(403, 'Akses ditolak');
      if (status !== SessionStatus.CANCELLED) {
        throw new ApiError(400, 'Siswa hanya diperbolehkan membatalkan sesi');
      }
    } else if (role === RoleName.COUNSELOR || role === RoleName.TEACHER) {
      const matchId = role === RoleName.COUNSELOR ? session.counselorId : session.teacherId;
      if (matchId !== userId) throw new ApiError(403, 'Akses ditolak');
    } else if (role !== RoleName.ADMIN) {
      throw new ApiError(403, 'Akses ditolak');
    }

    // Update status
    const updatedSession = await this.repository.updateSession(sessionId, { status });

    // Notify student/counselor
    const notifyUser = role === RoleName.STUDENT ? (session.counselorId || session.teacherId) : session.studentId;
    if (notifyUser) {
      await prisma.notification.create({
        data: {
          userId: notifyUser,
          title: `Status Sesi Konseling Berubah`,
          content: `Status sesi konseling Anda pada ${session.date.toLocaleDateString()} jam ${session.timeSlot} telah diubah menjadi ${status}.`,
        },
      });
    }

    return updatedSession;
  }

  async addNotes(sessionId: string, userId: string, role: RoleName, notes: string) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, 'Sesi konseling tidak ditemukan');
    }

    // Verify counselor/teacher
    if (role === RoleName.COUNSELOR && session.counselorId !== userId) {
      throw new ApiError(403, 'Akses ditolak. Anda bukan konselor sesi ini.');
    }
    if (role === RoleName.TEACHER && session.teacherId !== userId) {
      throw new ApiError(403, 'Akses ditolak. Anda bukan guru BK sesi ini.');
    }
    if (role !== RoleName.COUNSELOR && role !== RoleName.TEACHER && role !== RoleName.ADMIN) {
      throw new ApiError(403, 'Akses ditolak');
    }

    return this.repository.updateSession(sessionId, { notes });
  }

  async submitFeedback(sessionId: string, studentId: string, rating: number, feedback?: string) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, 'Sesi konseling tidak ditemukan');
    }

    if (session.studentId !== studentId) {
      throw new ApiError(403, 'Akses ditolak. Anda bukan siswa pada sesi ini.');
    }

    if (session.status !== SessionStatus.COMPLETED) {
      throw new ApiError(400, 'Feedback hanya dapat diberikan untuk sesi yang telah selesai');
    }

    const updated = await this.repository.updateSession(sessionId, { rating, feedback });

    // Recalculate Counselor rating if counselorId exists
    if (session.counselorId) {
      const avgAggregate = await prisma.sessionCounseling.aggregate({
        where: {
          counselorId: session.counselorId,
          rating: { not: null },
        },
        _avg: {
          rating: true,
        },
      });

      const newAvg = avgAggregate._avg.rating || 0.0;
      await prisma.counselor.update({
        where: { id: session.counselorId },
        data: { rating: parseFloat(newAvg.toFixed(2)) },
      });
    }

    return updated;
  }

  async getChatHistory(sessionId: string, userId: string, role: RoleName) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, 'Sesi konseling tidak ditemukan');
    }

    if (
      session.studentId !== userId &&
      session.counselorId !== userId &&
      session.teacherId !== userId &&
      role !== RoleName.ADMIN
    ) {
      throw new ApiError(403, 'Akses ditolak');
    }

    return this.repository.getMessages(sessionId);
  }
}
