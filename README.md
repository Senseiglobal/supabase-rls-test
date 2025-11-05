# Supabase RLS Test Suite

This repository contains small Deno scripts to validate Supabase Row-Level Security (RLS) behavior for a sample schema (artists, songs, insights).

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

If you want, I can also add a GitHub Actions workflow that runs the suite in CI. 