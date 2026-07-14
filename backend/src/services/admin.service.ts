import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { parseQueryParams, getPaginationMeta } from '../helpers/query.helper';
import { ApiError } from '../utils/ApiError';
import { UserStatus, RoleName } from '@prisma/client';
import type { Request } from 'express';
import XLSX from 'xlsx';
import type {
  CreateSchoolInput,
  CreateUserByAdminInput,
} from '../validations/admin.validation';

export class AdminService {
  private async getActorContext(createdById: string) {
    const actor = await prisma.user.findUnique({
      where: { id: createdById },
      include: {
        role: true,
        teacher: true,
      },
    });

    if (!actor) {
      throw new ApiError(404, 'Pengguna pembuat akun tidak ditemukan');
    }

    return actor;
  }

  private async resolveSchoolId(
    role: RoleName,
    createdById: string,
    schoolId?: string,
  ) {
    const actor = await this.getActorContext(createdById);

    if (actor.role.name === RoleName.TEACHER) {
      const teacherSchoolId = actor.teacher?.schoolId;
      if (!teacherSchoolId) {
        throw new ApiError(422, 'Guru BK belum terhubung ke sekolah mana pun');
      }
      return teacherSchoolId;
    }

    if (role === RoleName.STUDENT || role === RoleName.TEACHER) {
      if (!schoolId) {
        throw new ApiError(422, 'School ID wajib diisi untuk siswa dan guru BK');
      }

      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school) {
        throw new ApiError(404, 'Sekolah tidak ditemukan');
      }
    }

