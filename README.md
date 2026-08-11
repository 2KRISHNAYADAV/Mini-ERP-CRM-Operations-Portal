# Mini ERP + CRM Operations Portal

A production-quality Mini ERP + CRM portal built with React TypeScript, Node.js Express TypeScript, and Supabase PostgreSQL.

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

## 🔐 Demo Accounts

All accounts use password: `password123`

| Role      | Email                  | Permissions                              |
|-----------|------------------------|------------------------------------------|
| Admin     | admin@test.com         | Full access to all modules               |
| Sales     | sales@test.com         | Customers, Products (view), Challans     |
| Warehouse | warehouse@test.com     | Products, Inventory Management           |
| Accounts  | accounts@test.com      | Customers (view), Challans (view)        |

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

## 🔌 API Reference

| Method | Endpoint                     | Auth  | Description               |
|--------|------------------------------|-------|---------------------------|
| POST   | /api/auth/login              | ❌    | Login                     |
| GET    | /api/auth/me                 | ✅    | Get current user          |
| GET    | /api/dashboard               | ✅    | Dashboard stats           |
| GET    | /api/customers               | ✅    | List customers            |
| POST   | /api/customers               | Sales | Create customer           |
| PUT    | /api/customers/:id           | Sales | Update customer           |
| DELETE | /api/customers/:id           | Admin | Delete customer           |
| GET    | /api/products                | ✅    | List products             |
| POST   | /api/products                | Wh    | Create product            |
| PUT    | /api/products/:id            | Wh    | Update product            |
| DELETE | /api/products/:id            | Admin | Delete product            |
| GET    | /api/inventory/movements     | ✅    | List stock movements      |
| POST   | /api/inventory/adjust        | Wh    | Manual stock adjustment   |
| GET    | /api/challans                | ✅    | List challans             |
| GET    | /api/challans/:id            | ✅    | Challan with items        |
| POST   | /api/challans                | Sales | Create challan            |
| PATCH  | /api/challans/:id/cancel     | Sales | Cancel draft challan      |
| PATCH  | /api/challans/:id/confirm    | Sales | Confirm challan + deduct stock |
| GET    | /api/challans/:id/pdf        | ✅    | Download challan as PDF   |

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

---

## 📄 License

MIT


















---- 
<!-- how to dele this for new run. -->
<!-- 


netstat -ano | findstr :5000




POST /api/auth/login 401

 -->





<!-- CP    0.0.0.0:5000           0.0.0.0:0              LISTENING       25572
  TCP    [::]:5000              [::]:0                 LISTENING       25572
PS D:\project system\caseinfo> taskkill /PID 25572 /F
SUCCESS: The process with PID 25572 has been terminated. -->


<!-- [Backend] Server running on http://localhost:5000
[Backend] Database connected -->


<!-- 404 → API route missing
500 → Backend/database problem
CORS → frontend/backend connection issue
401 → wrong password/user -->







# 1. Backend Setup & Run

# 1. Navigate to the backend directory
cd backend

# 2. Copy the template .env file and edit it with your credentials
cp .env.example .env

# 3. Install backend dependencies
npm install

# 4. (Optional) Run the seed script to create the demo accounts in your database
npx tsx src/seed.ts

# 5. Start the backend developer server (runs on port 5000)
npm run dev



# 2.Frontend Setup & Run

# 1. Navigate to the frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server (runs on http://localhost:5173)
npm run dev




# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev



 Demo Logins
Once the project is running, you can log in to the frontend dashboard using any of the following accounts (all use the password password123):

Admin: admin@test.com (Full access)
Sales: sales@test.com (Customers CRM & Sales Challans)
Warehouse: warehouse@test.com (Products & Inventory Adjustments)
Accounts: accounts@test.com (View-only for CRM & Challans)


The reason we use demo/seeder accounts instead of "real" production accounts for this project setup is:

Security & Best Practices: You should never hardcode or save real users' passwords/emails in the source code or git repository. If the project code is public, anyone could see the credentials.
Testing Roles and Permissions: The project has Role-Based Access Control (RBAC) where different roles (Admin, Sales, Warehouse, Accounts) have different permissions. The seed script provides pre-made users for each role so you can instantly log in and test how the interface changes for each role.
Database Portability: Since the database runs on Supabase (PostgreSQL), when you set up a new database connection, it starts empty. Running the seed command (npx tsx src/seed.ts) quickly populates your new database with test accounts to work with.
How to use "Real" Accounts:
The project is fully prepared to handle real users! The login endpoint securely hashes and compares passwords using bcryptjs and signs requests using secure JWT tokens.

To use real accounts:

You can insert a new user row directly into the users table in your Supabase SQL editor using a secure hashed password.
Or, you can create a sign-up route/page to register new users programmatically.




Server	Status  Stop: Press Ctrl + C in each terminal window.
Backend (port 5000)	⛔ Stopped
Frontend (port 5173)	⛔ Stopped#   M i n i - E R P - C R M - O p e r a t i o n s - P o r t a l  
 #   M i n i - E R P - C R M - O p e r a t i o n s - P o r t a l  
 