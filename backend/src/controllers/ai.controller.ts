import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { ApiError } from '../utils/ApiError';
import { sendSuccess, sendCreated } from '../helpers/response';

export class AIController {
  private service = new AIService();

  // POST /api/v1/ai/chat
  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const { conversationId = null, message } = req.body;
      const result = await this.service.chat(req.user.id, conversationId, message);
      sendCreated(res, 'Pesan berhasil diproses', result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/ai/analyze-emotion
  analyzeEmotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const { text } = req.body;
      const result = await this.service.analyzeEmotion(text);
      sendSuccess(res, 'Analisis emosi berhasil', result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/ai/assess-risk
  assessRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const { text } = req.body;
      const result = await this.service.assessRisk(text);
      sendSuccess(res, 'Asesmen risiko berhasil', result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/ai/recommendations
  getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const { condition, emotion, issues } = req.body;
      const result = await this.service.getRecommendations(condition, emotion, issues);
      sendSuccess(res, 'Rekomendasi berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/ai/conversations
  getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.getConversations(req.user.id, req);
      sendSuccess(res, 'Daftar percakapan berhasil dimuat', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/ai/conversations/:id
  getConversationDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.getConversationDetail(req.params.id, req.user.id);
      sendSuccess(res, 'Detail percakapan berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/ai/conversations/:id/summarize
  summarize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.summarizeConversation(req.params.id, req.user.id);
      sendSuccess(res, 'Ringkasan percakapan berhasil dibuat', result);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/ai/conversations/:id
  deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      await this.service.deleteConversation(req.params.id, req.user.id);
      sendSuccess(res, 'Percakapan berhasil dihapus', null);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/ai/assessment
  submitAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const { type, answers } = req.body;
      const result = await this.service.submitAssessment(req.user.id, type, answers);
      sendCreated(res, 'Asesmen kesehatan mental berhasil diselesaikan', result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/ai/assessment/history
  getAssessmentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new ApiError(401, 'Silakan login terlebih dahulu');
      const result = await this.service.getAssessmentHistory(req.user.id);
      sendSuccess(res, 'Riwayat asesmen berhasil dimuat', result);
    } catch (error) {
      next(error);
    }
  };
}
