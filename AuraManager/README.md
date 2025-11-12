# AuraManager

This is the main codebase for the Aura Manager project. All source code, configuration, and assets should reside in this directory for Vercel deployment.

## Structure
- `src/` — React app source code
- `api/` — Vercel serverless functions
- `public/` — Static assets

## Setup
- Ensure all imports use the `@/` alias as per `tsconfig.json`.
- Tailwind CSS and PostCSS must be configured for styling.
- All environment variables should be set in `.env.local` and Vercel dashboard.

## Deployment
- Deploy this directory as the root in Vercel.
- Staging and production workflows are supported.
