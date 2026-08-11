# 🚀 Deployment Guide — Mini ERP + CRM Portal

> **This file is your complete, step-by-step manual to deploy this project.**
> Frontend → Vercel | Backend → Render | Database → Supabase
> Follow each section IN ORDER. Do not skip steps.

---

## ✅ Deployment Readiness Checklist

Before you start, confirm these files exist in your project:

| File | Purpose | Status |
|------|---------|--------|
| `.gitignore` | Stops secrets from being uploaded | ✅ Ready |
| `backend/.env.example` | Template for backend secrets | ✅ Ready |
| `frontend/.env.example` | Template for frontend API URL | ✅ Ready |
| `frontend/vercel.json` | Fixes page refresh on Vercel | ✅ Ready |
| `render.yaml` | Tells Render how to build backend | ✅ Ready |
| `backend/src/config/env.ts` | Reads all environment variables | ✅ Ready |
| `backend/src/server.ts` | CORS accepts Vercel URL dynamically | ✅ Ready |
| `backend/package.json` → `build` + `start` scripts | Render needs these | ✅ Ready |
| `frontend/package.json` → `build` script | Vercel needs this | ✅ Ready |
| `backend/schema.sql` | Database table definitions | ✅ Ready |

**Your project is 100% ready to deploy.**

---

## 📋 Overview — What You Will Do

```
Step 1 → Push code to GitHub
Step 2 → Deploy backend on Render (gets you a backend URL)
Step 3 → Deploy frontend on Vercel (gets you a frontend URL)
Step 4 → Connect them together (paste each other's URLs)
Step 5 → Run the database seed (creates demo accounts)
Step 6 → Test everything
```

---

## STEP 1 — Push Your Project to GitHub

### 1A. Create a GitHub Account
1. Go to **https://github.com**
2. Click **Sign up** and create a free account
3. Verify your email

### 1B. Create a New Repository
1. After logging in, click the **+** button (top right) → **New repository**
2. Fill in:
   - **Repository name**: `mini-erp-crm-portal`
   - **Visibility**: Private *(recommended — keeps your code safe)*
   - **DO NOT** tick "Add README" or "Add .gitignore" — your project already has them
3. Click **Create repository**
4. GitHub shows you a page with commands. **Keep this page open.**

### 1C. Install Git on Your Computer
1. Go to **https://git-scm.com/downloads**
2. Download and install Git for Windows
3. During install, choose **"Git from the command line"** when asked
4. Open a new **PowerShell** or **Command Prompt** window after install

### 1D. Configure Git (one-time setup)
Open PowerShell and run these two commands (replace with your name and email):
```powershell
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 1E. Upload Your Project
Open PowerShell, navigate to your project folder, and run these commands **one by one**:

```powershell
cd "d:\project system\caseinfo"
```

```powershell
git init
```

```powershell
git add .
```

```powershell
git commit -m "feat: initial commit — Mini ERP + CRM portal"
```

```powershell
git branch -M main
```

Now copy the remote URL from the GitHub page you kept open (looks like `https://github.com/YOUR-USERNAME/mini-erp-crm-portal.git`) and run:
```powershell
git remote add origin https://github.com/YOUR-USERNAME/mini-erp-crm-portal.git
```

```powershell
git push -u origin main
```

> **GitHub will ask for your username and password.**
> For password: use a **Personal Access Token**, not your GitHub password.
> Get one at: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token → tick **repo** → Generate.

✅ **Done!** Refresh your GitHub page — you should see all your project files there.

---

## STEP 2 — Deploy Backend on Render

### 2A. Create a Render Account
1. Go to **https://render.com**
2. Click **Get Started for Free**
3. Sign up using your **GitHub account** (click "Continue with GitHub") — this lets Render read your code automatically

### 2B. Create a New Web Service
1. After logging in, click **New +** → **Web Service**
2. Click **Connect a repository**
3. You will see your GitHub repos — click **mini-erp-crm-portal**
4. Click **Connect**

### 2C. Configure the Service
Fill in these settings exactly:

| Setting | Value |
|---------|-------|
| **Name** | `mini-erp-backend` |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | Free |

