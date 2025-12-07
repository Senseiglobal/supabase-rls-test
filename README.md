# Aura Manager - Artist Management Platform

This repository contains the Aura Manager application, an AI-powered artist management platform built with React, TypeScript, Supabase, and Vite.

## 🚀 Quick Start

### AuraManager (Main Application)
```bash
cd AuraManager
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm run dev
```

Visit http://localhost:8080

### Environment Variables Required
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

See `AuraManager/.env.example` for complete configuration.

---

## 📋 Recent Changes (November 2025)

### ✅ Critical Bug Fixes
1. **Environment Variables Standardized**: Changed from `VITE_SUPABASE_PUBLISHABLE_KEY` to standard `VITE_SUPABASE_ANON_KEY` (backward compatible)
2. **Configuration Files**: Created `.env.example` with proper variable names
3. **Documentation**: Added comprehensive debugging and cleanup guides

### 📚 New Documentation
- `CLEANUP_GUIDE.md` - Repository cleanup recommendations
- `AuraManager/DEBUG_GUIDE.md` - Debugging and improvement guide
- `AuraManager/.env.example` - Environment configuration template

### ⚠️ Action Required
If you're deploying or developing:
1. Update environment variables to use `VITE_SUPABASE_ANON_KEY`
2. Review `CLEANUP_GUIDE.md` for recommended repository cleanup
3. Follow `AuraManager/DEBUG_GUIDE.md` for testing checklist

---

## 📁 Repository Structure

```
supabase-rls-test/
├── AuraManager/              # Main React application ⭐
│   ├── src/                  # Application source code
│   ├── public/               # Static assets
│   ├── api/                  # API functions
│   ├── supabase/             # Supabase migrations
│   ├── .env.example          # Environment template
│   ├── DEBUG_GUIDE.md        # Debugging guide
│   └── README.md             # App-specific docs
├── frontend-legacy/          # Legacy frontend (consider removing)
├── frontend-new/             # Alternative frontend (consider removing)
├── frontend-new-merged/      # Merged frontend (consider removing)
├── docs/                     # Documentation (see CLEANUP_GUIDE.md)
├── tests/                    # RLS test scripts
├── CLEANUP_GUIDE.md          # Repository cleanup recommendations
└── README.md                 # This file
```

## 🧪 Testing

### Supabase RLS Test Suite

This repository includes Deno scripts to validate Supabase Row-Level Security (RLS) behavior for a sample schema (artists, songs, insights).

Files
- `rls_test.ts` — simple script that signs up a user and runs basic CRUD operations.
- `other_user_test.ts` — script that signs up two users and verifies that one user cannot access another user's artist (read/update/delete blocked by RLS).
- `rls_test_suite.ts` — consolidated automated suite that runs artists + songs + insights tests with retries, assertions, and cleanup.
- `auth_test.ts` / `full_test.ts` — helper scripts used during development.

Prerequisites
- Deno (v1.XX+). Install from https://deno.land/.
- A Supabase project with the expected tables (`artists`, `songs`, `insights`) and RLS policies.

Setup
1. Create a `.env` file in the repository root with:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

2. Ensure your database has the `artists`, `songs`, and `insights` tables. The test suite is conservative about the `songs` insert (uses only `artist_id` and `title`) to avoid schema mismatches.

Run the suite (PowerShell)

```powershell
# from repository root
.\run_tests.ps1
```

Run the suite (manual Deno)

```powershell
# from repository root
deno run --allow-net --allow-env --allow-read rls_test_suite.ts
```

Behavior
- The suite exits with code `0` on success.
- It will exit non-zero on failure and print diagnostics (including DB error objects when inserts fail).

CI suggestion
- Use the exact Deno command above in your CI job and fail the build on non-zero exit code.

## Frontend Application

The repository includes a React frontend demo that showcases the RLS policies in action.

### Frontend Prerequisites
- Node.js 18+ and npm
- Supabase project (same as for testing)

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend` directory:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development
Run the development server:
```bash
npm run dev
```
The app will be available at http://localhost:5173

### Build
Create a production build:
```bash
npm run build
```
The output will be in the `frontend/dist` directory.

## Deployment

This project is configured for automatic deployment to Vercel through GitHub Actions.

### Required Secrets

Add the following secrets to your GitHub repository (Settings → Secrets → Actions):

- `VERCEL_TOKEN`: Your Vercel authentication token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### Environment Variables

In your Vercel project, configure these environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### CI/CD Workflow

The project includes a GitHub Actions workflow that:
1. Runs the RLS test suite to validate policies
2. Builds and deploys the frontend to Vercel on pushes to the main branch

The workflow file is located at `.github/workflows/deploy_vercel.yml`

### Manual Deployment

While automatic deployment is configured, you can also deploy manually:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

## Security Notes

- Never commit `.env` files to the repository
- Use `.env.example` as a template for required environment variables
- Keep your Supabase keys and Vercel tokens secure
- Review the RLS policies before deploying to production