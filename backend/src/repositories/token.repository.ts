import { prisma } from '../utils/prisma';
import { RefreshToken, OTP, PasswordReset, OtpPurpose } from '@prisma/client';

export class TokenRepository {
  // Refresh Token Methods
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeRefreshToken(token: string, replacedByToken?: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { token },
      data: {
        revokedAt: new Date(),
        replacedBy: replacedByToken,
      },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  // OTP Methods
  async createOTP(email: string, code: string, purpose: OtpPurpose, expiresAt: Date): Promise<OTP> {
    return prisma.oTP.create({
      data: {
        email,
        code,
        purpose,
        expiresAt,
      },
    });
  }

  async findLatestOTP(email: string, purpose: OtpPurpose): Promise<OTP | null> {
    return prisma.oTP.findFirst({
      where: {
        email,
        purpose,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteOTP(id: string): Promise<OTP> {
    return prisma.oTP.delete({
      where: { id },
    });
  }

  // Password Reset Methods
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordReset> {
    return prisma.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(token: string): Promise<PasswordReset | null> {
    return prisma.passwordReset.findUnique({
      where: { token },
    });
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<PasswordReset> {
    return prisma.passwordReset.update({
      where: { token },
      data: {
        usedAt: new Date(),
      },
    });
  }
}
