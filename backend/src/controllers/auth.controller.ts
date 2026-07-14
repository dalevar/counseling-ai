import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendCreated, sendSuccess } from '../helpers/response';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role, firstName, lastName, phone } = req.body;
      const result = await this.authService.register({
        email,
        passwordHash: password,
        role,
        firstName,
        lastName,
        phone,
      });
      sendCreated(res, 'Registrasi berhasil. Silakan cek email Anda untuk kode OTP verifikasi.', result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, code } = req.body;
      const result = await this.authService.verifyEmailOtp(email, code);
      sendSuccess(res, 'Verifikasi email berhasil. Akun Anda kini aktif.', result);
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, purpose = 'VERIFICATION' } = req.body;
      const result = await this.authService.resendOtp(email, purpose);
      sendSuccess(res, 'Kode OTP baru berhasil dikirim.', result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      sendSuccess(res, 'Login berhasil', result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refresh(refreshToken);
      sendSuccess(res, 'Token berhasil diperbarui', result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

      const result = await this.authService.logout(refreshToken, accessToken);
      sendSuccess(res, 'Logout berhasil', result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.authService.forgotPassword(email);
      sendSuccess(res, 'Instruksi reset password telah dikirim ke email jika terdaftar.', result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, token, password } = req.body;
      const result = await this.authService.resetPassword(email, token, password);
      sendSuccess(res, 'Reset password berhasil. Silakan login kembali dengan password baru Anda.', result);
    } catch (error) {
      next(error);
    }
  };
}