### 2D. Add Environment Variables
Scroll down to **Environment Variables** and add these one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | *(your Supabase connection string — see note below)* |
| `JWT_SECRET` | *(any long random string, e.g. `x7kP2mQ9rT4vW8nY3jA6sD1fG5hL0bE`)* |
| `FRONTEND_URL` | *(leave blank for now — fill in after Step 3)* |

> **Where to get DATABASE_URL:**
> 1. Go to your Supabase project → **Project Settings** → **Database**
> 2. Under **Connection string** → select **URI** tab → select **Transaction mode**
> 3. Copy the string — it starts with `postgresql://postgres...`
> 4. Replace `[YOUR-PASSWORD]` in the string with your actual database password

> **JWT_SECRET tip:** Generate a strong secret at **https://generate-secret.vercel.app/64**

### 2E. Deploy
1. Click **Create Web Service**
2. Render will now build and deploy your backend — this takes **2–5 minutes**
3. Watch the logs — you should eventually see:
   ```
   ✅ Database connected
   🚀 Server running on http://localhost:5000
   ```
4. At the top of the page, copy your backend URL — it looks like:
   ```
   https://mini-erp-backend.onrender.com
   ```
   **Save this URL — you need it in Step 3.**

---

## STEP 3 — Deploy Frontend on Vercel

### 3A. Create a Vercel Account
1. Go to **https://vercel.com**
2. Click **Sign Up**
3. Choose **Continue with GitHub** — same as Render, this lets Vercel read your code

### 3B. Import Your Project
1. After logging in, click **Add New** → **Project**
2. Find **mini-erp-crm-portal** in the list and click **Import**

### 3C. Configure the Project
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` ← **very important, click Edit** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

> **How to set Root Directory:**
> Click the **Edit** button next to Root Directory → type `frontend` → click Continue

### 3D. Add Environment Variable
Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://mini-erp-backend.onrender.com/api` |

*(Replace `mini-erp-backend.onrender.com` with your actual Render URL from Step 2E)*

### 3E. Deploy
1. Click **Deploy**
2. Vercel builds in **1–2 minutes**
3. When done, you see a success page with confetti 🎉
4. Copy your frontend URL — it looks like:
   ```
   https://mini-erp-crm-portal.vercel.app
   ```
   **Save this URL — you need it in Step 4.**

---

## STEP 4 — Connect Backend and Frontend Together

Now that both are deployed, they need to know each other's URLs.

### 4A. Update Backend FRONTEND_URL on Render
1. Go to **Render dashboard** → your `mini-erp-backend` service
2. Click **Environment** in the left sidebar
3. Find the `FRONTEND_URL` variable → click the pencil (edit) icon
4. Paste your Vercel frontend URL: `https://mini-erp-crm-portal.vercel.app`
5. Click **Save Changes**
6. Render will automatically **redeploy** — wait 1–2 minutes

### 4B. Verify CORS is Working
After Render redeploys, open your Vercel frontend URL in the browser.
Open **DevTools** (press F12) → **Console** tab.
If you see no red CORS errors, the connection is working. ✅

---

## STEP 5 — Set Up the Database

### 5A. Run the SQL Schema (if not done already)
1. Go to **https://supabase.com** → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `backend/schema.sql` from your project
5. Copy all the text and paste it into Supabase SQL Editor
6. Click **Run** (green button)
7. You should see: `Success. No rows returned`

### 5B. Seed Demo Users
The demo users (admin, sales, warehouse, accounts) are created by running the seed script.

You need to do this **once** from your local machine:

1. Open PowerShell
2. Navigate to the backend folder:
   ```powershell
   cd "d:\project system\caseinfo\backend"
   ```
3. Make sure your `.env` file has the correct `DATABASE_URL` (same Supabase connection string)
4. Run:
   ```powershell
   npx tsx src/seed.ts
   ```
5. You should see success messages for each demo user created

---

## STEP 6 — Test Your Live Application

### 6A. Open the Live Frontend
Go to your Vercel URL: `https://mini-erp-crm-portal.vercel.app`

### 6B. Login with Demo Accounts
All accounts use password: **`password123`**

| Role | Email |
|------|-------|
| Admin | `admin@test.com` |
| Sales | `sales@test.com` |
| Warehouse | `warehouse@test.com` |
| Accounts | `accounts@test.com` |

### 6C. Test Checklist
Go through these actions to confirm everything works:

