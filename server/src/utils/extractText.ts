import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { logger } from '@utils/logger';

const execFileAsync = promisify(execFile);

export interface ExtractResult {
  text: string;
  metadata: {
    wordCount: number;
    charCount: number;
    pageCount?: number;
  };
}

// Results shorter than this are treated as a failed extraction → try fallback.
const MIN_TEXT_LENGTH = 10;

const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

const cleanWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();

// ─── Tier 1: pdfjs-dist ───────────────────────────────────────────────────────
//
// pdfjs-dist v4 is ESM-only (no CommonJS build). This project compiles to
// CommonJS (tsconfig `module: "CommonJS"`), so a static `import`/`require` of
// the package throws `ERR_REQUIRE_ESM` at runtime — and tsc downlevels a plain
// dynamic `import()` to `require()` too. Building the import through
// `new Function` keeps a native dynamic import in the compiled output. We use
// the **legacy** build because the default build relies on browser DOM APIs
// (DOMMatrix, etc.) that don't exist in Node.

type PdfjsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs');
let pdfjsPromise: Promise<PdfjsModule> | null = null;

function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dynamicImport = new Function(
      'return import("pdfjs-dist/legacy/build/pdf.mjs")',
    ) as () => Promise<PdfjsModule>;
    pdfjsPromise = dynamicImport();
  }
  return pdfjsPromise;
}

async function extractWithPdfjsDist(
  buffer: Buffer,
): Promise<{ text: string; pages: number } | null> {
  try {
    const pdfjs = await loadPdfjs();

    // Fresh Uint8Array view; pdfjs may transfer/detach the underlying buffer.
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });

    const pdfDocument = await loadingTask.promise;
    try {
      const pageTexts: string[] = [];
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        try {
          const content = await page.getTextContent();
          pageTexts.push(
            content.items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' '),
          );
        } finally {
          page.cleanup();
        }
      }

      const text = cleanWhitespace(pageTexts.join('\n'));
      logger.info(`[pdfjs-dist] Extracted ${text.length} chars`);
      return { text, pages: pdfDocument.numPages };
    } finally {
      await pdfDocument.destroy();
    }
  } catch (err) {
    logger.warn(`[pdfjs-dist] Failed: ${String(err)}`);
    return null;
  }
}

// ─── Tier 2: pdf2json ─────────────────────────────────────────────────────────

async function extractWithPdf2json(
  buffer: Buffer,
): Promise<{ text: string; pages?: number } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFParser = require('pdf2json') as new (context?: null, verbosity?: number) => {
      on(event: 'pdfParser_dataReady', handler: () => void): void;
      on(event: 'pdfParser_dataError', handler: (err: { parserError: Error }) => void): void;
      parseBuffer(buf: Buffer): void;
      getRawTextContent(): string;
      data: { Pages?: unknown[] };
    };

    const parser = new PDFParser(null, 1); // verbosity=1 suppresses console spam

    const result = await new Promise<{ text: string; pages?: number } | null>(
      (resolve) => {
        parser.on('pdfParser_dataReady', () => {
          try {
            const raw = parser
              .getRawTextContent()
              // pdf2json inserts "----------------Page (n) Break----------------" markers
              .replace(/-+Page \(\d+\) Break-+/g, '\n');
            const pages = Array.isArray(parser.data?.Pages)
              ? parser.data.Pages.length
              : undefined;
            resolve({ text: cleanWhitespace(raw), pages });
          } catch (e) {
            logger.warn(`[pdf2json] getRawTextContent failed: ${String(e)}`);
            resolve(null);
          }
        });
        parser.on('pdfParser_dataError', (errData) => {
          logger.warn(`[pdf2json] Parse error: ${String(errData.parserError)}`);
          resolve(null);
        });
        parser.parseBuffer(buffer);
      },
    );

    if (result) logger.info(`[pdf2json] Extracted ${result.text.length} chars`);
    return result;
  } catch (err) {
    logger.warn(`[pdf2json] Failed: ${String(err)}`);
    return null;
  }
}

// ─── Tier 3: pdftotext (poppler shell utility, if installed) ──────────────────

async function extractWithPdftotext(filePath: string): Promise<string | null> {
  try {
    // execFile (not exec) — the path is passed as an argument, never through a
    // shell, so filenames with quotes/spaces can't inject commands.
    const { stdout } = await execFileAsync('pdftotext', [filePath, '-'], {
      maxBuffer: 64 * 1024 * 1024,
      timeout: 30_000,
    });
    const text = cleanWhitespace(stdout);
    logger.info(`[pdftotext] Extracted ${text.length} chars`);
    return text;
  } catch (err) {
    logger.warn(`[pdftotext] Failed or not installed: ${String(err)}`);
    return null;
  }
}

// ─── Public function ──────────────────────────────────────────────────────────

export async function extractText(
  filePath: string,
  mimeType: string,
): Promise<ExtractResult> {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const isPdf = mimeType === 'application/pdf' || ext === '.pdf';

    if (isPdf) {
      const fileName = path.basename(filePath);
      logger.info(`[extractText] Starting extraction for: ${fileName}`);

      const buffer = await fs.readFile(filePath);

      let text = '';
      let pageCount: number | undefined;
      let methodUsed = '';

      // Try 1: pdfjs-dist
      const primary = await extractWithPdfjsDist(buffer);
      if (primary && primary.text.length >= MIN_TEXT_LENGTH) {
        ({ text } = primary);
        pageCount = primary.pages;
        methodUsed = 'pdfjs-dist';
      } else {
        pageCount = primary?.pages;
      }

      // Try 2: pdf2json
      if (!methodUsed) {
        const fallback = await extractWithPdf2json(buffer);
        if (fallback && fallback.text.length >= MIN_TEXT_LENGTH) {
          ({ text } = fallback);
          pageCount = fallback.pages ?? pageCount;
          methodUsed = 'pdf2json';
        }
      }

      // Try 3: pdftotext (shell)
      if (!methodUsed) {
        const shellText = await extractWithPdftotext(filePath);
        if (shellText && shellText.length >= MIN_TEXT_LENGTH) {
          text = shellText;
          methodUsed = 'pdftotext';
        }
      }

      if (methodUsed) {
        logger.info(
          `[extractText] SUCCESS using ${methodUsed}: ${text.length} chars, ` +
            `${countWords(text)} words from "${fileName}"`,
        );
      } else {
        text = '';
        logger.error(
          `[extractText] ALL methods failed for "${fileName}" — ` +
            'likely a scanned/image-only or corrupted PDF',
        );
      }

      return {
        text,
        metadata: {
          wordCount: countWords(text),
          charCount: text.length,
          pageCount,
        },
      };
    }

    // text/plain or text/markdown — always works
    const text = await fs.readFile(filePath, 'utf-8');
    return {
      text,
      metadata: { wordCount: countWords(text), charCount: text.length },
    };
  } catch (err) {
    // Never crash the upload — store empty text and let callers handle it.
    logger.error(`extractText failed for "${filePath}": ${String(err)}`);
    return { text: '', metadata: { wordCount: 0, charCount: 0 } };
  }
}