    return schoolId;
  }

  private async resolveClassId(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    schoolId?: string,
    classId?: string,
    className?: string,
  ) {
    if (classId) {
      const existingClass = await tx.class.findUnique({ where: { id: classId } });
      if (!existingClass) {
        throw new ApiError(404, 'Kelas tidak ditemukan');
      }
      return existingClass.id;
    }

    if (!schoolId || !className?.trim()) {
      return undefined;
    }

    const normalizedClassName = className.trim();
    const existing = await tx.class.findFirst({
      where: { schoolId, name: normalizedClassName },
    });

    if (existing) {
      return existing.id;
    }

    const created = await tx.class.create({
      data: {
        schoolId,
        name: normalizedClassName,
      },
    });

    return created.id;
  }

  // ─── Dashboard Statistics ─────────────────────────────────────────────────

  async getDashboardStats() {
    const [
      totalUsers,
      totalStudents,
      totalCounselors,
      activeSessions,
      completedSessions,
      pendingSessions,
      totalAssessments,
      totalConversations,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.counselor.count(),
      prisma.sessionCounseling.count({ where: { status: 'ONGOING' } }),
      prisma.sessionCounseling.count({ where: { status: 'COMPLETED' } }),
      prisma.sessionCounseling.count({ where: { status: 'PENDING' } }),
      prisma.mentalHealthAssessment.count(),
      prisma.aIConversation.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Mood average for last 30 days
    const moodRecords = await prisma.moodTracking.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { moodScore: true },
    });
    const avgMood =
      moodRecords.length > 0
        ? parseFloat(
            (moodRecords.reduce((s, m) => s + m.moodScore, 0) / moodRecords.length).toFixed(2)
          )
        : 0;

    return {
      users: { total: totalUsers, students: totalStudents, counselors: totalCounselors, newThisMonth: newUsersThisMonth },
      sessions: { active: activeSessions, completed: completedSessions, pending: pendingSessions },
      ai: { totalAssessments, totalConversations },
      wellness: { avgMoodScore: avgMood, moodRecordsLast30Days: moodRecords.length },
    };
  }

  // ─── User Management ──────────────────────────────────────────────────────

  async getUsers(req: Request) {
    const { page, limit } = parseQueryParams(req.query);
    const { search, role, status } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }
    if (role) {
      where.role = { name: role as RoleName };
    }
    if (status) {
      where.status = status as UserStatus;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          status: true,
          isEmailVerified: true,
          createdAt: true,
          role: { select: { name: true } },
          student: { select: { firstName: true, lastName: true } },
          counselor: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { data: users, meta: getPaginationMeta(total, page, limit) };
  }

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        student: true,
        counselor: true,
        _count: {
          select: {
            aiConversations: true,
            mentalHealthAssessments: true,
            notifications: true,
          },
        },
      },
    });
    if (!user) throw new ApiError(404, 'Pengguna tidak ditemukan');
    return user;
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'Pengguna tidak ditemukan');
    return prisma.user.update({ where: { id: userId }, data: { status } });
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'Pengguna tidak ditemukan');
    await prisma.user.delete({ where: { id: userId } });
  }

  // ─── Counseling Sessions Overview ─────────────────────────────────────────

  async getAllSessions(req: Request) {
    const { page, limit } = parseQueryParams(req.query);
    const { status } = req.query as Record<string, string>;

    const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' } : {};

    const [sessions, total] = await Promise.all([
      prisma.sessionCounseling.findMany({
        where,
        include: {
          student: { include: { user: { select: { email: true } } } },
          counselor: { include: { user: { select: { email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sessionCounseling.count({ where }),
    ]);

    return { data: sessions, meta: getPaginationMeta(total, page, limit) };
  }

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  async getAuditLogs(req: Request) {
    const { page, limit } = parseQueryParams(req.query);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);
    return { data: logs, meta: getPaginationMeta(total, page, limit) };
  }

  // ─── Risk Alerts (high-risk AI messages) ─────────────────────────────────

  async getRiskAlerts(req: Request) {
    const { page, limit } = parseQueryParams(req.query);
    const [messages, total] = await Promise.all([
      prisma.aIMessage.findMany({
        where: { riskLevel: { in: ['high', 'critical'] } },
        include: {
          conversation: {
            include: { user: { select: { id: true, email: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.aIMessage.count({ where: { riskLevel: { in: ['high', 'critical'] } } }),
    ]);
    return { data: messages, meta: getPaginationMeta(total, page, limit) };
  }

  // ─── Assessment Summary ───────────────────────────────────────────────────

  async getAssessmentSummary() {
    const [phq9, gad7] = await Promise.all([
      prisma.mentalHealthAssessment.findMany({ where: { type: 'PHQ9' }, select: { score: true } }),
      prisma.mentalHealthAssessment.findMany({ where: { type: 'GAD7' }, select: { score: true } }),
    ]);

    const avg = (arr: { score: number }[]) =>
      arr.length ? parseFloat((arr.reduce((s, a) => s + a.score, 0) / arr.length).toFixed(2)) : 0;

    return {
      PHQ9: { count: phq9.length, avgScore: avg(phq9) },
      GAD7: { count: gad7.length, avgScore: avg(gad7) },
    };
  }

  async getSchools(createdById: string) {
    const actor = await this.getActorContext(createdById);

    if (actor.role.name === RoleName.TEACHER) {
      if (!actor.teacher?.schoolId) {
        return [];
      }

      const school = await prisma.school.findUnique({
        where: { id: actor.teacher.schoolId },
        include: {
          classes: { orderBy: { name: 'asc' } },
          _count: { select: { teachers: true, students: true } },
        },
      });

      return school ? [school] : [];
    }

    return prisma.school.findMany({
      include: {
        classes: { orderBy: { name: 'asc' } },
        _count: { select: { teachers: true, students: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createSchool(data: CreateSchoolInput, createdById: string) {
    const school = await prisma.school.create({
      data: {
        name: data.name.trim(),
        address: data.address?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_CREATE_SCHOOL',
        tableName: 'School',
        recordId: school.id,
        newValues: JSON.stringify(school),
        userId: createdById,
      },
    });

    return school;
  }

  // ─── Create User by Admin / Guru BK ──────────────────────────────────────

  /**
   * Creates a new user account initiated by an admin or teacher.
   *
   * Flow:
   *  1. Generate a temporary password and hash it.
   *  2. Look up the target role.
   *  3. Create User + role-specific profile in a single transaction.
   *  4. For STUDENT role: optionally create or link a Parent account.
   *  5. Return the created user data (password NOT returned for security).
   *
   * The user must change their password on first login (handled by the
   * PENDING status + Activation flow).
   */
  async createUserByAdmin(data: CreateUserByAdminInput, createdById: string) {
    // 1. Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ApiError(409, `Email ${data.email} sudah terdaftar`);

    // Resolve creator's email for audit log
    const creator = await prisma.user.findUnique({ where: { id: createdById }, select: { email: true } });
    const createdByEmail = creator?.email ?? createdById;

    // 2. Generate temporary password  (user will reset on first login)
    const tempPassword = crypto.randomBytes(8).toString('hex'); // 16-char hex
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const resolvedSchoolId = await this.resolveSchoolId(
      data.role as RoleName,
      createdById,
      data.schoolId,
    );

    // 3. Resolve role id
    const role = await prisma.role.findUnique({ where: { name: data.role as RoleName } });
    if (!role) throw new ApiError(500, `Role ${data.role} tidak ditemukan di database`);

    // 4. Transactional creation
    const newUser = await prisma.$transaction(async (tx) => {
      // 4a. Create core user
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          roleId: role.id,
          status: UserStatus.PENDING, // Must activate via email
          isEmailVerified: false,
        },
        include: { role: true },
      });

      // 4b. Role-specific profile
      if (data.role === RoleName.STUDENT) {
        const resolvedClassId = await this.resolveClassId(
          tx,
          resolvedSchoolId,
          data.classId,
          data.className,
        );
        let parentId: string | undefined;

        // Auto-create parent account if parentEmail is provided
        if (data.parentEmail) {
          let parentUser = await tx.user.findUnique({ where: { email: data.parentEmail } });
          if (!parentUser) {
            const parentRole = await tx.role.findUnique({ where: { name: RoleName.PARENT } });
            if (!parentRole) throw new Error('Role PARENT tidak ditemukan');
            const parentPasswordHash = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 12);
            parentUser = await tx.user.create({
              data: {
                email: data.parentEmail,
                passwordHash: parentPasswordHash,
                roleId: parentRole.id,
                status: UserStatus.PENDING,
                isEmailVerified: false,
              },
            });
            await tx.parent.create({
              data: {
                id: parentUser.id,
                firstName: data.parentFirstName ?? 'Orang Tua',
                lastName: data.parentLastName ?? 'Siswa',
                phone: data.parentPhone,
              },
            });
          }
          parentId = parentUser.id;
        }

        await tx.student.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            schoolId: resolvedSchoolId,
            classId: resolvedClassId,
            parentId,
          },
        });
      } else if (data.role === RoleName.COUNSELOR) {
        await tx.counselor.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            specialization: data.specialization,
          },
        });
      } else if (data.role === RoleName.TEACHER) {
        await tx.teacher.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            employeeId: data.employeeId,
            schoolId: resolvedSchoolId,
          },
        });
      } else if (data.role === RoleName.PARENT) {
        await tx.parent.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        });
      }

      // 4c. Audit log
      await tx.auditLog.create({
        data: {
          action: 'ADMIN_CREATE_USER',
          tableName: 'User',
          recordId: user.id,
          newValues: JSON.stringify({ email: data.email, role: data.role, createdBy: createdByEmail }),
          userId: createdById,
        },
      });

      return user;
    });

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role.name,
      status: newUser.status,
      tempPassword, // Return temp password so admin can share with user securely
    };
  }

  async importStudentsFromSpreadsheet(
    file: Express.Multer.File | undefined,
    createdById: string,
    schoolId?: string,
  ) {
    if (!file) {
      throw new ApiError(400, 'File Excel wajib diunggah');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new ApiError(400, 'Workbook Excel tidak memiliki sheet');
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

    if (rows.length === 0) {
      throw new ApiError(400, 'File Excel tidak memiliki data siswa');
    }

    const normalizeRow = (row: Record<string, unknown>) => {
      const normalized: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        normalized[key.toLowerCase().replace(/\s+/g, '')] = String(value ?? '').trim();
      });
      return normalized;
    };

    const results: Array<Record<string, unknown>> = [];

    for (const [index, rawRow] of rows.entries()) {
      const row = normalizeRow(rawRow);

      try {
        const payload: CreateUserByAdminInput = {
          role: RoleName.STUDENT,
          email: row.email,
          firstName: row.firstname || row.namadepan || row.nama || '',
          lastName: row.lastname || row.namabelakang || '-',
          phone: row.phone || row.nohp || row.nomortelepon || undefined,
          gender:
            row.gender === 'L' || row.gender === 'P'
              ? (row.gender as 'L' | 'P')
              : row.jeniskelamin === 'L' || row.jeniskelamin === 'P'
                ? (row.jeniskelamin as 'L' | 'P')
                : undefined,
          birthDate: row.birthdate || row.tanggallahir || undefined,
          className: row.classname || row.kelas || undefined,
          parentEmail: row.parentemail || row.emailorangtua || undefined,
          parentFirstName: row.parentfirstname || row.namaorangtua || undefined,
          parentLastName: row.parentlastname || undefined,
          parentPhone: row.parentphone || row.nohporangtua || undefined,
          schoolId,
        };

        const created = await this.createUserByAdmin(payload, createdById);
        results.push({
          row: index + 2,
          email: payload.email,
          status: 'SUCCESS',
          userId: created.id,
          tempPassword: created.tempPassword,
        });
      } catch (error) {
        results.push({
          row: index + 2,
          email: row.email || '',
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Gagal memproses baris',
        });
      }
    }

    const successCount = results.filter((item) => item.status === 'SUCCESS').length;

    return {
      totalRows: results.length,
      successCount,
      failedCount: results.length - successCount,
      results,
    };
  }
}
