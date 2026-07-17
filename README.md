# AI Knowledge Base Assistant 🚀

A production-ready full-stack monorepo built with **React + Vite** on the client and **Express + MongoDB** on the server — all in TypeScript.

---

## Tech Stack

| Layer    | Technology                                                   |
|----------|--------------------------------------------------------------|
| Client   | React 18, Vite, TypeScript, Tailwind CSS, React Router v6   |
| State    | TanStack Query (React Query v5)                              |
| HTTP     | Axios (with interceptors)                                    |
| Icons    | Lucide React                                                 |
| Server   | Express, TypeScript, Morgan, Helmet, express-rate-limit      |
| Database | MongoDB + Mongoose                                           |
| Auth     | JWT (ready to wire up)                                       |

---

## Project Structure

```
ai-knowledge-base-assistant/
├── package.json          # Root workspace
├── .gitignore
├── README.md
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── api/          # Axios instance
│   │   ├── components/   # Shared UI components
│   │   ├── hooks/        # Custom React Query hooks
│   │   ├── pages/        # Route-level pages
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # Helper functions
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── server/               # Express + MongoDB backend
    ├── src/
    │   ├── config/       # DB connection
    │   ├── controllers/  # Route handlers
    │   ├── middleware/   # Error handler, notFound
    │   ├── models/       # Mongoose models
    │   ├── routes/       # Express routers
    │   ├── types/        # Shared types
    │   └── utils/        # Response helpers
    ├── .env.example
    └── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas URI

### 1. Clone & install

```bash
git clone <repo-url>
cd ai-knowledge-base-assistant

# Install all workspace dependencies
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your values
```

| Variable          | Description                              |
|-------------------|------------------------------------------|
| `PORT`            | Express server port (default: `5000`)    |
| `MONGODB_URI`     | MongoDB connection string                |
| `JWT_SECRET`      | Secret key for JWT signing               |
| `OPENAI_API_KEY`  | OpenAI API key (for AI features)         |
| `CLIENT_URL`      | Allowed CORS origin (default: Vite dev)  |

### 3. Run in development

```bash
# From the root — starts both server and client concurrently
npm run dev

# Or individually:
npm run dev --workspace=server   # http://localhost:5000
npm run dev --workspace=client   # http://localhost:5173
```

### 4. Build for production

```bash
npm run build
```

---

## API Conventions

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "message": "...",
  "data": { }
}
```

Error responses include `success: false` and a `message`. 5xx errors in development also expose the `stack` trace.

---

## Path Aliases

Both the client and server support absolute imports via `@` aliases:

**Client** (`client/src/`)
```ts
import api from '@api/axios';
import { formatDate } from '@utils/index';
```

**Server** (`server/src/`)
```ts
import { connectDB } from '@config/db';
import { AppError } from '@middleware/errorHandler';
```

---

## License

MIT
