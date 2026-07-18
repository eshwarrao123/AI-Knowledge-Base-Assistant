# Architecture

## Overview
The AI Knowledge Base Assistant follows a standard client-server Monorepo architecture. 
- The **Client** is a Single Page Application (SPA) built with React and Vite, responsible for UI rendering, routing, and client-side state management.
- The **Server** is a RESTful API built with Express and Node.js, responsible for authentication, file processing, data persistence, and orchestrating requests to the OpenAI API.

## Project Structure
```text
ai-knowledge-base-assistant/
├── client/                     # Frontend Workspace
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios instance configuration and API route wrappers
│   │   ├── components/         # Reusable UI elements (Navbar, ErrorBoundary)
│   │   ├── context/            # React Context providers (AuthContext)
│   │   ├── hooks/              # TanStack Query custom hooks for data fetching
│   │   ├── pages/              # Top-level route components
│   │   ├── types/              # Shared TypeScript definitions
│   │   ├── App.tsx             # Main routing configuration
│   │   └── main.tsx            # React application entry point
│   ├── tailwind.config.js      # Styling configuration
│   └── vite.config.ts          # Build tool configuration
├── server/                     # Backend Workspace
│   ├── src/
│   │   ├── config/             # Environment, DB, and 3rd party service setups
│   │   ├── controllers/        # Request handlers mapping to endpoints
│   │   ├── middleware/         # Express middlewares (auth verification, error handling)
│   │   ├── models/             # Mongoose data schemas
│   │   ├── routes/             # Express Router definitions
│   │   ├── utils/              # Helper functions (text extraction, logging)
│   │   ├── app.ts              # Express application setup
│   │   └── index.ts            # Server entry point and bootstrapper
│   └── uploads/                # Local disk storage for uploaded files
├── docker-compose.yml          # Local container orchestration
└── package.json                # Root workspace definitions
```

## Database Design

The application uses MongoDB, modeled with three primary Mongoose schemas:

**1. User Schema**
- `email`: String (Unique, Indexed). Used for authentication.
- `password`: String (Hashed). Stored securely.
- `name`: String. Display name.
- *Indexes*: An index on `email` ensures fast lookups during login and prevents duplicate registrations.

**2. Document Schema**
- `owner`: ObjectId (Ref: User, Indexed). Links document to specific user.
- `originalName`: String. Name of the file uploaded.
- `filename`: String. Unique UUID filename stored on disk.
- `mimeType`: String. e.g., `application/pdf`, `text/markdown`.
- `path`: String. File system path.
- `size`: Number. File size in bytes.
- `extractedText`: String. The raw text parsed from the document, used for AI context.
- `metadata`: Object (wordCount, charCount, pageCount).
- *Indexes*: An index on `owner` is crucial here because almost all document queries are filtered by the user requesting them.

**3. Conversation Schema**
- `user`: ObjectId (Ref: User, Indexed). The user participating in the chat.
- `document`: ObjectId (Ref: Document, Indexed). The document acting as the context for the chat.
- `title`: String. Auto-generated from the first question.
- `messages`: Array of Objects (`role`, `content`, `timestamp`). The chat history.
- *Indexes*: Indexes on `user` and `document` allow for rapid retrieval of a user's chat history, and specifically filtering history by a certain document.

## Authentication Flow
1. **Registration/Login:** The user submits credentials. The backend verifies/hashes the password using `bcryptjs`.
2. **Token Generation:** Upon success, a JWT is signed with a secret key and returned to the client.
3. **Storage:** The React `AuthContext` stores the JWT in `localStorage`.
4. **Interception:** The Axios request interceptor automatically attaches the JWT as a `Bearer` token in the `Authorization` header for all outgoing API requests.
5. **Verification:** Protected Express routes utilize the `verifyToken` middleware to decode the JWT, extract the `userId`, and attach it to the `req.user` object. If invalid/expired, it returns a `401 Unauthorized`.

## AI Integration Flow
1. **Document Upload:** User uploads a file. `multer` saves it to the `uploads/` directory.
2. **Text Extraction:** Based on MIME type, `pdf-parse` (for PDFs) or the `fs` module (for TXT/MD) extracts the raw text. This text is saved in the database under `document.extractedText`.
3. **Question Asked:** User submits a question referencing a `documentId`.
4. **Prompt Building:** The backend fetches the `extractedText`. If it exceeds ~12,000 characters, it is truncated to fit the GPT-3.5-turbo context window. The `buildPrompt` utility constructs an array of messages: a strict System Prompt limiting answers to the document, the document text itself, the last 4 messages of conversation history (if any), and the new question.
5. **OpenAI Request:** The prompt is sent to OpenAI.
6. **Persistence:** The generated answer is appended to the `Conversation` document in MongoDB and returned to the client.

## Key Engineering Decisions

- **Monorepo vs Separate Repos:** Opted for a monorepo via npm workspaces. *Pros:* Easier dependency management, simplified cross-stack refactoring, and single-command local setup. *Cons:* Can become bloated as the project scales to dozens of microservices.
- **JWT in localStorage vs Session Cookies:** *Pros:* Stateless backend, highly portable, easy to implement in SPAs. *Cons:* Vulnerable to XSS. A production scale-up should migrate to HttpOnly cookies for security.
- **Local File Storage vs Cloud (S3):** *Pros:* Zero cost, zero setup time for MVP. *Cons:* Not horizontally scalable. If deployed to multiple instances, uploads won't sync. A transition to AWS S3 is mandatory before horizontal scaling.
- **React Query vs useEffect:** *Pros:* React Query handles caching, background refetching, and mutation states automatically. It eliminates boilerplate and complex loading/error state management inherent to standard `useEffect` fetches.
- **GPT-3.5-turbo vs GPT-4:** *Pros:* Significantly faster and cheaper. For standard RAG/document Q&A tasks where the context is explicitly provided, GPT-3.5-turbo provides sufficient reasoning capability while keeping latency low for a real-time chat interface.

## Scaling Considerations
To scale this application for production traffic:
1. **Stateless Backend:** Migrate file uploads from the local `uploads/` disk to a cloud object storage like AWS S3 or Cloudinary. This allows the Node.js backend to run on multiple instances behind a Load Balancer.
2. **Vector Database & RAG:** Truncating text to 12,000 characters fails for large documents. We must implement a pipeline to chunk documents and store embeddings in a Vector Database (e.g., Pinecone). The /ask endpoint would then perform a semantic search to retrieve only relevant chunks before querying OpenAI.
3. **Caching:** Implement Redis to cache frequently accessed data, such as User profiles or Document metadata.
4. **Streaming:** Transition the `/ask` endpoint to use Server-Sent Events (SSE) to stream the AI response chunks to the frontend to vastly improve perceived performance.
