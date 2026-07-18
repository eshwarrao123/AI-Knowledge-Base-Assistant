# AI Knowledge Base Assistant

The AI Knowledge Base Assistant is a full-stack web application that allows users to securely upload documents, extract text, and ask context-aware questions about their documents using AI. It leverages an Express backend to handle file processing and OpenAI integration, paired with a React frontend that provides a seamless, ChatGPT-like conversation interface.

## Features

- User registration and authentication using JWT
- Secure drag-and-drop document upload (PDF, TXT, MD) with automatic text extraction
- AI-powered Q&A querying against uploaded documents
- Persistent conversation history with title auto-generation, search, and filtering
- Dashboard overview displaying key metrics (total documents, total conversations, recent activity)
- Real-time Markdown rendering of AI responses, including code blocks
- Responsive UI featuring a modern dark theme
- Global error handling, request validation, and AI endpoint rate limiting

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router DOM, Lucide React |
| **State Management** | TanStack Query (React Query v5) |
| **HTTP Client** | Axios (with interceptors) |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB (Mongoose) |
| **File Processing** | Multer (upload), `pdf-parse` (PDF text extraction) |
| **Security & Auth** | JWT, `bcryptjs`, `express-rate-limit`, `express-validator`, `helmet`, `cors` |
| **AI Integration** | OpenAI Node.js SDK (GPT-3.5-turbo) |

## Prerequisites

- Node.js (v18 or higher)
- A MongoDB Atlas account (or local MongoDB instance)
- An OpenAI API Key

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-knowledge-base-assistant.git
   cd ai-knowledge-base-assistant
   ```

2. **Install dependencies**
   Install dependencies for the root workspace, server, and client concurrently:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Set up the necessary environment files for both backend and frontend. (See Environment Variables section below).
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Start Development Servers**
   From the root of the project, start both the React frontend and Express backend:
   ```bash
   npm run dev
   ```

## Environment Variables

### Server (`server/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Client (`client/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base API URL | `http://localhost:5000/api` |

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate user and return JWT | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/documents` | Upload a new document (multipart/form-data) | Yes |
| GET | `/api/documents` | List uploaded documents (paginated) | Yes |
| GET | `/api/documents/:id/preview`| Get extracted text content of a document | Yes |
| DELETE | `/api/documents/:id` | Delete a document and its file | Yes |
| POST | `/api/ask` | Ask a question about a document | Yes |
| GET | `/api/conversations` | List conversation history | Yes |
| GET | `/api/conversations/:id` | Retrieve a specific conversation | Yes |
| DELETE | `/api/conversations/:id` | Delete a conversation | Yes |
| GET | `/api/stats` | Retrieve user dashboard stats | Yes |

## Project Structure

```
ai-knowledge-base-assistant/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/                # Axios instance and API calls
│   │   ├── components/         # Shared UI (Navbar, ErrorBoundary, etc.)
│   │   ├── context/            # Global React context (AuthContext)
│   │   ├── hooks/              # React Query custom hooks
│   │   ├── pages/              # Route components (Dashboard, Chat, etc.)
│   │   └── types/              # TypeScript interfaces
│   ├── .env.example
│   └── vite.config.ts
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/             # DB, OpenAI, and Multer configurations
│   │   ├── controllers/        # Route logic
│   │   ├── middleware/         # Auth, global error handler
│   │   ├── models/             # Mongoose schemas (User, Document, Conversation)
│   │   ├── routes/             # API route definitions
│   │   └── utils/              # Text extraction, logger, standard responses
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml          # Container orchestration
└── package.json                # Root workspace configuration
```

## Design Decisions

**Why React Query (TanStack Query)?**
Managing complex asynchronous server state natively in React using `useEffect` often leads to boilerplate code, race conditions, and inefficient caching. React Query was selected because it provides out-of-the-box caching, background data fetching, and optimistic updates. This is particularly beneficial in the Chat interface, where optimistic UI updates drastically improve perceived latency during AI generation.

**Why JWT in localStorage?**
Storing JWTs in `localStorage` was chosen for simplicity and ease of implementation during this phase, facilitating straightforward token attachment via Axios interceptors. While HttpOnly cookies provide superior protection against Cross-Site Scripting (XSS) attacks, `localStorage` is acceptable for a rapid prototype or MVP, provided the application strictly sanitizes all user input and rendered output (e.g., using `react-markdown` safely).

**Why Mongoose?**
MongoDB is inherently flexible and handles unstructured data well, which is ideal for storing varied document metadata and conversational histories. Mongoose adds a crucial layer of schema validation, lifecycle hooks (like `pre-save` for password hashing), and TypeScript support on top of MongoDB, ensuring data integrity without sacrificing the flexibility of a NoSQL database.

**Why OpenAI (GPT-3.5-turbo)?**
GPT-3.5-turbo was chosen as the AI engine due to its excellent balance of speed, cost-effectiveness, and reasoning capabilities. By employing context-aware prompting (injecting the extracted document text alongside the conversation history directly into the system prompt), GPT-3.5-turbo can accurately answer questions constrained exclusively to the user's uploaded documents, minimizing hallucinations.

## Screenshots

*(Add screenshots here)*

## Deployment

### Backend (Render)
1. Connect your repository to Render.com and create a new **Web Service**.
2. Set the Root Directory to `server/`.
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/index.js`
5. Attach a Disk to mount `/app/uploads` for local file storage persistence.
6. Populate the required environment variables (`MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, etc.).

### Frontend (Vercel)
1. Import the repository into Vercel and set the Root Directory to `client/`.
2. Vercel will auto-detect Vite. Use the default build commands.
3. Set the `VITE_API_URL` environment variable to point to your live Render backend URL.

## Future Improvements

- **Vector Database Integration:** Migrate from naive context-window injection to chunking documents and storing embeddings in a vector database (like Pinecone or Qdrant) for Retrieval-Augmented Generation (RAG) to handle massive documents.
- **Cloud Storage:** Replace the local disk `uploads/` directory with AWS S3 or Cloudinary for highly scalable and stateless file storage.
- **Streaming Responses:** Implement Server-Sent Events (SSE) to stream AI responses word-by-word to the frontend, vastly improving UX for long answers.
- **OAuth Integration:** Add Google or GitHub SSO for frictionless user onboarding.
- **Rate Limiting Tiers:** Implement Redis-backed, tiered rate limiting depending on user subscription status to control OpenAI API costs.
