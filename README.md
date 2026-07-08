# StockFlow MVP

Minimal multi-tenant inventory management app. Sign up, create an organisation, manage products, and see a live low-stock dashboard.

## Stack
- **Backend:** Node.js + Express + Prisma + **PostgreSQL**
- **Frontend:** React (Vite) + Tailwind CSS + React Router
- **Auth:** JWT (jsonwebtoken) + bcrypt

## Project Structure
```
stockflow-mvp/
├── server/
│   ├── prisma/schema.prisma        # Database schema
│   ├── src/
│   │   ├── index.js                # Express app entry
│   │   ├── lib/prisma.js           # Prisma client singleton
│   │   ├── controllers/            # auth, products, dashboard, settings
│   │   ├── services/               # Business logic layer
│   │   ├── repositories/           # Database access layer
│   │   ├── routes/                 # Express routers
│   │   ├── middlewares/            # JWT auth middleware
│   │   └── validators/             # Input validation
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/                  # Login, Signup, Dashboard, Products, Settings
│   │   ├── components/             # SummaryCard, LowStockTable, EmptyState
│   │   ├── api/client.js           # Fetch wrapper
│   │   ├── context/AuthContext.jsx # JWT auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (default: `localhost:5432`)

### 1. Backend
```bash
cd server
cp .env.example .env
# Edit .env and set:
#   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/stockflow"
#   JWT_SECRET="a-long-random-secret-string"
npm install
npx prisma migrate deploy   # apply migrations to local DB
node src/index.js            # API runs on http://localhost:4000
```

### 2. Frontend (separate terminal)
```bash
cd client
npm install
npm run dev                  # Vite dev server on http://localhost:5174
                             # (proxies /api/* to :4000 automatically)
```

Visit `http://localhost:5174`, sign up, and start using the app.

---

## Production Deployment (Single Service)

The Express server is configured to serve the compiled React build from `client/dist`, so you only need **one running process**.

### Step 1 — Build the frontend
```bash
cd client && npm install && npm run build
# Outputs to client/dist/
```

### Step 2 — Configure environment variables
Set these on your hosting platform:

| Variable | Required | Example |
|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `JWT_SECRET` | ✅ | `some-long-random-secret-min-32-chars` |
| `PORT` | optional | `4000` (platform usually sets this automatically) |

### Step 3 — Run migrations & start
```bash
cd server && npm install
npx prisma migrate deploy    # creates/updates DB tables
npm start                    # serves API + frontend on $PORT
```

---

## Deploying to Render (Recommended — Free Tier)

### 1. Create a PostgreSQL database
- Go to [render.com](https://render.com) → **New** → **PostgreSQL**
- Choose the free plan
- Copy the **External Database URL** (starts with `postgresql://...`)

### 2. Create a Web Service
- **New** → **Web Service** → Connect your GitHub repo
- Set the following:

| Setting | Value |
|---|---|
| **Root Directory** | *(leave blank — repo root)* |
| **Environment** | `Node` |
| **Build Command** | `cd client && npm install && npm run build && cd ../server && npm install && npx prisma generate` |
| **Start Command** | `cd server && npx prisma migrate deploy && npm start` |

### 3. Add Environment Variables
In the Render dashboard → **Environment**:

| Key | Value |
|---|---|
| `DATABASE_URL` | *(paste the PostgreSQL External URL from step 1)* |
| `JWT_SECRET` | *(any long random string, e.g. generate with `openssl rand -hex 32`)* |

### 4. Deploy
Click **Deploy** — Render will build, migrate, and start the service. Your app will be live at `https://your-app.onrender.com`.

---

## Deploying to Railway

### 1. Create a project
- Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**

### 2. Add PostgreSQL
- Click **+ New** → **Database** → **PostgreSQL**
- Railway auto-sets `DATABASE_URL` as a shared variable

### 3. Set the service config
In the service settings:

| Setting | Value |
|---|---|
| **Root Directory** | *(leave blank)* |
| **Build Command** | `cd client && npm install && npm run build && cd ../server && npm install && npx prisma generate` |
| **Start Command** | `cd server && npx prisma migrate deploy && npm start` |

### 4. Add environment variable
- Add `JWT_SECRET` → any long random string

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create user + organisation |
| POST | `/api/auth/login` | — | Log in, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/products` | ✓ | List org's products |
| POST | `/api/products` | ✓ | Create product |
| PUT | `/api/products/:id` | ✓ | Update product |
| DELETE | `/api/products/:id` | ✓ | Delete product |
| PATCH | `/api/products/:id/adjust` | ✓ | Adjust stock quantity |
| GET | `/api/dashboard` | ✓ | Summary + low-stock list |
| GET | `/api/settings` | ✓ | Get default low-stock threshold |
| PUT | `/api/settings` | ✓ | Update default low-stock threshold |
| GET | `/api/health` | — | Health check |

## Multi-Tenancy
Every `Product` row is scoped to an `organizationId`, set from the verified JWT — never from the request body. This prevents all cross-tenant data leaks.

