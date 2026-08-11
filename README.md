<div align="center">

# 🏢 Mini ERP + CRM Operations Portal

**A production-quality Mini ERP + CRM system for Sales, Inventory, and Customer Management**

Built with **React TypeScript**, **Node.js Express TypeScript**, and **Supabase PostgreSQL**

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](#)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](#)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase)](#)
[![Auth](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)](#)
[![License](https://img.shields.io/badge/License-MIT-blue)](#)

</div>

---

## 🔗 Live Deployments

| Service | URL | Host |
|---|---|---|
| 🖥️ Frontend | [mini-erp-crm-operations-portal-navy.vercel.app/login](https://mini-erp-crm-operations-portal-navy.vercel.app/login) | Vercel |
| ⚙️ Backend API | [mini-erp-crm-operations-portal-e2ig.onrender.com](https://mini-erp-crm-operations-portal-e2ig.onrender.com/) | Render |

---

## 📖 Table of Contents

1. [Tech Stack](#-tech-stack)
2. [System Architecture](#-system-architecture)
3. [Project Structure](#️-project-structure)
4. [Quick Start](#-quick-start)
5. [Demo Accounts](#-demo-accounts)
6. [Modules](#-modules)
7. [Core Flows](#-core-flows)
8. [Database Model (High-Level)](#-database-model-high-level)
9. [API Reference](#-api-reference)
10. [API Health Check](#-api-health-check)
11. [Security](#️-security)
12. [Available Scripts](#-available-scripts)
13. [Deployment Notes](#-deployment-notes)
14. [Local Dev Notes & Troubleshooting](#-local-dev-notes--troubleshooting)
15. [License](#-license)

---

## 📦 Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18 + TypeScript + Vite      |
| Backend  | Node.js + Express + TypeScript    |
| Database | Supabase PostgreSQL                |
| Auth     | JWT (jsonwebtoken + bcryptjs)     |
| Styling  | Vanilla CSS Design System         |

---

## 🏗 System Architecture

The portal follows a classic **3-tier architecture**: a React SPA talks to an Express REST API over HTTPS, and the API is the only layer that talks to the Supabase PostgreSQL database. JWTs issued at login are stored client-side and sent on every subsequent request to prove identity and role.

```mermaid
flowchart LR
    subgraph Client["🖥️ Frontend (Vercel)"]
        UI[React 18 + TypeScript + Vite]
        AuthCtx[AuthContext]
        Axios[Axios API Layer]
        UI --> AuthCtx --> Axios
    end

    subgraph Server["⚙️ Backend (Render)"]
        MW[Middleware<br/>Auth · Validation · Error Handling]
        Routes[Express Routers]
        Ctrl[Controllers]
        Svc[Services<br/>e.g. Challan Service]
        MW --> Routes --> Ctrl --> Svc
    end

    subgraph DB["🗄️ Supabase PostgreSQL"]
        Tables[(Users · Customers · Products<br/>Inventory · Challans · Challan Items)]
    end

    Axios -- "HTTPS + JWT Bearer Token" --> MW
    Svc -- "SQL over SSL (pooled connection)" --> Tables
    Tables -- "Query Results" --> Svc
    Svc -- "JSON Response" --> Axios
```

**Why this shape works well for an ERP/CRM tool:**
- **Frontend never touches the database directly** — all business rules (stock deduction, role checks, price snapshots) live in the backend, so the same rules apply no matter which client calls the API.
- **Services layer** (e.g. the Challan service) isolates multi-step business logic — like "check stock → deduct stock → write movement record" — from the HTTP layer, making it easier to test and reuse.
- **Stateless JWT auth** means the backend can scale horizontally (e.g. multiple Render instances) without needing shared session storage.

---

## 🗂️ Project Structure

```
caseinfo/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── controllers/    # Request handlers per module
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic (challan service)
│   │   ├── types/          # Shared TypeScript interfaces
│   │   ├── db.ts           # PostgreSQL pool (Supabase)
│   │   ├── server.ts       # Express app setup
│   │   └── seed.ts         # Demo user seeder
│   ├── schema.sql          # Database schema
│   ├── .env                # Environment variables
│   └── .env.example        # Template
└── frontend/
    └── src/
        ├── api/            # Axios API modules per entity
        ├── components/
        │   ├── layout/     # Sidebar, Navbar, Layout
        │   └── ui/         # Modal, Toast, Badge, etc.
        ├── context/        # AuthContext, ToastContext
        ├── pages/          # Login, Dashboard, Customers, ...
        └── types/          # Shared TypeScript types
```

**How this maps to the architecture diagram above:**
- `frontend/src/api/` = the **Axios API Layer**
- `frontend/src/context/AuthContext` = the **AuthContext** box
- `backend/src/middleware/` = the **Middleware** box (auth check, Zod validation, error handling)
- `backend/src/routes/` + `controllers/` = **Routers → Controllers**
- `backend/src/services/` = the **Services** box (e.g. `challanService` orchestrates stock checks + deduction + movement logging)
- `backend/src/db.ts` = the pooled connection into **Supabase PostgreSQL**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project

---

### 1. Set Up Supabase Database

1. Open your Supabase project → **SQL Editor**
2. Paste and run the contents of `backend/schema.sql`
3. Note your **Project connection string** from:
   *Project Settings → Database → Connection string → URI (Transaction mode)*

---

### 2. Backend Setup

```bash
cd backend

# Copy env template
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

Install dependencies and run the seed script:
```bash
npm install
npx tsx src/seed.ts    # Creates demo users with real password hashes
npm run dev            # Start backend on port 5000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev    # Start frontend on http://localhost:5173
```

---

### Run Both Together

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

| Server              | Port | Stop                          |
|---------------------|------|--------------------------------|
| Backend             | 5000 | `Ctrl + C` in its terminal    |
| Frontend            | 5173 | `Ctrl + C` in its terminal    |

---

## 🔐 Demo Accounts

All accounts use password: `password123`

| Role      | Email                  | Permissions                              |
|-----------|------------------------|-------------------------------------------|
| Admin     | admin@test.com         | Full access to all modules               |
| Sales     | sales@test.com         | Customers, Products (view), Challans     |
| Warehouse | warehouse@test.com     | Products, Inventory Management           |
| Accounts  | accounts@test.com      | Customers (view), Challans (view)        |

**Why seeded demo accounts instead of real ones?**

- **Security & best practices** — real user credentials should never be hardcoded or committed to a git repository. If the repo is public, anyone could see them.
- **Testing Role-Based Access Control (RBAC)** — the app has 4 roles (Admin, Sales, Warehouse, Accounts), each with different permissions. Seeded accounts let you instantly log in as any role and see how the UI and permissions change.
- **Database portability** — since the database lives on Supabase, a fresh connection starts empty. Running `npx tsx src/seed.ts` quickly populates it with working test accounts.

**Using real accounts in production:**
The login endpoint already hashes and compares passwords with `bcryptjs` and signs sessions with a secure JWT — it's production-ready. To add real users you can either:
1. Insert a new row into the `users` table via the Supabase SQL editor with a securely hashed password, or
2. Build a sign-up route/page that registers users programmatically through the existing auth logic.

---

## 📋 Modules

### 1. Dashboard
- Stat cards: Active Customers, Total Products, Confirmed Challans, Draft Challans
- Low stock alerts table
- Recent challans table

### 2. Customer CRM
- Full CRUD (Add, Edit, Delete)
- Fields: Name, Business, GST, Mobile, Email, Type, Address, Status, Follow-up Date, Notes
- Search and filter

### 3. Product Management
- Full CRUD
- Stock level badges (Out of Stock / Low Stock / In Stock)
- SKU uniqueness enforced

### 4. Inventory Management
- Stock movement log (IN / OUT)
- Manual stock adjustment (Warehouse role)
- Product filter

### 5. Sales Challan Management
- Create challan with multiple product lines
- Live price calculation per line
- Save as Draft or Confirm
- On confirm: stock availability check → stock deduction → movement records created
- Snapshot of product name/SKU/price at time of creation
- View challan detail modal with all line items
- Cancel draft challans
- **Download professional PDF** — company header, customer details, product table, grand total

---

## 🔄 Core Flows

### A. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant A as Backend (Express)
    participant DB as Supabase PostgreSQL

    U->>F: Enter email + password
    F->>A: POST /api/auth/login
    A->>DB: Look up user by email
    DB-->>A: Hashed password
    A->>A: bcrypt.compare(password, hash)
    alt Valid credentials
        A->>A: Sign JWT (userId, role)
        A-->>F: 200 OK + JWT token
        F->>F: Store token, set AuthContext
        F->>A: GET /api/auth/me (on every app boot)
        A-->>F: Current user + role
        F-->>U: Redirect to Dashboard
    else Invalid credentials
        A-->>F: 401 Unauthorized
        F-->>U: Show login error
    end
```

### B. Sales Challan Creation → Confirmation Flow

This is the most business-critical flow in the system: it is the only flow that mutates stock levels.

```mermaid
flowchart TD
    Start([Sales user opens New Challan]) --> AddLines[Add product lines<br/>qty + auto price lookup]
    AddLines --> Calc[Live total calculated in UI]
    Calc --> Choice{Save as Draft<br/>or Confirm?}

    Choice -- Save as Draft --> Draft[POST /api/challans<br/>status = draft]
    Draft --> DraftSaved[Challan saved,<br/>NO stock changes yet]

    Choice -- Confirm --> Confirm[PATCH /api/challans/:id/confirm]
    Confirm --> StockCheck{Enough stock<br/>for every line?}
    StockCheck -- No --> Reject[❌ 400 Error:<br/>Insufficient stock]
    StockCheck -- Yes --> Deduct[Deduct stock per line]
    Deduct --> Movement[Create OUT movement<br/>record per line]
    Movement --> Snapshot[Price/name/SKU already<br/>snapshotted at creation]
    Snapshot --> Confirmed[✅ Challan status = confirmed]

    DraftSaved --> CancelOpt{User cancels draft?}
    CancelOpt -- Yes --> Cancel[PATCH /api/challans/:id/cancel]
    CancelOpt -- No --> Confirm

    Confirmed --> PDF[GET /api/challans/:id/pdf<br/>Generate & download PDF]
```

**Key design decisions in this flow:**
- **Draft vs. Confirm** — separating "save" from "commit" lets Sales prepare a challan without risking a stock deduction until it is finalized.
- **Snapshotting** — product name, SKU, and price are copied onto the challan line at creation time, so later edits to the product catalog never retroactively change historical challans.
- **Atomic stock deduction** — stock availability is re-checked at confirm time (not just at draft time), and every deduction writes a paired inventory movement record for a full audit trail.

### C. Inventory Adjustment Flow

```mermaid
flowchart LR
    W[Warehouse user] --> Adjust[POST /api/inventory/adjust]
    Adjust --> Type{IN or OUT?}
    Type -- IN --> IncStock[Increase product stock]
    Type -- OUT --> DecStock[Decrease product stock]
    IncStock --> Log[Write movement log entry]
    DecStock --> Log
    Log --> Badge[Product stock badge<br/>updates: In Stock / Low / Out]
```

---

## 🗃 Database Model (High-Level)

```mermaid
erDiagram
    USERS ||--o{ CHALLANS : creates
    CUSTOMERS ||--o{ CHALLANS : "billed to"
    CHALLANS ||--|{ CHALLAN_ITEMS : contains
    PRODUCTS ||--o{ CHALLAN_ITEMS : "snapshotted into"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "tracked by"
    USERS ||--o{ STOCK_MOVEMENTS : records

    USERS {
        uuid id
        string email
        string password_hash
        string role
    }
    CUSTOMERS {
        uuid id
        string name
        string business
        string gst
        string mobile
        string status
        date follow_up_date
    }
    PRODUCTS {
        uuid id
        string sku
        string name
        numeric price
        int stock_qty
    }
    CHALLANS {
        uuid id
        uuid customer_id
        string status
        numeric grand_total
        timestamp created_at
    }
    CHALLAN_ITEMS {
        uuid id
        uuid challan_id
        uuid product_id
        string product_name_snapshot
        string sku_snapshot
        numeric price_snapshot
        int quantity
    }
    STOCK_MOVEMENTS {
        uuid id
        uuid product_id
        string direction
        int quantity
        string reason
        timestamp created_at
    }
```

> This is a simplified, illustrative model based on the modules described above — see `backend/schema.sql` for the authoritative schema.

---

## 🔌 API Reference

| Method | Endpoint                     | Auth  | Description               |
|--------|-------------------------------|-------|----------------------------|
| POST   | /api/auth/login              | ❌    | Login                     |
| GET    | /api/auth/me                 | ✅    | Get current user          |
| GET    | /api/dashboard               | ✅    | Dashboard stats           |
| GET    | /api/customers               | ✅    | List customers            |
| POST   | /api/customers               | Sales | Create customer            |
| PUT    | /api/customers/:id           | Sales | Update customer            |
| DELETE | /api/customers/:id           | Admin | Delete customer            |
| GET    | /api/products                | ✅    | List products              |
| POST   | /api/products                | Wh    | Create product              |
| PUT    | /api/products/:id            | Wh    | Update product              |
| DELETE | /api/products/:id            | Admin | Delete product              |
| GET    | /api/inventory/movements     | ✅    | List stock movements       |
| POST   | /api/inventory/adjust        | Wh    | Manual stock adjustment     |
| GET    | /api/challans                | ✅    | List challans               |
| GET    | /api/challans/:id            | ✅    | Challan with items          |
| POST   | /api/challans                | Sales | Create challan               |
| PATCH  | /api/challans/:id/cancel     | Sales | Cancel draft challan         |
| PATCH  | /api/challans/:id/confirm    | Sales | Confirm challan + deduct stock |
| GET    | /api/challans/:id/pdf        | ✅    | Download challan as PDF     |

> **Full API documentation:** [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md)

---

## 🩺 API Health Check

The health endpoints are used to verify that the backend services and database connections are running correctly, which is useful for deployment monitoring, uptime checks, and local development.

### Root Health Check (`GET /`)
Verifies the backend server is running.
```json
{
  "name": "Mini ERP + CRM API",
  "status": "running",
  "environment": "development",
  "timestamp": "2026-08-11T01:32:26.000Z"
}
```

### API Health Check (`GET /api/health`)
Verifies the API routes and database connection status.
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "ERP CRM Backend"
}
```

---

## 🛡️ Security

- JWT tokens signed with configurable secret — validated on every app boot via `/api/auth/me`
- Helmet.js for HTTP security headers
- CORS restricted to configured origins
- Rate limiting: 200 requests / 15 min per IP
- Role-based access control on all write endpoints
- SSL required for Supabase connection
- Input validation via Zod schemas

```mermaid
flowchart LR
    Req[Incoming Request] --> Helmet[Helmet.js<br/>security headers]
    Helmet --> CORS[CORS check<br/>allowed origins only]
    CORS --> RateLimit[Rate limiter<br/>200 req / 15 min / IP]
    RateLimit --> JWTCheck{Valid JWT?}
    JWTCheck -- No --> Deny401[401 Unauthorized]
    JWTCheck -- Yes --> RoleCheck{Role allowed<br/>for this route?}
    RoleCheck -- No --> Deny403[403 Forbidden]
    RoleCheck -- Yes --> Zod[Zod schema validation]
    Zod -- Invalid --> Deny400[400 Bad Request]
    Zod -- Valid --> Controller[Controller / Service logic]
```

---

## 🔧 Available Scripts

### Backend
```bash
npm run dev     # tsx watch (hot reload)
npm run build   # tsc compile
npm run start   # node dist/server.js
npx tsx src/seed.ts   # Seed demo users
```

### Frontend
```bash
npm run dev     # Vite dev server
npm run build   # Production build
npm run preview # Preview production build
```

---

## 🌐 Deployment Notes

### Backend (e.g., Railway / Render)
1. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
2. Build command: `npm run build`
3. Start command: `npm run start`

### Frontend (e.g., Vercel / Netlify)
1. Set `VITE_API_URL=https://your-backend.railway.app/api`
2. Build command: `npm run build`
3. Output directory: `dist`

```mermaid
flowchart LR
    subgraph GH[GitHub Repo]
        BE[backend/]
        FE[frontend/]
    end
    BE -- "auto-deploy on push" --> Render[Render<br/>npm run build → npm run start]
    FE -- "auto-deploy on push" --> Vercel[Vercel<br/>npm run build → dist/]
    Render <-- "VITE_API_URL" --> Vercel
    Render --> Supabase[(Supabase PostgreSQL)]
```

---

## 🧰 Local Dev Notes & Troubleshooting

These are quick reference notes for local development on Windows (kept from the original project notes).

**Find and kill a process holding port 5000:**
```powershell
netstat -ano | findstr :5000

# Example output:
# TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    25572
# TCP    [::]:5000       [::]:0       LISTENING    25572

taskkill /PID 25572 /F
# SUCCESS: The process with PID 25572 has been terminated.
```

**Healthy backend startup looks like:**
```
[Backend] Server running on http://localhost:5000
[Backend] Database connected
```

**Common HTTP status codes while developing:**

| Code | Meaning |
|------|---------|
| 404  | API route missing |
| 500  | Backend/database problem |
| CORS error | Frontend/backend origin mismatch |
| 401  | Wrong password/user, or missing/expired token |

**Resetting for a fresh run:**

| Server              | Port | Status      | Stop command                 |
|---------------------|------|-------------|-------------------------------|
| Backend             | 5000 | ⛔ Stopped  | `Ctrl + C` in its terminal    |
| Frontend            | 5173 | ⛔ Stopped  | `Ctrl + C` in its terminal    |

---

## 📄 License

MIT
