# Debugging Notes

The following represent real debugging scenarios encountered during the development of the AI Knowledge Base Assistant.

### Issue #1: pdf-parse Dynamic Import Failure
**Problem:** When uploading a PDF document, the server crashed with the error `This expression is not callable`, and text extraction failed completely.
**Root Cause:** The `pdf-parse` library is an older CommonJS (CJS) module that exports the parsing function directly via `module.exports`. The AI initially implemented a modern dynamic import pattern: `const pdfParse = (await import('pdf-parse')).default;`. In the compiled TypeScript Node environment, this caused the imported object to lack a callable default signature, breaking the function call.
**Investigation:** 
1. Monitored server logs during a PDF upload.
2. Traced the stack trace to `server/src/utils/extractText.ts` at the exact line where `pdfParse(buffer)` was invoked.
3. Ran a type-check (`tsc --noEmit`), which flagged: `Type 'typeof import(".../pdf-parse/cjs/index")' has no call signatures.`
**Solution:** I refactored the import to utilize standard Node.js `require` syntax combined with an explicit TypeScript interface cast, bypassing the ES Module interop issue:
```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;
```
**Lesson Learned:** When mixing modern TypeScript ESM environments with legacy CommonJS Node libraries, direct `require` statements with manual typing are often safer than relying on dynamic `import()` or synthetic default imports.

---

### Issue #2: React Implicit 'any' Types Breakdown
**Problem:** The React frontend completely failed to compile, emitting hundreds of errors like `Cannot find module 'react' or its corresponding type declarations` and `implicitly has an 'any' type`.
**Root Cause:** During the initial project scaffolding, the `tsconfig.json` and `vite.config.ts` were configured to use the path alias `"@types/*": ["./src/types/*"]`. This critically conflicted with TypeScript's native behavior of resolving community types from `node_modules/@types/`. By overriding this namespace, the compiler could no longer find the standard React definitions.
**Investigation:** 
1. Observed the catastrophic failure upon running `npx tsc --noEmit` in the client directory.
2. Verified that `npm install @types/react` had indeed been run successfully.
3. Inspected `tsconfig.json` paths and immediately recognized the namespace collision on `@types`.
**Solution:** 
1. Edited `client/vite.config.ts` and `client/tsconfig.json`.
2. Removed the `@types` alias entirely.
3. Mapped the intended local directories to new, non-reserved aliases (e.g., mapping to `@context` and using the standard `@/*` for generic types).
**Lesson Learned:** Never override default compiler namespace directories (like `@types`) in path aliases, as it breaks the fundamental TypeScript module resolution ecosystem.

---

### Issue #3: Unused Import Breaking Strict CI Builds
**Problem:** After refactoring the AI Controller to remove some complex Mongoose casting, the backend `npx tsc --noEmit` check began failing with: `error TS6133: 'Types' is declared but its value is never read.`
**Root Cause:** The project was configured with strict TypeScript compiler options, specifically `"noUnusedLocals": true` and `"noUnusedParameters": true`. A lingering import `import type { Types } from 'mongoose';` remained at the top of `aiController.ts` after the code utilizing it had been deleted.
**Investigation:**
1. Triggered a build validation step in the terminal.
2. The compiler pinpointed the exact file (`src/controllers/aiController.ts`) and line number (Line 2).
3. Inspected the file visually to confirm the `Types` object was indeed orphaned.
**Solution:** Removed the `import type { Types } from 'mongoose';` line from the top of the file, cleanly resolving the compiler error.
**Lesson Learned:** Strict TypeScript environments enforce excellent codebase hygiene, but require developers to diligently clean up imports and declarations during rapid refactoring cycles to maintain a passing build state.