- [ ] Login with `admin@test.com` → lands on Dashboard
- [ ] Dashboard shows stat cards (no errors)
- [ ] Go to Customers → list loads
- [ ] Add a new customer → saved successfully
- [ ] Go to Products → list loads
- [ ] Add a new product → saved successfully
- [ ] Go to Inventory → movement log loads
- [ ] Go to Challans → list loads
- [ ] Create a new challan in Draft status
- [ ] Confirm the challan → stock decrements
- [ ] Logout → redirected to Login

If all boxes are ticked → **your deployment is complete!** 🎉

---

## 🔧 Troubleshooting Common Issues

### ❌ "Failed to fetch" or blank screen on frontend

**Cause:** `VITE_API_URL` is wrong or backend is not running.

**Fix:**
1. Go to Vercel → your project → **Settings** → **Environment Variables**
2. Check `VITE_API_URL` starts with `https://` and ends with `/api`
3. Open your Render backend URL in browser + add `/health` — e.g. `https://mini-erp-backend.onrender.com/health`
4. If you see `{"status":"ok"}` the backend is running correctly
5. After fixing, go to Vercel → **Deployments** → **Redeploy** (top right menu)

---

### ❌ CORS error in browser console

**Cause:** `FRONTEND_URL` is not set on Render, or set to the wrong URL.

**Fix:**
1. Go to Render → `mini-erp-backend` → **Environment**
2. Confirm `FRONTEND_URL` = your exact Vercel URL (no trailing slash)
   - ✅ Correct: `https://mini-erp-crm-portal.vercel.app`
   - ❌ Wrong: `https://mini-erp-crm-portal.vercel.app/`
3. Save → wait for Render to redeploy

---

### ❌ "DATABASE_URL is not set" — backend crashes on Render

**Cause:** You forgot to add `DATABASE_URL` to Render environment variables.

**Fix:**
1. Render → your service → **Environment**
2. Add `DATABASE_URL` with the full Supabase connection string
3. Make sure the password in the URL is correct (no special characters unencoded)

---

### ❌ Login says "Invalid credentials" for demo accounts

**Cause:** The seed script was not run, so demo users don't exist in the database.

**Fix:** Run the seed script from your local machine (Step 5B above).

---

### ❌ Render says "Build failed"

**Cause:** TypeScript compilation error or missing dependency.

**Fix:**
1. In Render → your service → **Logs** — read the error message
2. Check that `Root Directory` is set to `backend` in Render settings
3. Check that `Build Command` is exactly: `npm install && npm run build`

---

### ❌ Page refresh gives 404 on Vercel (e.g. refreshing `/customers`)

**Cause:** `vercel.json` is missing or not in the `frontend/` folder.

**Fix:**
The file `frontend/vercel.json` already exists in your project with this content:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Make sure it was committed to GitHub. If not, add it and push again.

---

## 📁 Files Created/Modified for Deployment

| File | What It Does |
|------|-------------|
| `.gitignore` | Prevents `.env`, `node_modules`, `dist` from being uploaded to GitHub |
| `frontend/vercel.json` | Fixes React Router 404 on page refresh in Vercel |
| `render.yaml` | Blueprint that tells Render how to build and start the backend |
| `backend/.env.example` | Template showing all required environment variables |
| `frontend/.env.example` | Template showing the frontend API URL variable |
| `backend/src/config/env.ts` | Added `FRONTEND_URL` variable |
| `backend/src/server.ts` | CORS now dynamically allows your Vercel URL |

---

## 🔄 How to Push Future Code Changes

After the first deployment, every time you change code:

```powershell
cd "d:\project system\caseinfo"
```
```powershell
git add .
```
```powershell
git commit -m "fix: describe what you changed"
```
```powershell
git push
```

**Vercel and Render automatically detect the push and redeploy within 2–3 minutes.** You do not need to do anything else.

---

## 🌐 Your Final Live URLs

After completing all steps, fill in your URLs here:

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | `https://_________________.vercel.app` |
| **Backend (Render)** | `https://_________________.onrender.com` |
| **Database (Supabase)** | Supabase project dashboard |

---

> **Important Security Reminder**
> Never share your `.env` file, `DATABASE_URL`, or `JWT_SECRET` with anyone.
> Never commit `.env` to GitHub. The `.gitignore` file prevents this automatically.
