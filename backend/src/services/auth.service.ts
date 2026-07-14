import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { EmailService } from '../email/email.service';
import { redisClient } from '../utils/redis';
import { OtpPurpose, RoleName } from '@prisma/client';

export class AuthService {
  private userRepository = new UserRepository();
  private tokenRepository = new TokenRepository();
  private emailService = new EmailService();

  // Helper: Generate 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Helper: Sign Access Token
  private generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ sub: userId, role }, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiration as any,
    });
  }

  // Helper: Sign Refresh Token
  private generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiration as any,
    });
  }

  async register(data: {
    email: string;
    passwordHash: string;
    role: RoleName;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(409, 'Email sudah terdaftar');
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(data.passwordHash, 10);

    // 3. Create User and Role Profile in Tx
    const user = await this.userRepository.createUserWithProfile({
      email: data.email,
      passwordHash: hashedPassword,
      roleName: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });

    // 4. Generate & Send OTP
    const otpCode = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.tokenRepository.createOTP(data.email, otpCode, OtpPurpose.VERIFICATION, otpExpiry);

    // Send email asynchronously
    this.emailService.sendVerificationOtp(data.email, otpCode).catch((err) => {
      // Don't fail the registration if email fails
      console.error('Failed to send verification email', err);
    });

    return {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      status: user.status,
    };
  }

  async verifyEmailOtp(email: string, code: string) {
    const otp = await this.tokenRepository.findLatestOTP(email, OtpPurpose.VERIFICATION);
    if (!otp) {
      throw new ApiError(400, 'OTP tidak ditemukan');
    }

    if (otp.code !== code) {
      throw new ApiError(400, 'Kode OTP salah');
    }

    if (otp.expiresAt < new Date()) {
      throw new ApiError(400, 'Kode OTP telah kedaluwarsa');
    }

    // Activate User
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    await this.userRepository.updateUserVerification(user.id, true);
    await this.tokenRepository.deleteOTP(otp.id);

    return { message: 'Email berhasil diverifikasi' };
  }

  async resendOtp(email: string, purpose: 'VERIFICATION' | 'PASSWORD_RESET' = 'VERIFICATION') {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    if (purpose === 'VERIFICATION' && user.isEmailVerified) {
      throw new ApiError(400, 'Email sudah terverifikasi');
    }

    const otpCode = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.tokenRepository.createOTP(email, otpCode, OtpPurpose[purpose], otpExpiry);

    if (purpose === 'PASSWORD_RESET') {
      this.emailService.sendPasswordResetOtp(email, otpCode).catch((err) => {
        console.error('Failed to send reset OTP email', err);
      });
    } else {
      this.emailService.sendVerificationOtp(email, otpCode).catch((err) => {
        console.error('Failed to send verification email', err);
      });
    }

    return {
      email,
      purpose,
      expiresAt: otpExpiry,
    };
  }

  async login(email: string, password: string) {
    // 1. Find User
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Email atau password salah');
    }

    // 2. Check password
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new ApiError(401, 'Email atau password salah');
    }

    // 3. Check verification
    if (!user.isEmailVerified) {
      throw new ApiError(403, 'Email belum diverifikasi. Silakan cek email Anda untuk kode OTP.');
    }

    // 4. Generate Tokens
    const accessToken = this.generateAccessToken(user.id, user.role.name);
    const refreshToken = this.generateRefreshToken(user.id);

    // 5. Store Refresh Token in DB
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.tokenRepository.createRefreshToken(user.id, refreshToken, refreshExpiry);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    // 1. Verify Refresh Token
    try {
      jwt.verify(token, config.jwt.refreshSecret);
    } catch (err) {
      throw new ApiError(401, 'Refresh token tidak valid atau kedaluwarsa');
    }

    // 2. Find in DB to check revocation and reuse
    const dbToken = await this.tokenRepository.findRefreshToken(token);
    if (!dbToken) {
      throw new ApiError(401, 'Refresh token tidak terdaftar');
    }

    if (dbToken.revokedAt) {
      // REUSE DETECTION: Someone is trying to reuse a revoked token. Revoke all tokens for this user!
      await this.tokenRepository.revokeAllUserRefreshTokens(dbToken.userId);
      throw new ApiError(401, 'Deteksi penggunaan ulang token! Semua sesi dicabut.');
    }

    if (dbToken.expiresAt < new Date()) {
      throw new ApiError(401, 'Refresh token telah kedaluwarsa');
    }

    // 3. Rotation: Generate new ones
    const user = await this.userRepository.findById(dbToken.userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const newAccessToken = this.generateAccessToken(user.id, user.role.name);
    const newRefreshToken = this.generateRefreshToken(user.id);

    // 4. Revoke old and save new
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.tokenRepository.revokeRefreshToken(token, newRefreshToken);
    await this.tokenRepository.createRefreshToken(user.id, newRefreshToken, refreshExpiry);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string, accessToken?: string) {
    // Revoke Refresh Token
    const dbToken = await this.tokenRepository.findRefreshToken(token);
    if (dbToken) {
      await this.tokenRepository.revokeRefreshToken(token);
    }

    // Blacklist Access Token in Redis if provided
    if (accessToken) {
      try {
        const decoded: any = jwt.decode(accessToken);
        if (decoded && decoded.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await redisClient.set(`blacklist:${accessToken}`, 'true', { EX: ttl });
          }
        }
      } catch (err) {
        console.error('Failed to blacklist access token', err);
      }
    }

    return { message: 'Sesi logout berhasil' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // To prevent user enumeration, we return success even if email not found
      return { message: 'Jika email terdaftar, instruksi reset password telah dikirim' };
    }

    // Generate Token
    const resetToken = jwt.sign({ sub: user.id }, config.jwt.secret, { expiresIn: '1h' });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.tokenRepository.createPasswordResetToken(user.id, resetToken, expiresAt);

    // Send email asynchronously
    this.emailService.sendPasswordResetToken(email, resetToken).catch((err) => {
      console.error('Failed to send reset password email', err);
    });

    return { message: 'Jika email terdaftar, instruksi reset password telah dikirim' };
  }

  async resetPassword(email: string, token: string, passwordHash: string) {
    // 1. Verify Reset Token in DB
    const resetToken = await this.tokenRepository.findPasswordResetToken(token);
    if (!resetToken) {
      throw new ApiError(400, 'Token reset password tidak valid');
    }

    if (resetToken.usedAt) {
      throw new ApiError(400, 'Token reset password sudah pernah digunakan');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new ApiError(400, 'Token reset password telah kedaluwarsa');
    }

    // 2. Find User
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.id !== resetToken.userId) {
      throw new ApiError(400, 'Token reset tidak sesuai dengan email');
    }

    // 3. Hash New Password
    const hashedPassword = await bcrypt.hash(passwordHash, 10);

    // 4. Update password and revoke reset token
    await this.userRepository.updatePassword(user.id, hashedPassword);
    await this.tokenRepository.markPasswordResetTokenAsUsed(token);

    // 5. Revoke all active sessions for security
    await this.tokenRepository.revokeAllUserRefreshTokens(user.id);

    return { message: 'Password berhasil diubah. Silakan login kembali.' };
  }
}
