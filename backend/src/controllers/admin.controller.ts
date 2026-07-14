import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated } from '../helpers/response';
import { UserStatus } from '@prisma/client';
import {
  createSchoolSchema,
  createUserByAdminSchema,
  importStudentsSchema,
} from '../validations/admin.validation';

export class AdminController {
  private service = new AdminService();

  private requireAdmin(req: Request) {
    if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
    if (req.user.role !== 'ADMIN') throw new ApiError(403, 'Akses hanya untuk Administrator');
  }

  /** Admin OR Guru BK (TEACHER) may create users */
  private requireStaff(req: Request) {
    if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
    if (!['ADMIN', 'TEACHER'].includes(req.user.role)) {
      throw new ApiError(403, 'Akses hanya untuk Administrator atau Guru BK');
    }
  }

  // GET /api/v1/admin/stats
  getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const result = await this.service.getDashboardStats();
      sendSuccess(res, 'Statistik dashboard berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/admin/users
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const result = await this.service.getUsers(req);
      sendSuccess(res, 'Daftar pengguna berhasil dimuat', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/admin/users/:id
  getUserDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const result = await this.service.getUserDetail(req.params.id);
      sendSuccess(res, 'Detail pengguna berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/admin/users/:id/status
  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const { status } = req.body;
      if (!Object.values(UserStatus).includes(status)) {
        throw new ApiError(400, `Status tidak valid. Gunakan: ${Object.values(UserStatus).join(', ')}`);
      }
      const result = await this.service.updateUserStatus(req.params.id, status as UserStatus);
      sendSuccess(res, 'Status pengguna berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/admin/users/:id
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      await this.service.deleteUser(req.params.id);
      sendSuccess(res, 'Pengguna berhasil dihapus', null);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/admin/sessions
  getAllSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const result = await this.service.getAllSessions(req);
      sendSuccess(res, 'Semua sesi konseling berhasil dimuat', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/admin/audit-logs
  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const result = await this.service.getAuditLogs(req);
      sendSuccess(res, 'Log audit berhasil dimuat', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/admin/risk-alerts
  getRiskAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const result = await this.service.getRiskAlerts(req);
      sendSuccess(res, 'Alert risiko berhasil dimuat', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/admin/assessment-summary
  getAssessmentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);
      const result = await this.service.getAssessmentSummary();
      sendSuccess(res, 'Ringkasan asesmen berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/admin/schools
  getSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireStaff(req);
      const result = await this.service.getSchools(req.user!.id);
      sendSuccess(res, 'Daftar sekolah berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/admin/schools
  createSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireAdmin(req);

      const parseResult = createSchoolSchema.safeParse({ body: req.body });
      if (!parseResult.success) {
        const messages = parseResult.error.errors.map((e) => e.message).join(', ');
        throw new ApiError(422, messages);
      }

      const result = await this.service.createSchool(parseResult.data.body, req.user!.id);
      sendCreated(res, 'Sekolah berhasil didaftarkan', result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/admin/users
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireStaff(req);

      // Validate request body
      const parseResult = createUserByAdminSchema.safeParse({ body: req.body });
      if (!parseResult.success) {
        const messages = parseResult.error.errors.map((e) => e.message).join(', ');
        throw new ApiError(422, messages);
      }

      const result = await this.service.createUserByAdmin(
        parseResult.data.body,
        req.user!.id
      );

      sendCreated(res, `Akun ${result.email} berhasil dibuat`, result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/admin/students/import
  importStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.requireStaff(req);

      const parseResult = importStudentsSchema.safeParse({ body: req.body });
      if (!parseResult.success) {
        const messages = parseResult.error.errors.map((e) => e.message).join(', ');
        throw new ApiError(422, messages);
      }

      const result = await this.service.importStudentsFromSpreadsheet(
        req.file,
        req.user!.id,
        parseResult.data.body.schoolId,
      );

      sendCreated(res, 'Import data siswa selesai diproses', result);
    } catch (error) {
      next(error);
    }
  };
}
