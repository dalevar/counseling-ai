import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export interface CreateAIConversationData {
  userId: string;
  title?: string;
}

export interface CreateMessageData {
  conversationId: string;
  sender: 'USER' | 'AI';
  content: string;
  emotion?: string;
  sentiment?: string;
  riskLevel?: string;
  metadata?: Record<string, unknown>;
}

export class AIRepository {
  // ─── Conversations ─────────────────────────────────────────────────────────

  async createConversation(data: CreateAIConversationData) {
    return prisma.aIConversation.create({
      data: {
        userId: data.userId,
        title: data.title ?? 'Percakapan Baru',
      },
    });
  }

  async getConversationById(id: string) {
    return prisma.aIConversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async getUserConversations(userId: string, page: number, limit: number) {
    const [conversations, total] = await Promise.all([
      prisma.aIConversation.findMany({
        where: { userId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.aIConversation.count({ where: { userId, isActive: true } }),
    ]);
    return { conversations, total };
  }

  async updateConversation(id: string, data: { title?: string; summary?: string; isActive?: boolean }) {
    return prisma.aIConversation.update({ where: { id }, data });
  }

  async deleteConversation(id: string) {
    return prisma.aIConversation.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── Messages ───────────────────────────────────────────────────────────────

  async createMessage(data: CreateMessageData) {
    return prisma.aIMessage.create({
      data: {
        conversationId: data.conversationId,
        sender: data.sender,
        content: data.content,
        emotion: data.emotion,
        sentiment: data.sentiment,
        riskLevel: data.riskLevel,
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async getConversationMessages(conversationId: string, limit = 20) {
    return prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ─── Mental Health Assessments ──────────────────────────────────────────────

  async createAssessment(data: {
    userId: string;
    type: string;
    answers: Record<string, unknown>;
    score: number;
    interpretation: string;
    recommendations: string[];
  }) {
    return prisma.mentalHealthAssessment.create({
      data: {
        userId: data.userId,
        type: data.type,
        answers: data.answers as Prisma.InputJsonValue,
        score: data.score,
        interpretation: data.interpretation,
        recommendations: data.recommendations,
      },
    });
  }

  async getUserAssessments(userId: string) {
    return prisma.mentalHealthAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
