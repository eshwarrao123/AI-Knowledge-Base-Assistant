# AI Usage & Development Process

## Tools Used
- **Claude Sonnet 4-6** (AntiGravity IDE) — Primary coding agent for backend/frontend implementation
- **Claude Opus 4-8** (Claude Desktop App) — Complex debugging (PDF extraction, OpenAI/Gemini fallback wiring)
- **Gemini 3.1 Pro** (AntiGravity IDE) — Documentation writing (README, ARCHITECTURE, AI_USAGE, DEBUG_NOTES)

## How I Used AI
My approach to utilizing AI for this project followed a structured, iterative methodology:
1. **Scaffolding:** I used AI to rapidly generate boilerplate code, directory structures, and standard configurations (e.g., Express setup, React Router, Vite config).
2. **Feature Implementation:** For discrete features (Auth, Document Management, AI Q&A), I provided the AI with strict constraints regarding existing interfaces and file structures, instructing it to generate the business logic.
3. **Review & Refine:** AI output was never accepted blindly. I manually reviewed, tested, and occasionally refactored the generated code to ensure strict adherence to TypeScript standards and consistent error handling.
4. **Hardening:** Finally, I used AI to identify missing error boundaries, add validation rules, and construct deployment configurations.

## Example Prompts

**Phase 1: Project Scaffolding**
- *"Create a full-stack project with this structure: Root folder with package.json (workspaces or separate folders), /server: Express + TypeScript + MongoDB (Mongoose), /client: React + Vite + TypeScript + Tailwind CSS..."*
- *"change the project folder name now from 'mern-starter' to 'ai-knowledge-base-assistant'"*

**Phase 2: Database models**
- *"Create Mongoose models in server/src/models/ using the existing project structure. Follow these rules strictly: 1. Use path alias @models... Create these 3 models: USER MODEL... DOCUMENT MODEL... CONVERSATION MODEL..."*

**Phase 3: Authentication**
- *"Implement the complete authentication system (backend + frontend) using the EXISTING project structure. Do NOT recreate files that already exist. Only create NEW files and modify existing ones where specified..."*

**Phase 4: Document Management**
- *"Implement the complete Document Management feature (backend + frontend) using the EXISTING project structure... Configure multer with diskStorage, create extractText utility using pdf-parse..."*

**Phase 5: AI Q&A**
- *"Implement the complete AI Question Answering feature (backend + frontend)... Create buildPrompt utility that trims documentText to max ~12000 characters... Handle OpenAI API errors gracefully..."*

**Phase 6: Polish & Deployment**
- *"This is the FINAL technical phase. Do NOT change UI colors or styling. Focus only on production readiness, error handling, and deployment. Add global unhandled error safety net... Create Dockerfile..."*

## AI-Generated Code vs. Hand-Modified Code
- **Mostly AI-Generated:** Standard boilerplate (Express setup, Mongoose schemas), UI component scaffolding (Tailwind layouts, generic cards), and standard CRUD API routes.
- **Heavily Hand-Modified / Guided:** 
  - The `pdf-parse` implementation (handling CommonJS interop in a TypeScript module).
  - TypeScript configuration aliases (resolving conflicts between global `@types` and custom aliases).
  - The centralized error handling logic (mapping specific Mongoose and Multer errors to uniform HTTP responses).

## Modifications I Made
- **TypeScript Aliases:** I manually adjusted `vite.config.ts` and `tsconfig.json` to resolve severe path alias conflicts caused by initially using `@types` as a local project alias.
- **Error Formatting:** I refactored the AI's initial generic try/catch blocks to funnel all errors through a custom `AppError` class and a centralized `errorHandler` middleware.
- **Dynamic Imports:** I intervened to fix how the backend imported `pdf-parse` to prevent Node.js runtime errors related to CommonJS/ESM module resolution.

## AI Mistakes & Corrections
1. **pdf-parse Module Resolution:** 
   - *Mistake:* The AI attempted to use a dynamic import `(await import('pdf-parse')).default` for text extraction. Because `pdf-parse` is an older CommonJS package that exports its function directly as `module.exports`, this resulted in a runtime error: `This expression is not callable`.
   - *Correction:* I instructed the AI/manually updated the code to use `require('pdf-parse')` with a manual TypeScript cast to ensure it compiled and executed correctly in the Node environment.
2. **TypeScript Path Aliases Conflict:** 
   - *Mistake:* During scaffolding, the AI assigned the alias `@types/*` to map to the local `client/src/types` directory. This completely broke TypeScript's ability to resolve global ambient definitions from `node_modules/@types/`, causing massive "implicitly has an 'any' type" errors for React.
   - *Correction:* I refactored the configurations in both `tsconfig.json` and `vite.config.ts` to use `@context` or standard `@/*` mappings, abandoning the reserved `@types` namespace.

## Verification Process
1. **Static Analysis:** Rigorous use of `npx tsc --noEmit` on both client and server to ensure absolute type safety before runtime.
2. **Manual E2E Testing:** Booting the app (`npm run dev`) and manually clicking through user flows: registering an account, uploading a PDF, sending a chat message, and triggering a deletion.
3. **Simulated Failures:** Testing error boundaries by deliberately sending invalid JWTs, uploading oversized files, or submitting malformed MongoDB ObjectIds to ensure the API responded with clean, handled JSON rather than crashing the server.
