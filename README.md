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

## Deployment

### Backend — Render.com

1. Create a new **Web Service** on [Render](https://render.com), connect your GitHub repo and set root directory to `server/`.
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `node dist/index.js`
4. Add a **Disk** (mount path `/app/uploads`, 1 GB) for file storage — or migrate to S3/Cloudinary.
5. Add **Environment Variables** in the Render dashboard:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `CLIENT_URL` | Your Vercel frontend URL |

> A `render.yaml` blueprint is included in `server/render.yaml` for one-click deployment.

---

### Frontend — Vercel

1. Import the repository on [Vercel](https://vercel.com), set **Root Directory** to `client/`.
2. Set **Build Command**: `npm run build`
3. Set **Output Directory**: `dist`
4. Add **Environment Variable**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

5. Update `client/src/api/axios.ts` `baseURL` to use `import.meta.env.VITE_API_URL` if deploying frontend to a different domain than the API.

---

### Docker (local / self-hosted)

```bash
# Copy env file and fill in values
cp server/.env.example server/.env

# Build client first
cd client && npm run build && cd ..

# Start all services (mongo + api + nginx)
docker-compose up --build
```

---

## License

MIT
