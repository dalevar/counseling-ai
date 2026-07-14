import request from 'supertest';
import app from '../app/index';
import { prisma } from '../utils/prisma';
import { RoleName, SessionStatus, SessionType } from '@prisma/client';

describe('Counseling System API Integration Tests', () => {
  const studentEmail = 'student.couns@educouns.ai';
  const counselorEmail = 'counselor.couns@educouns.ai';
  const password = 'Password123';

  let studentToken = '';
  let counselorToken = '';
  let counselorId = '';
  let sessionId = '';

  beforeAll(async () => {
    // 1. Clean up old records
    await prisma.notification.deleteMany({ where: { user: { email: { in: [studentEmail, counselorEmail] } } } });
    await prisma.sessionCounseling.deleteMany({ where: { student: { user: { email: studentEmail } } } });
    await prisma.student.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.counselor.deleteMany({ where: { user: { email: counselorEmail } } });
    await prisma.user.deleteMany({ where: { email: { in: [studentEmail, counselorEmail] } } });

    // Ensure role COUNSELOR exists
    await prisma.role.upsert({
      where: { name: RoleName.COUNSELOR },
      update: {},
      create: { name: RoleName.COUNSELOR, description: 'Counselor role' },
    });

    // 2. Register, verify, and login STUDENT
    await request(app).post('/api/v1/auth/register').send({
      email: studentEmail,
      password,
      role: RoleName.STUDENT,
      firstName: 'Alvin',
      lastName: 'Student',
    });
    const sOtp = await prisma.oTP.findFirst({ where: { email: studentEmail }, orderBy: { createdAt: 'desc' } });
    await request(app).post('/api/v1/auth/verify-otp').send({ email: studentEmail, code: sOtp?.code, purpose: 'VERIFICATION' });
    const sLogin = await request(app).post('/api/v1/auth/login').send({ email: studentEmail, password });
    studentToken = sLogin.body.data.accessToken;

    // 3. Register, verify, and login COUNSELOR
    await request(app).post('/api/v1/auth/register').send({
      email: counselorEmail,
      password,
      role: RoleName.COUNSELOR,
      firstName: 'Dr. Jane',
      lastName: 'Psy',
    });
    const cOtp = await prisma.oTP.findFirst({ where: { email: counselorEmail }, orderBy: { createdAt: 'desc' } });
    await request(app).post('/api/v1/auth/verify-otp').send({ email: counselorEmail, code: cOtp?.code, purpose: 'VERIFICATION' });
    const cLogin = await request(app).post('/api/v1/auth/login').send({ email: counselorEmail, password });
    counselorToken = cLogin.body.data.accessToken;
    counselorId = cLogin.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.notification.deleteMany({ where: { user: { email: { in: [studentEmail, counselorEmail] } } } });
    await prisma.sessionCounseling.deleteMany({ where: { student: { user: { email: studentEmail } } } });
    await prisma.student.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.counselor.deleteMany({ where: { user: { email: counselorEmail } } });
    await prisma.user.deleteMany({ where: { email: { in: [studentEmail, counselorEmail] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/counseling (Booking)', () => {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 2); // 2 days in the future

    it('should successfully book a counseling session', async () => {
      const response = await request(app)
        .post('/api/v1/counseling')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          counselorId,
          date: bookingDate.toISOString(),
          timeSlot: '10:00 - 11:00',
          type: SessionType.ONLINE,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(SessionStatus.PENDING);
      expect(response.body.data.meetingLink).toContain('meet.jit.si');
      sessionId = response.body.data.id;
    });

    it('should fail booking if timeslot overlaps (clash validation)', async () => {
      const response = await request(app)
        .post('/api/v1/counseling')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          counselorId,
          date: bookingDate.toISOString(),
          timeSlot: '10:00 - 11:00',
          type: SessionType.ONLINE,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Jadwal konseling bentrok');
    });
  });

  describe('PUT /api/v1/counseling/:id/status (Lifecycle updates)', () => {
    it('should allow counselor to approve session', async () => {
      const response = await request(app)
        .put(`/api/v1/counseling/${sessionId}/status`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({ status: SessionStatus.APPROVED });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(SessionStatus.APPROVED);
    });

    it('should allow counselor to start session (ONGOING)', async () => {
      const response = await request(app)
        .put(`/api/v1/counseling/${sessionId}/status`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({ status: SessionStatus.ONGOING });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe(SessionStatus.ONGOING);
    });
  });

  describe('PUT /api/v1/counseling/:id/notes (Counselor notes)', () => {
    it('should allow counselor to write session notes', async () => {
      const response = await request(app)
        .put(`/api/v1/counseling/${sessionId}/notes`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({ notes: 'Student is showing signs of moderate stress due to academic exams.' });

      expect(response.status).toBe(200);
      expect(response.body.data.notes).toContain('moderate stress');
    });
  });

  describe('PUT /api/v1/counseling/:id/feedback (Feedback & average rating)', () => {
    it('should complete session first before giving feedback', async () => {
      // 1. Complete session
      await request(app)
        .put(`/api/v1/counseling/${sessionId}/status`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({ status: SessionStatus.COMPLETED });

      // 2. Submit rating feedback
      const response = await request(app)
        .put(`/api/v1/counseling/${sessionId}/feedback`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 5,
          feedback: 'Sangat terbantu dengan sesi konsultasi ini. Konselor sangat ramah.',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.rating).toBe(5);

      // Verify counselor average rating updated
      const counselor = await prisma.counselor.findUnique({ where: { id: counselorId } });
      expect(counselor?.rating).toBe(5.0);
    });
  });
});
