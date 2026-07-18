import fs from 'fs/promises';
import path from 'path';

export interface ExtractResult {
  text: string;
  metadata: {
    wordCount: number;
    charCount: number;
    pageCount?: number;
  };
}

const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

export async function extractText(
  filePath: string,
  mimeType: string,
): Promise<ExtractResult> {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const isPdf = mimeType === 'application/pdf' || ext === '.pdf';

    if (isPdf) {
      // pdf-parse is CJS and exports the parser function as module.exports
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (
        buffer: Buffer,
      ) => Promise<{ text: string; numpages: number }>;
      const buffer = await fs.readFile(filePath);
      const result = await pdfParse(buffer);
      const text = result.text;
      return {
        text,
        metadata: {
          wordCount: countWords(text),
          charCount: text.length,
          pageCount: result.numpages,
        },
      };
    }

    // text/plain or text/markdown
    const text = await fs.readFile(filePath, 'utf-8');
    return {
      text,
      metadata: {
        wordCount: countWords(text),
        charCount: text.length,
      },
    };
  } catch {
    // Never crash the upload — return empty result
    return {
      text: '',
      metadata: { wordCount: 0, charCount: 0 },
    };
  }
}
