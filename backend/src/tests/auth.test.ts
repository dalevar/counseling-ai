import request from 'supertest';
import app from '../app/index';
import { prisma } from '../utils/prisma';
import { RoleName } from '@prisma/client';

describe('Authentication API Integration Tests', () => {
  const testEmail = 'student.test@educouns.ai';
  const testPassword = 'Password123';
  let verificationOtp = '';

  beforeAll(async () => {
    // 1. Clean up database records matching test data
    await prisma.oTP.deleteMany({ where: { email: testEmail } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.student.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });

    // 2. Ensure Role STUDENT exists
    await prisma.role.upsert({
      where: { name: RoleName.STUDENT },
      update: {},
      create: {
        name: RoleName.STUDENT,
        description: 'Student role',
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.oTP.deleteMany({ where: { email: testEmail } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.student.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new student user successfully and create OTP', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          role: RoleName.STUDENT,
          firstName: 'John',
          lastName: 'Doe',
          phone: '08123456789',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data.role).toBe(RoleName.STUDENT);

      // Check if user was inserted
      const dbUser = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.isEmailVerified).toBe(false);

      // Find the generated OTP in the database for the next test step
      const otp = await prisma.oTP.findFirst({
        where: { email: testEmail },
        orderBy: { createdAt: 'desc' },
      });
      expect(otp).toBeDefined();
      expect(otp?.code).toHaveLength(6);
      verificationOtp = otp?.code || '';
    });

    it('should fail registration if email already exists', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          role: RoleName.STUDENT,
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email sudah terdaftar');
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should fail with incorrect OTP code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testEmail,
          code: '000000',
          purpose: 'VERIFICATION',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Kode OTP salah');
    });

    it('should successfully verify email with correct OTP', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testEmail,
          code: verificationOtp,
          purpose: 'VERIFICATION',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const dbUser = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      expect(dbUser?.isEmailVerified).toBe(true);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login and return access and refresh tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testEmail);
    });
  });
});
