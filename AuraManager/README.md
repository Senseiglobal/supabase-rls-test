# Branding & Logo Integration

The application now uses a unified `BrandLogo` React component for consistent branding across dark and light modes.

## Component Usage

`BrandLogo` lives at `src/components/BrandLogo.tsx` and supports props:

- `size` (number): pixel height/width (square graphic)
- `showText` (boolean): whether to render the wordmark lockup “AuraManager”
- `className` (string): tailwind utility classes
- `aria-label` (string): accessibility label if needed

Example:

```tsx
import BrandLogo from '@/components/BrandLogo';

export const HeaderLogo = () => (
	<BrandLogo size={40} showText aria-label="AuraManager" />
);
```

## Theming

The logo gradient automatically adapts using Tailwind's `dark:` variants. No manual prop for theme is needed—ensure `<ThemeProvider>` wraps the app (already configured).

## Replacement Coverage

Replaced textual brand renderings in:
- `Header.tsx`
- `AppSidebar.tsx` (expanded + collapsed states)
- `App.tsx` sticky top bar

For mobile bottom navigation we retained functional section labels. Add `<BrandLogo />` to `BottomNav.tsx` if a brand anchor is desired there.

## Future Enhancements

- Provide multi-resolution favicon & PWA icons aligned to the glyph.
- Add animated variant for loading states (e.g., subtle pulse of gradient).
- Export a monochrome fallback for print/export contexts.

## Connectivity Verification Summary

- Supabase client points to env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (project: cpylmxhrobrhqettudjg).
- `vercel.json` present with SPA rewrites.
- GitHub Actions workflows (`vercel-production.yml`, `vercel-preview.yml`) ready—ensure repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are configured.

If any OAuth providers appear misconfigured, re-run the in-app diagnostic panels under `/account`.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/52298726-2b39-4d09-81d1-2dbfb0a6dcf5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/52298726-2b39-4d09-81d1-2dbfb0a6dcf5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/52298726-2b39-4d09-81d1-2dbfb0a6dcf5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
