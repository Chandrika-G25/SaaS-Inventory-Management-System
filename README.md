# StockFlow MVP

Minimal multi-tenant inventory management app. Sign up, manage products, see a low-stock dashboard.

## Stack
- **Backend:** Node.js + Express + Prisma + SQLite
- **Frontend:** React (Vite) + Tailwind + React Router
- **Auth:** JWT + bcrypt

## Project Structure
```
stockflow-mvp/
├── server/       # Express API, Prisma schema, all backend logic
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── index.js          # app entry
│   │   ├── lib/prisma.js     # Prisma client singleton
│   │   ├── middleware/auth.js
│   │   └── routes/           # auth, products, dashboard, settings
│   ├── .env.example
│   └── package.json
├── client/       # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/            # Login, Signup, Dashboard, Products, Settings
│   │   ├── api/client.js     # fetch wrapper
│   │   ├── context/AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Local Development Setup

### 1. Backend
```bash
cd server
cp .env.example .env      # then edit JWT_SECRET to a random string
npm install
npx prisma migrate dev --name init
npm run dev                # runs on http://localhost:4000
```

### 2. Frontend
In a second terminal:
```bash
cd client
npm install
npm run dev                # runs on http://localhost:5173, proxies /api to :4000
```

Visit `http://localhost:5173`, sign up, and you're in.

## Production Build (single-service deploy)
Express is set up to serve the built React app, so you only need to deploy one service.

```bash
cd client && npm install && npm run build   # outputs client/dist
cd ../server && npm install
npx prisma migrate deploy
npm start                                    # serves API + built frontend on the same port
```

### Deploying to Render / Railway
1. Build command: install deps in both `client` and `server`, then run `npm run build` inside `client`.
2. Start command: `node server/src/index.js` (or `npm start` inside `server`).
3. Environment variables: `JWT_SECRET`, `DATABASE_URL` (`file:./dev.db` for SQLite; note SQLite is ephemeral on most platforms unless you attach a persistent volume — fine for an MVP demo).
4. Run `npx prisma migrate deploy` as part of the build/release step so the schema exists on first boot.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | – | Create user + organization |
| POST | /api/auth/login | – | Log in, get JWT |
| GET | /api/products | ✓ | List org's products |
| POST | /api/products | ✓ | Create product |
| PUT | /api/products/:id | ✓ | Update product |
| DELETE | /api/products/:id | ✓ | Delete product |
| GET | /api/dashboard | ✓ | Summary + low-stock list |
| GET | /api/settings | ✓ | Get default low-stock threshold |
| PUT | /api/settings | ✓ | Update default low-stock threshold |

## Multi-tenancy note
Every `Product` row is scoped to an `organizationId`, and every authed route pulls `organizationId`
from the verified JWT (never from the request body) before filtering queries. This is what
prevents cross-tenant data leaks — the thing explicitly called out in the PRD's success criteria.

## Git workflow reminder
Commit as you go through each milestone (schema → auth → product CRUD API → product CRUD UI →
dashboard → settings → deploy) rather than one big commit at the end — assessment instructions
require visible incremental commit history.
