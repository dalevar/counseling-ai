import { prisma } from '../utils/prisma';
import { SessionCounseling, SessionStatus, SessionType, CounselingMessage, RoleName } from '@prisma/client';

export interface CreateSessionData {
  studentId: string;
  counselorId?: string;
  teacherId?: string;
  date: Date;
  timeSlot: string;
  type: SessionType;
  meetingLink?: string;
}

export class CounselingRepository {
  async createSession(data: CreateSessionData): Promise<SessionCounseling> {
    return prisma.sessionCounseling.create({
      data: {
        studentId: data.studentId,
        counselorId: data.counselorId || null,
        teacherId: data.teacherId || null,
        date: data.date,
        timeSlot: data.timeSlot,
        type: data.type,
        meetingLink: data.meetingLink || null,
        status: SessionStatus.PENDING,
      },
    });
  }

  async checkOverlap(
    studentId: string,
    counselorId: string | null,
    teacherId: string | null,
    date: Date,
    timeSlot: string
  ): Promise<boolean> {
    // Check if date overlaps. We compare the date component (YYYY-MM-DD)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const overlapping = await prisma.sessionCounseling.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timeSlot,
        status: {
          in: [SessionStatus.PENDING, SessionStatus.APPROVED, SessionStatus.ONGOING],
        },
        OR: [
          { studentId },
          ...(counselorId ? [{ counselorId }] : []),
          ...(teacherId ? [{ teacherId }] : []),
        ],
      },
    });

    return !!overlapping;
  }

  async findSessionById(id: string): Promise<SessionCounseling | null> {
    return prisma.sessionCounseling.findUnique({
      where: { id },
      include: {
        student: true,
        counselor: true,
        teacher: true,
      },
    });
  }

  async findSessions(
    userId: string,
    role: RoleName,
    skip: number,
    take: number,
    status?: SessionStatus
  ): Promise<SessionCounseling[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Role filtering
    if (role === RoleName.STUDENT) {
      where.studentId = userId;
    } else if (role === RoleName.COUNSELOR) {
      where.counselorId = userId;
    } else if (role === RoleName.TEACHER) {
      where.teacherId = userId;
    }

    return prisma.sessionCounseling.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        student: true,
        counselor: true,
        teacher: true,
      },
    });
  }

  async countSessions(userId: string, role: RoleName, status?: SessionStatus): Promise<number> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    if (role === RoleName.STUDENT) {
      where.studentId = userId;
    } else if (role === RoleName.COUNSELOR) {
      where.counselorId = userId;
    } else if (role === RoleName.TEACHER) {
      where.teacherId = userId;
    }

    return prisma.sessionCounseling.count({ where });
  }

  async updateSession(id: string, data: Partial<SessionCounseling>): Promise<SessionCounseling> {
    return prisma.sessionCounseling.update({
      where: { id },
      data,
    });
  }

  // Live Chat Queries
  async getMessages(sessionId: string): Promise<CounselingMessage[]> {
    return prisma.counselingMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
