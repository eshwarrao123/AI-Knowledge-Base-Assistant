import type { Content } from '@google/generative-ai';
import { openai } from '@config/openai';
import { geminiClient } from '@config/gemini';
import { logger } from '@utils/logger';

// NOTE: 'gemini-1.5-flash' is retired for new API keys — this key only has
// access to current models (verified: 2.5 works, 1.5/2.0 return 404).
const GEMINI_MODEL = 'gemini-2.5-flash';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getAIResponse(messages: AIMessage[]): Promise<string> {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      logger.info('[AI Service] Trying OpenAI...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.3,
      });
      const answer = completion.choices[0]?.message?.content ?? '';
      logger.info(`[AI Service] OpenAI success: ${answer.length} chars`);
      if (answer) return answer;
      logger.warn('[AI Service] OpenAI returned empty answer, falling back...');
    } catch (error) {
      const err = error as { message?: string; status?: number; code?: string };
      logger.error(
        `[AI Service] OpenAI failed: ${err.message} (status: ${err.status}, code: ${err.code})`,
      );
      // Continue to Gemini fallback
    }
  }

  // Fallback to Gemini
  if (geminiClient) {
    try {
      logger.info('[AI Service] Trying Gemini...');

      // Separate system prompt from conversation
      const systemPrompt = messages.find((m) => m.role === 'system')?.content ?? '';
      const conversation: Content[] = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const model = geminiClient.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: systemPrompt || undefined,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.3 },
      });

      const chat = model.startChat({ history: conversation.slice(0, -1) });

      const lastMessage =
        conversation[conversation.length - 1]?.parts[0]?.text ?? '';
      const result = await chat.sendMessage(lastMessage);
      const answer = result.response.text();
      logger.info(`[AI Service] Gemini success: ${answer.length} chars`);
      return answer;
    } catch (error) {
      const err = error as { message?: string };
      logger.error(`[AI Service] Gemini failed: ${err.message}`);
      throw new Error(`All AI services failed. ${err.message}`);
    }
  }

  throw new Error(
    'No AI service configured. Set OPENAI_API_KEY or GEMINI_API_KEY in .env',
  );
}
