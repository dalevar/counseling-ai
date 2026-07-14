import request from 'supertest';
import app from '../app/index';
import { prisma } from '../utils/prisma';
import { RoleName } from '@prisma/client';

describe('AI Module API Integration Tests', () => {
  const studentEmail = 'student.ai@educouns.ai';
  const password = 'Password123';
  let studentToken = '';
  let conversationId = '';

  beforeAll(async () => {
    // Clean up previous test data
    await prisma.aIMessage.deleteMany({ where: { conversation: { user: { email: studentEmail } } } });
    await prisma.aIConversation.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.mentalHealthAssessment.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.student.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.user.deleteMany({ where: { email: studentEmail } });

    // Register, verify and login test student
    await request(app).post('/api/v1/auth/register').send({
      email: studentEmail,
      password,
      role: RoleName.STUDENT,
      firstName: 'Alvin',
      lastName: 'AITest',
    });
    const otp = await prisma.oTP.findFirst({ where: { email: studentEmail }, orderBy: { createdAt: 'desc' } });
    await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ email: studentEmail, code: otp?.code, purpose: 'VERIFICATION' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: studentEmail, password });
    studentToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.aIMessage.deleteMany({ where: { conversation: { user: { email: studentEmail } } } });
    await prisma.aIConversation.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.mentalHealthAssessment.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.student.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.user.deleteMany({ where: { email: studentEmail } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/ai/chat', () => {
    it('should start a new AI conversation and return a structured response', async () => {
      const response = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ message: 'Halo, aku sedang merasa stres dengan ujian minggu depan' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversationId');
      expect(response.body.data).toHaveProperty('response');
      expect(response.body.data.response).toHaveProperty('message');
      expect(response.body.data.response).toHaveProperty('emotion');
      expect(response.body.data.response).toHaveProperty('riskLevel');
      expect(response.body.data.response).toHaveProperty('copingStrategies');
      conversationId = response.body.data.conversationId;
    });

    it('should continue an existing conversation with context', async () => {
      const response = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          conversationId,
          message: 'Iya, aku takut gagal. Rasanya seperti tidak bisa bernapas.',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.conversationId).toBe(conversationId);
      expect(response.body.data.response.riskLevel).toBeDefined();
    });

    it('should reject chat request without message field', async () => {
      const response = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated chat requests', async () => {
      const response = await request(app)
        .post('/api/v1/ai/chat')
        .send({ message: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/ai/analyze-emotion', () => {
    it('should analyze emotion and return structured analysis', async () => {
      const response = await request(app)
        .post('/api/v1/ai/analyze-emotion')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ text: 'Aku merasa sangat bahagia hari ini karena mendapat nilai bagus!' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('emotion');
      expect(response.body.data).toHaveProperty('sentiment');
      expect(response.body.data).toHaveProperty('emotionScore');
    });
  });

  describe('POST /api/v1/ai/assess-risk', () => {
    it('should detect low/no risk for a normal message', async () => {
      const response = await request(app)
        .post('/api/v1/ai/assess-risk')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ text: 'Aku capek belajar tapi masih semangat mengerjakan tugas.' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('riskLevel');
      expect(['none', 'low']).toContain(response.body.data.riskLevel);
    });
  });

  describe('GET /api/v1/ai/conversations', () => {
    it('should return list of user conversations with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/ai/conversations')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toHaveProperty('total');
    });
  });

  describe('GET /api/v1/ai/conversations/:id', () => {
    it('should return conversation detail with all messages', async () => {
      const response = await request(app)
        .get(`/api/v1/ai/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(conversationId);
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBeGreaterThan(0);
    });

    it('should return 404 for a non-existent conversation', async () => {
      const response = await request(app)
        .get('/api/v1/ai/conversations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/ai/conversations/:id/summarize', () => {
    it('should summarize a conversation using AI', async () => {
      const response = await request(app)
        .post(`/api/v1/ai/conversations/${conversationId}/summarize`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('mainIssues');
      expect(response.body.data).toHaveProperty('emotionalState');
    });
  });

  describe('POST /api/v1/ai/assessment', () => {
    it('should complete a PHQ-9 assessment and return interpretation', async () => {
      const answers: Record<string, number> = {
        q1: 2, q2: 1, q3: 2, q4: 1, q5: 0,
        q6: 1, q7: 2, q8: 0, q9: 1,
      };

      const response = await request(app)
        .post('/api/v1/ai/assessment')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ type: 'PHQ9', answers });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data).toHaveProperty('interpretation');
      expect(response.body.data).toHaveProperty('severity');
      expect(response.body.data).toHaveProperty('copingStrategies');
      expect(response.body.data.score).toBe(10);
    });

    it('should fail assessment with insufficient questions answered', async () => {
      const response = await request(app)
        .post('/api/v1/ai/assessment')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ type: 'PHQ9', answers: { q1: 1, q2: 2 } });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/ai/assessment/history', () => {
    it('should return assessment history for the user', async () => {
      const response = await request(app)
        .get('/api/v1/ai/assessment/history')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/v1/ai/conversations/:id', () => {
    it('should soft-delete a conversation', async () => {
      const response = await request(app)
        .delete(`/api/v1/ai/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);

      // Confirm conversation no longer appears in list
      const listRes = await request(app)
        .get('/api/v1/ai/conversations')
        .set('Authorization', `Bearer ${studentToken}`);
      const found = listRes.body.data.find((c: { id: string }) => c.id === conversationId);
      expect(found).toBeUndefined();
    });
  });
});
