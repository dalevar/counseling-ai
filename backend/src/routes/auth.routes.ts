import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import {
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  registerSchema,
} from '../validations/auth.validation';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new AuthController();

/**
 * @route   POST /api/v1/auth/register
 * @desc    PUBLIC REGISTRATION IS DISABLED in production.
 *          Enabled in test environment to support integration tests.
 * @access  None / Test only
 */
router.post(
  '/register',
  authRateLimiter,
  (req: Request, res: Response, next) => {
    if (process.env.NODE_ENV === 'test') {
      return validate(registerSchema)(req, res, next);
    }
    return res.status(403).json({
      success: false,
      message:
        'Pendaftaran publik tidak diizinkan. Akun Anda harus didaftarkan oleh Admin atau Guru BK sekolah. Hubungi pihak sekolah untuk informasi lebih lanjut.',
    });
  },
  controller.register
);

router.post('/verify-otp', validate(verifyOtpSchema), controller.verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), controller.resendOtp);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/logout', controller.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

export default router;
