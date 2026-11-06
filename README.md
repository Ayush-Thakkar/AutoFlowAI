# AutoFlowAI

AutoFlowAI is a small full-stack workflow manager. The React and Vite frontend uses an Express API to create, view, edit, and delete workflow records stored in MongoDB. Workflows can also have an optional email reminder when SMTP is configured.

## Project structure

```text
AutoFlowAI/
├── FrontEnd/   React + Vite application
└── BackEnd/    Express API + MongoDB model
```

## Run locally

Requirements: Node.js, npm, and a MongoDB database (local MongoDB or MongoDB Atlas).

1. Install backend dependencies and configure the database:

   ```powershell
   cd BackEnd
   npm install
   Copy-Item .env.example .env
   ```

   Set `MONGODB_URI` in `BackEnd/.env`. SMTP settings are optional; add them only if you want reminder emails to send.

2. Start the API in one terminal:

   ```powershell
   cd BackEnd
   npm run dev
   ```

   The API listens on `http://localhost:5000` and workflow routes are under `/api/workflows`.

3. Install and start the frontend in a second terminal:

   ```powershell
   cd FrontEnd
   npm install
   Copy-Item .env.example .env
   npm run dev
   ```

   Open the local URL printed by Vite. `VITE_API_URL` defaults to `http://localhost:5000/api`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/workflows` | Create a workflow |
| `GET` | `/api/workflows` | List workflows |
| `GET` | `/api/workflows/:id` | Get one workflow |
| `PUT` | `/api/workflows/:id` | Update a workflow |
| `DELETE` | `/api/workflows/:id` | Delete a workflow |

## Notes

- Never commit `.env` files, database credentials, or SMTP passwords. The `.env.example` files contain placeholders only.
- Authentication and per-user workflow access are not implemented yet. Do not put private data in a public deployment until access control is added.
- `Video.mp4` is a large local demo recording and is intentionally excluded from Git.
