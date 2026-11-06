# AutoFlow AI frontend

React and Vite dashboard for creating, listing, searching, filtering, editing, and deleting workflows. This version manages workflow records; it does not generate or execute automations.

You can schedule a one-time email reminder for an Active workflow by entering a due time and recipient address. Sending requires SMTP settings in `BackEnd/.env`; see the backend README.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. The default API URL is `http://localhost:5000/api`.
3. Start the backend and MongoDB by following `../BackEnd/README.md`.
4. Run `npm run dev` and open the Vite URL printed in the terminal.

Use `npm run build` to create a production build and `npm run lint` to check the frontend source.
