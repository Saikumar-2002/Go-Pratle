## Requirement Posting Flow (Next.js + Express + MongoDB)

This workspace contains:

- **`frontend/`**: Next.js app with a 4-step requirement posting form
- **`backend/`**: Express + MongoDB API that stores submitted requirements, categorized as `planner`, `performer`, or `crew`

### Backend setup

1. Copy env:

   - `backend/.env.example` → `backend/.env`

2. Set `MONGODB_URI` (local MongoDB or Atlas).

3. Run:

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000` and exposes:

- `GET /health`
- `POST /api/requirements`
- `GET /api/requirements?category=planner|performer|crew`

### Frontend setup

1. Copy env:

   - `frontend/.env.example` → `frontend/.env.local`

2. Run:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` and go to **Post a requirement** (`/post`).

