import request from 'supertest';
import app from '../app/index';
import { prisma } from '../utils/prisma';
import { RoleName } from '@prisma/client';

describe('User Management API Integration Tests', () => {
  const testEmail = 'student.user@educouns.ai';
  const testPassword = 'Password123';
  let accessToken = '';

  beforeAll(async () => {
    // 1. Clean up database records matching test data
    await prisma.settings.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.oTP.deleteMany({ where: { email: testEmail } });
    await prisma.student.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });

    // 2. Register, Verify, and Login to obtain access token
    // A. Register
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        role: RoleName.STUDENT,
        firstName: 'Initial',
        lastName: 'Name',
        phone: '08111111111',
      });

    // B. Find OTP
    const otp = await prisma.oTP.findFirst({
      where: { email: testEmail },
      orderBy: { createdAt: 'desc' },
    });

    // C. Verify OTP
    await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        email: testEmail,
        code: otp?.code || '',
        purpose: 'VERIFICATION',
      });

    // D. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    accessToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.settings.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.oTP.deleteMany({ where: { email: testEmail } });
    await prisma.student.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/users/me', () => {
    it('should retrieve logged in user profile details', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data.role).toBe(RoleName.STUDENT);
      expect(response.body.data.profile.firstName).toBe('Initial');
    });

    it('should fail profile access if unauthorized', async () => {
      const response = await request(app).get('/api/v1/users/me');
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me/student', () => {
    it('should update student profile fields successfully', async () => {
      const response = await request(app)
        .put('/api/v1/users/me/student')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'StudentName',
          phone: '08222222222',
          gender: 'MALE',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.firstName).toBe('Updated');
      expect(response.body.data.profile.phone).toBe('08222222222');
      expect(response.body.data.profile.gender).toBe('MALE');
    });

    it('should reject updates with invalid format', async () => {
      const response = await request(app)
        .put('/api/v1/users/me/student')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          gender: 'OTHER', // Invalid enum value
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation Error');
    });
  });

  describe('POST /api/v1/users/me/avatar', () => {
    it('should upload avatar and store relative path in settings', async () => {
      const buffer = Buffer.from('fake image content');
      
      const response = await request(app)
        .post('/api/v1/users/me/avatar')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('avatar', buffer, 'test-avatar.png');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.avatarUrl).toContain('/uploads/avatars/');

      // Check if avatar is set in DB settings
      const setting = await prisma.settings.findFirst({
        where: {
          user: { email: testEmail },
          key: 'avatar_url',
        },
      });
      expect(setting).toBeDefined();
      expect(setting?.value).toContain('/uploads/avatars/');
    });
  });
});
