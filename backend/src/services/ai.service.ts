import { AIRepository } from '../repositories/ai.repository';
import { llmService, LLMMessage } from '../ai/llm.service';
import {
  SYSTEM_PROMPT,
  EMOTION_ANALYSIS_PROMPT,
  SUMMARIZATION_PROMPT,
  RISK_ASSESSMENT_PROMPT,
  RECOMMENDATION_PROMPT,
} from '../ai/prompts';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { parseQueryParams, getPaginationMeta } from '../helpers/query.helper';
import type { Request } from 'express';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AIResponsePayload {
  message: string;
  emotion: string;
  sentiment: string;
  riskDetected: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  copingStrategies: string[];
  needsEscalation: boolean;
  escalationReason?: string | null;
}

interface EmotionAnalysis {
  emotion: string;
  sentiment: string;
  emotionScore: number;
  keywords: string[];
}

interface RiskAssessment {
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  riskIndicators: string[];
  requiresImmediate: boolean;
  recommendedAction: string;
}

interface RecommendationPayload {
  copingStrategies: {
    title: string;
    description: string;
    steps: string[];
    duration: string;
    type: string;
  }[];
  selfCareReminders: string[];
  resourceSuggestions: string[];
}

// PHQ-9 Scoring Lookup
const PHQ9_SCORING: Record<string, { label: string; color: string }> = {
  '0-4': { label: 'Tidak ada / minimal depresi', color: 'green' },
  '5-9': { label: 'Depresi ringan', color: 'yellow' },
  '10-14': { label: 'Depresi sedang', color: 'orange' },
  '15-19': { label: 'Depresi sedang-berat', color: 'red' },
  '20-27': { label: 'Depresi berat', color: 'dark-red' },
};

const GAD7_SCORING: Record<string, { label: string; color: string }> = {
  '0-4': { label: 'Tidak ada / minimal kecemasan', color: 'green' },
  '5-9': { label: 'Kecemasan ringan', color: 'yellow' },
  '10-14': { label: 'Kecemasan sedang', color: 'orange' },
  '15-21': { label: 'Kecemasan berat', color: 'red' },
};

export class AIService {
  private repository = new AIRepository();

  // ─── Chat ──────────────────────────────────────────────────────────────────

  async chat(userId: string, conversationId: string | null, userMessage: string) {
    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await this.repository.getConversationById(conversationId);
      if (!conversation || conversation.userId !== userId) {
        throw new ApiError(404, 'Percakapan tidak ditemukan');
      }
    } else {
      conversation = await this.repository.createConversation({
        userId,
        title: userMessage.slice(0, 60),
      });
    }

