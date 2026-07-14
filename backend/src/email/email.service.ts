import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId} to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);
      // In development we don't want to crash or fail the flow if SMTP is not set up
      if (config.env === 'development') {
        logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
        return true;
      }
      return false;
    }
  }

  async sendVerificationOtp(email: string, code: string): Promise<boolean> {
    const subject = 'Verifikasi Akun EduCouns AI';
    const text = `Kode verifikasi OTP Anda adalah: ${code}. Kode ini akan kedaluwarsa dalam 10 menit.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">EduCouns AI</h2>
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di EduCouns AI. Gunakan kode OTP di bawah ini untuk memverifikasi akun Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1E1B4B; background-color: #EEF2F6; padding: 10px 20px; border-radius: 6px; border: 1px dashed #4F46E5;">
            ${code}
          </span>
        </div>
        <p>Kode OTP ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6B7280; text-align: center;">EduCouns AI © 2026 - Semua Hak Dilindungi.</p>
      </div>
    `;
    return this.sendEmail(email, subject, text, html);
  }

  async sendPasswordResetToken(email: string, token: string): Promise<boolean> {
    const resetUrl = `${config.cors.origin}/reset-password?token=${token}&email=${email}`;
    const subject = 'Reset Password Akun EduCouns AI';
    const text = `Anda meminta untuk mereset password. Silakan buka tautan berikut untuk membuat password baru Anda: ${resetUrl}. Tautan berlaku selama 1 jam.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">EduCouns AI</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mereset password akun EduCouns AI Anda. Klik tombol di bawah untuk membuat password baru:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Atau copy dan paste tautan berikut di browser Anda:</p>
        <p style="word-break: break-all; font-size: 14px; color: #4F46E5;">${resetUrl}</p>
        <p>Tautan ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6B7280; text-align: center;">EduCouns AI © 2026 - Semua Hak Dilindungi.</p>
      </div>
    `;
    return this.sendEmail(email, subject, text, html);
  }

  async sendPasswordResetOtp(email: string, code: string): Promise<boolean> {
    const subject = 'Kode OTP Reset Password EduCouns AI';
    const text = `Kode OTP reset password Anda adalah: ${code}. Kode ini akan kedaluwarsa dalam 10 menit.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">EduCouns AI</h2>
        <p>Halo,</p>
        <p>Gunakan kode OTP berikut untuk melanjutkan proses reset password akun Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1E1B4B; background-color: #EEF2F6; padding: 10px 20px; border-radius: 6px; border: 1px dashed #4F46E5;">
            ${code}
          </span>
        </div>
        <p>Kode OTP ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
      </div>
    `;
    return this.sendEmail(email, subject, text, html);
  }
}
