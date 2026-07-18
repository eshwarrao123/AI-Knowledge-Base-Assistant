import type { AIMessage } from '@/services/aiService';

const MAX_DOC_CHARS = 12_000;

const SYSTEM_PROMPT =
  'You are a helpful assistant that answers questions based ONLY on the provided document content. ' +
  'If the answer is not found in the document, clearly say "I couldn\'t find the answer in the document." ' +
  'Do not make up information. Be concise but complete.';

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function buildPrompt(
  documentText: string,
  question: string,
  history: HistoryMessage[],
): AIMessage[] {
  const trimmed =
    documentText.length > MAX_DOC_CHARS
      ? documentText.slice(0, MAX_DOC_CHARS) + '\n\n[Document truncated due to length...]'
      : documentText;

  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Document:\n${trimmed}` },
    // Anchor assistant so it knows the doc has been read
    { role: 'assistant', content: 'I have read the document. Please ask your questions.' },
    // Last 4 history messages (2 exchange pairs)
    ...history.slice(-4).map((m): AIMessage => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];

  return messages;
}