    // Retrieve last 10 messages for context
    const previousMessages = await this.repository.getConversationMessages(conversation.id, 10);
    const historyMessages: LLMMessage[] = previousMessages
      .reverse()
      .map((m) => ({
        role: m.sender === 'AI' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

    // Add the current user message to history
    historyMessages.push({ role: 'user', content: userMessage });

    // Save user message to DB
    await this.repository.createMessage({
      conversationId: conversation.id,
      sender: 'USER',
      content: userMessage,
    });

    // Call LLM
    const aiPayload = await llmService.chat<AIResponsePayload>(historyMessages, SYSTEM_PROMPT);

    // Safety override: if riskLevel is critical, always escalate
    if (aiPayload.riskLevel === 'critical') {
      aiPayload.needsEscalation = true;
      aiPayload.escalationReason =
        'Terdeteksi risiko keselamatan diri yang kritis. Siswa memerlukan bantuan profesional segera.';
    }

    // Save AI message
    const aiMessage = await this.repository.createMessage({
      conversationId: conversation.id,
      sender: 'AI',
      content: aiPayload.message,
      emotion: aiPayload.emotion,
      sentiment: aiPayload.sentiment,
      riskLevel: aiPayload.riskLevel,
      metadata: {
        copingStrategies: aiPayload.copingStrategies,
        needsEscalation: aiPayload.needsEscalation,
        escalationReason: aiPayload.escalationReason ?? null,
        riskDetected: aiPayload.riskDetected,
      },
    });

    // Update conversation timestamp
    await this.repository.updateConversation(conversation.id, {});

    logger.info(
      `[AIService] Chat | userId=${userId} | conversationId=${conversation.id} | riskLevel=${aiPayload.riskLevel} | needsEscalation=${aiPayload.needsEscalation}`
    );

    return {
      conversationId: conversation.id,
      message: aiMessage,
      response: {
        message: aiPayload.message,
        emotion: aiPayload.emotion,
        sentiment: aiPayload.sentiment,
        riskDetected: aiPayload.riskDetected,
        riskLevel: aiPayload.riskLevel,
        copingStrategies: aiPayload.copingStrategies,
        needsEscalation: aiPayload.needsEscalation,
        escalationReason: aiPayload.escalationReason ?? null,
      },
    };
  }

  // ─── Emotion Analysis ──────────────────────────────────────────────────────

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    const prompt = EMOTION_ANALYSIS_PROMPT.replace('{text}', text);
    return llmService.complete<EmotionAnalysis>(prompt);
  }

  // ─── Risk Assessment ───────────────────────────────────────────────────────

  async assessRisk(text: string): Promise<RiskAssessment> {
    const prompt = RISK_ASSESSMENT_PROMPT.replace('{text}', text);
    return llmService.complete<RiskAssessment>(prompt);
  }

  // ─── Recommendations ───────────────────────────────────────────────────────

  async getRecommendations(
    condition: string,
    emotion: string,
    issues: string[]
  ): Promise<RecommendationPayload> {
    const prompt = RECOMMENDATION_PROMPT.replace('{condition}', condition)
      .replace('{emotion}', emotion)
      .replace('{issues}', issues.join(', '));
    return llmService.complete<RecommendationPayload>(prompt);
  }

  // ─── Conversation Summarization ───────────────────────────────────────────

  async summarizeConversation(conversationId: string, userId: string) {
    const conversation = await this.repository.getConversationById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new ApiError(404, 'Percakapan tidak ditemukan');
    }

    const conversationText = conversation.messages
      .map((m) => `${m.sender === 'USER' ? 'Siswa' : 'AI'}: ${m.content}`)
      .join('\n');

    const prompt = SUMMARIZATION_PROMPT.replace('{conversation}', conversationText);
    const summary = await llmService.complete<{
      summary: string;
      mainIssues: string[];
      emotionalState: string;
      progressNotes: string;
    }>(prompt);

    await this.repository.updateConversation(conversationId, { summary: summary.summary });

    return summary;
  }

  // ─── Get Conversations ─────────────────────────────────────────────────────

  async getConversations(userId: string, req: Request) {
    const { page, limit } = parseQueryParams(req.query);
    const { conversations, total } = await this.repository.getUserConversations(userId, page, limit);
    return {
      data: conversations,
      meta: getPaginationMeta(total, page, limit),
    };
  }

  // ─── Get Conversation Detail ───────────────────────────────────────────────

  async getConversationDetail(conversationId: string, userId: string) {
    const conversation = await this.repository.getConversationById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new ApiError(404, 'Percakapan tidak ditemukan');
    }
    return conversation;
  }

  // ─── Delete Conversation ───────────────────────────────────────────────────

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.repository.getConversationById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new ApiError(404, 'Percakapan tidak ditemukan');
    }
    await this.repository.deleteConversation(conversationId);
  }

  // ─── PHQ-9 Mental Health Assessment ───────────────────────────────────────

  async submitAssessment(
    userId: string,
    type: 'PHQ9' | 'GAD7',
    answers: Record<string, number>
  ) {
    const score = Object.values(answers).reduce((sum, v) => sum + (Number(v) || 0), 0);

    const scoringTable = type === 'PHQ9' ? PHQ9_SCORING : GAD7_SCORING;
    let interpretation = 'Tidak diketahui';
    for (const [range, info] of Object.entries(scoringTable)) {
      const [min, max] = range.split('-').map(Number);
      if (score >= min && score <= max) {
        interpretation = info.label;
        break;
      }
    }

    // Get AI recommendations based on assessment
    const condition = `Hasil asesmen ${type} dengan skor ${score}: ${interpretation}`;
    const recommendations = await this.getRecommendations(
      condition,
      score > 14 ? 'sadness' : score > 9 ? 'fear' : 'neutral',
      [interpretation]
    );

    const assessment = await this.repository.createAssessment({
      userId,
      type,
      answers,
      score,
      interpretation,
      recommendations: recommendations.copingStrategies.map((c) => c.title),
    });

    const needsEscalation = score >= 15;

    return {
      assessment,
      score,
      interpretation,
      severity: needsEscalation ? 'high' : score >= 10 ? 'medium' : 'low',
      needsEscalation,
      copingStrategies: recommendations.copingStrategies,
      selfCareReminders: recommendations.selfCareReminders,
    };
  }

  async getAssessmentHistory(userId: string) {
    return this.repository.getUserAssessments(userId);
  }
}
