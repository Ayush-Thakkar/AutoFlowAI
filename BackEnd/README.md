# AutoFlow AI backend

An Express and MongoDB API for workflow CRUD, organized with a simple MVC structure. Active workflows can also send a one-time email reminder when their scheduled time arrives.

## MVC structure

- `models/Workflow.js` defines the MongoDB workflow record.
- `controllers/workflowController.js` handles request validation and CRUD operations.
- `routes/workflowRoutes.js` maps API paths to controller functions.
- `services/emailService.js` sends reminder emails through SMTP.
- `jobs/workflowReminderJob.js` checks for due reminders once per minute.
- `server.js` connects to MongoDB, mounts routes, and starts the reminder job.

## Requirements and setup

You need Node.js, MongoDB (local or Atlas), and SMTP credentials to send emails. SMTP is optional; CRUD still works without it.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` to your local MongoDB URL or Atlas connection string.
4. To enable email, fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`. `EMAIL_FROM` is optional and defaults to `SMTP_USER`. Keep credentials private in `.env`.
5. Start the API with `npm run dev`. It listens at `http://localhost:5000`.

The scheduler checks every minute by default. Set `EMAIL_CHECK_INTERVAL_MS` to change the interval (minimum 5 seconds). The process must remain running for reminders to be sent. If SMTP is not configured, the API starts normally and logs that reminders are off.

## Workflow fields

- `name`: required, up to 100 characters.
- `description`: optional, up to 500 characters.
- `status`: `Active` or `Paused`, defaults to `Active`.
- `triggerAt`: optional date/time for a reminder.
- `notificationEmail`: recipient for the reminder. Set it together with `triggerAt`, or leave both blank.
- `emailSentAt`: set by the server after a reminder is sent.

Only Active workflows send reminders. Paused workflows wait until activated. A reminder is sent once; changing its time or recipient resets its sent state.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/workflows` | Create a workflow |
| `GET` | `/api/workflows` | List workflows |
| `GET` | `/api/workflows/:id` | Get one workflow |
| `PUT` | `/api/workflows/:id` | Update a workflow |
| `DELETE` | `/api/workflows/:id` | Delete a workflow |

Example body for a scheduled reminder:

```json
{
  "name": "Submit weekly report",
  "description": "Prepare and send the team report.",
  "status": "Active",
  "triggerAt": "2026-10-20T10:00:00.000Z",
  "notificationEmail": "you@example.com"
}
```

The React frontend is in the sibling `FrontEnd/` folder. Start it in a second terminal using `npm install` and `npm run dev`; its setup notes are in `FrontEnd/README.md`.
