import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../helpers/response';
import { ApiError } from '../utils/ApiError';

export class UserController {
  private userService = new UserService();

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.userService.getProfile(req.user.id);
      sendSuccess(res, 'Profil berhasil diambil', result);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const result = await this.userService.updateProfile(req.user.id, req.body);
      sendSuccess(res, 'Profil berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      if (!req.file) {
        throw new ApiError(400, 'Silakan pilih file gambar untuk diunggah');
      }
      const result = await this.userService.uploadAvatar(req.user.id, req.file);
      sendSuccess(res, 'Foto profil berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Silakan login terlebih dahulu');
      }
      const { oldPassword, newPassword } = req.body;
      const result = await this.userService.changePassword(req.user.id, oldPassword, newPassword);
      sendSuccess(res, 'Kata sandi berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  adminListUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.adminListUsers(req.query);
      sendSuccess(res, 'Daftar user berhasil diambil', result.users, result.meta);
    } catch (error) {
      next(error);
    }
  };

  adminGetUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.getProfile(id);
      sendSuccess(res, 'Detail user berhasil diambil', result);
    } catch (error) {
      next(error);
    }
  };

  adminUpdateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.adminUpdateUser(id, req.body);
      sendSuccess(res, 'Status/Role user berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  adminDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const mode = req.query.mode === 'hard' ? 'hard' : 'soft';
      const result = await this.userService.adminDeleteUser(id, mode);
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  };
}
