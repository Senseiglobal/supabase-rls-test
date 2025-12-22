# Codespace Quick Start

1. Click **Code → Create codespace on main** in GitHub.
2. The devcontainer will:
   - Use Node 20
   - Install dependencies automatically in `AuraManager` via `npm install`
   - Forward port 5173 and auto-open the Vite dev server in your browser
3. After the codespace is ready:
   ```bash
   cd AuraManager
   npm run dev
   ```
   The forwarded port (5173) will open in a browser tab.

Notes:
- Workspace folder is `/workspaces/supabase-rls-test`.
- If install fails, rerun `npm install` in `AuraManager`.
