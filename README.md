
# Sales CRM Starter (HubSpot‑lite)

A minimal full‑stack CRM you can run locally with VS Code. It includes:
- **Node/Express API** with **SQLite** (via better‑sqlite3)
- **Vite + React** client
- Contacts list and a Kanban‑style Deals board with pipeline stages

## Prereqs
- Node.js 18+ and npm

## Setup

```bash
cd server
npm install
npm run seed     # creates DB, seeds pipeline/stages + demo data
npm run dev      # starts API at http://localhost:4000
```

In a second terminal:

```bash
cd client
npm install
npm run dev      # starts web app at http://localhost:5173 (proxies /api to 4000)
```

Open http://localhost:5173 in your browser.

## Notes
- The server creates `data.sqlite` on first run.
- Modify `server/src/schema.sql` and re‐run `npm run reset` to rebuild.
- This is an MVP skeleton; extend with auth, users/teams, email/calls, etc.
