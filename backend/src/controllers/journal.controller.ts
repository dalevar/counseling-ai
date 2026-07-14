import { Request, Response, NextFunction } from 'express';
import { JournalService } from '../services/journal.service';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated } from '../helpers/response';

export class JournalController {
  private service = new JournalService();

  // POST /api/v1/journals
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const { title, content, isPrivate } = req.body;
      const result = await this.service.createJournal(req.user.id, title, content, isPrivate);
      sendCreated(res, 'Jurnal berhasil dibuat', result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/journals
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.getJournals(req.user.id, req);
      sendSuccess(res, 'Daftar jurnal berhasil dimuat', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/journals/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.getJournalById(req.params.id, req.user.id);
      sendSuccess(res, 'Jurnal berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/v1/journals/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.updateJournal(req.params.id, req.user.id, req.body);
      sendSuccess(res, 'Jurnal berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/journals/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      await this.service.deleteJournal(req.params.id, req.user.id);
      sendSuccess(res, 'Jurnal berhasil dihapus', null);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/journals/mood
  logMood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const { moodScore, notes } = req.body;
      const result = await this.service.logMood(req.user.id, moodScore, notes);
      sendCreated(res, 'Mood berhasil dicatat', result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/journals/mood/history
  getMoodHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const days = parseInt(req.query.days as string) || 30;
      const result = await this.service.getMoodHistory(req.user.id, days);
      sendSuccess(res, 'Riwayat mood berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/journals/mood/stats
  getMoodStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const days = parseInt(req.query.days as string) || 30;
      const result = await this.service.getMoodStats(req.user.id, days);
      sendSuccess(res, 'Statistik mood berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };
}
