import { config } from '../config';
import { logger } from '../utils/logger';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

interface LLMProvider {
  chat(messages: LLMMessage[], systemPrompt?: string): Promise<LLMResponse>;
  complete(prompt: string): Promise<LLMResponse>;
}

// ─── Gemini Provider ────────────────────────────────────────────────────────

class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string, model = 'gemini-2.0-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages: LLMMessage[], systemPrompt?: string): Promise<LLMResponse> {
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents };
    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    body.generationConfig = {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 2048,
    };

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return {
      text,
      model: this.model,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount,
        outputTokens: data.usageMetadata?.candidatesTokenCount,
      },
    };
  }

  async complete(prompt: string): Promise<LLMResponse> {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

// ─── GitHub Models Provider ──────────────────────────────────────────────────

class GitHubModelsProvider implements LLMProvider {
  private token: string;
  private model: string;
  private baseUrl = 'https://models.inference.ai.azure.com';

  constructor(token: string, model = 'gpt-4o-mini') {
    this.token = token;
    this.model = model;
  }

  async chat(messages: LLMMessage[], systemPrompt?: string): Promise<LLMResponse> {
    const formattedMessages: any[] = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }

    messages.forEach((m) => {
      formattedMessages.push({
        role: m.role === 'assistant' || (m.role as string) === 'model' ? 'assistant' : m.role,
        content: m.content,
      });
    });

    const body = {
      messages: formattedMessages,
      model: this.model,
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    };

    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GitHub Models API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const text = data.choices?.[0]?.message?.content ?? '';

    return {
      text,
      model: this.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
      },
    };
  }

  async complete(prompt: string): Promise<LLMResponse> {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

class MockLLMProvider implements LLMProvider {
  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    logger.warn('[LLMService] Using Mock LLM provider — set GEMINI_API_KEY in .env');

    const lastMessage = messages[messages.length - 1]?.content || '';
    let mockPayload: any;

    if (
      lastMessage.includes('emotionScore') ||
      lastMessage.includes('Analisis emosi')
    ) {
      mockPayload = {
        emotion: 'joy',
        sentiment: 'positif',
        emotionScore: 0.9,
        keywords: ['bahagia', 'bagus', 'senang'],
      };
    } else if (
      lastMessage.includes('asesor risiko') ||
      lastMessage.includes('risiko kesehatan mental')
    ) {
      mockPayload = {
        riskLevel: 'none',
        riskIndicators: [],
        requiresImmediate: false,
        recommendedAction: 'Lanjutkan konseling suportif.',
      };
    } else if (
      lastMessage.includes('coping strategy yang praktis') ||
      lastMessage.includes('coping strategy') ||
      lastMessage.includes('Rekomendasi coping strategy')
    ) {
      mockPayload = {
        copingStrategies: [
          {
            title: 'Latihan Pernapasan 4-7-8',
            description: 'Metode pernapasan dalam untuk merilekskan sistem saraf.',
            steps: [
              'Tarik napas melalui hidung selama 4 detik',
              'Tahan napas selama 7 detik',
              'Hembuskan napas melalui mulut secara perlahan selama 8 detik',
            ],
            duration: '5 menit',
            type: 'breathing',
          },
        ],
        selfCareReminders: ['Minum air yang cukup', 'Istirahat sejenak dari layar'],
        resourceSuggestions: ['Gunakan fitur meditasi mandiri di aplikasi'],
      };
    } else if (
      lastMessage.includes('ringkasan singkat dari percakapan') ||
      lastMessage.includes('ringkasan') ||
      lastMessage.includes('Buat ringkasan singkat')
    ) {
      mockPayload = {
        summary: 'Siswa merasa cemas menghadapi ujian tetapi telah mendapatkan beberapa saran coping strategy.',
        mainIssues: ['Kecemasan akademis'],
        emotionalState: 'Cemas',
        progressNotes: 'Menunjukkan kemajuan setelah latihan pernapasan.',
      };
    } else {
      mockPayload = {
        message:
          'Halo! Aku EduCouns AI, siap mendengarkan dan membantumu. Ceritakan apa yang sedang kamu rasakan.',
        emotion: 'neutral',
        sentiment: 'netral',
        riskDetected: false,
        riskLevel: 'none',
        copingStrategies: ['Tarik napas dalam selama 4 hitungan, tahan 4, lepas 4.'],
        needsEscalation: false,
        escalationReason: null,
      };
    }

    return { text: JSON.stringify(mockPayload), model: 'mock-1.0' };
  }

  async complete(prompt: string): Promise<LLMResponse> {
    return this.chat([{ role: 'user', content: prompt }]);
  }
}

// ─── LLM Service Factory ─────────────────────────────────────────────────────

class LLMService {
  private provider: LLMProvider;

  constructor() {
    const githubToken = config.ai.githubModelsToken;
    const geminiKey = config.ai.geminiKey;
    const isMockKey =
      (githubToken && (githubToken.startsWith('mock_') || githubToken.includes('mock'))) ||
      (!githubToken && (!geminiKey || geminiKey.startsWith('mock_') || geminiKey.includes('mock')));
    const isTestEnv = config.env === 'test';

    if (githubToken && !isMockKey && !isTestEnv) {
      logger.info('[LLMService] Using GitHub Models provider (gpt-4o-mini)');
      this.provider = new GitHubModelsProvider(githubToken);
    } else if (geminiKey && !isMockKey && !isTestEnv) {
      logger.info('[LLMService] Using Gemini provider');
      this.provider = new GeminiProvider(geminiKey);
    } else {
      logger.warn('[LLMService] Using Mock LLM provider (test mode or mock key detected)');
      this.provider = new MockLLMProvider();
    }
  }

  /**
   * Send a multi-turn chat to the LLM and parse JSON response safely.
   */
  async chat<T = Record<string, unknown>>(
    messages: LLMMessage[],
    systemPrompt?: string
  ): Promise<T> {
    const response = await this.provider.chat(messages, systemPrompt);
    return this.parseJSON<T>(response.text);
  }

  /**
   * Send a single completion prompt and parse JSON response safely.
   */
  async complete<T = Record<string, unknown>>(prompt: string): Promise<T> {
    const response = await this.provider.complete(prompt);
    return this.parseJSON<T>(response.text);
  }

  private parseJSON<T>(text: string): T {
    try {
      // Strip markdown code fences if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err) {
      logger.error('[LLMService] Failed to parse LLM JSON response', { text, err });
      throw new Error('AI returned an invalid response format. Please try again.');
    }
  }
}

export const llmService = new LLMService();
