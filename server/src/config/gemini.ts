import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('[Gemini] GEMINI_API_KEY not set. Gemini fallback disabled.');
}

export const geminiClient = apiKey ? new GoogleGenerativeAI(apiKey) : null;