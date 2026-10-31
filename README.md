# ReachInbox – Email Job Scheduler

A full-stack email scheduling platform. Schedule campaigns from a React dashboard, and let background workers deliver them reliably with rate limiting, retries and delivery tracking.

**Stack:** React · TypeScript · Node.js · Express · PostgreSQL · Redis · BullMQ

## Features

- **Campaign scheduling:** upload a CSV of recipients, set subject, body and start time
- **Background processing:** delayed jobs with retries, powered by BullMQ and Redis
- **Rate limiting:** Redis-backed hourly limits, plus a minimum delay between sends; jobs are automatically postponed when the limit is hit
- **Delivery tracking:** email status stored in PostgreSQL, with previews via Ethereal SMTP
- **Slack alerts:** notifications through an Incoming Webhook
- **Dashboard:** view scheduled and sent emails, with search and filtering

## Architecture

```text
React Client ──HTTP──▶ Express API ──▶ PostgreSQL (campaigns, emails)
                           │
                           ▼
                    BullMQ Queue (Redis)
                           │
                           ▼
                    Background Worker ──▶ Ethereal SMTP
                                     └──▶ Slack Webhook
```

## Project Structure

```text
reachinbox-scheduler/
├── client/          # React + TypeScript dashboard (Vite)
└── server/
    └── src/
        ├── config/       # Environment and connections
        ├── controllers/  # Request handlers
        ├── routes/       # API routes
        ├── queues/       # BullMQ queue setup
        ├── workers/      # Email job processors
        ├── services/     # Email, Slack, rate limiting
        └── server.ts     # Entry point
```

## Getting Started

**Prerequisites:** Node.js, npm, PostgreSQL, Redis

```bash
git clone <YOUR_REPOSITORY_URL>
cd reachinbox-scheduler
```

**1. Backend**

```bash
cd server
npm install
npm run dev        # API on http://localhost:5000
```

**2. Worker** (separate terminal)

```bash
cd server
npm run worker
```

**3. Frontend** (separate terminal)

```bash
cd client
npm install
npm run dev        # App on http://localhost:5173
```

### Environment

Create `server/.env` with your PostgreSQL, Redis, Ethereal SMTP and Slack webhook settings. Never commit secrets; keep `.env` in `.gitignore`.

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/emails/schedule` | Schedule a campaign |
| `GET` | `/api/emails?userId=<id>` | Fetch a user's emails |

**Example request**

```json
{
  "userId": "USER_ID",
  "senderId": "SENDER_ID",
  "subject": "Welcome to ReachInbox",
  "body": "This is a scheduled test email.",
  "recipients": ["recipient1@example.com", "recipient2@example.com"],
  "startAt": "2026-11-01T10:00:00.000Z",
  "delayMs": 2000,
  "hourlyLimit": 100
}
```

**Example response**

```json
{
  "success": true,
  "message": "Email campaign scheduled successfully.",
  "data": {
    "campaignId": "campaign-uuid",
    "totalEmails": 2,
    "startAt": "2026-11-01T10:00:00.000Z",
    "delayMs": 2000,
    "hourlyLimit": 100
  }
}
```

## How It Works

1. The user uploads a CSV and configures the campaign in the dashboard.
2. The API validates the request and stores the campaign and email records.
3. Each email is queued as a delayed BullMQ job.
4. The worker checks the rate limit, sends via SMTP, and updates the status.
5. The dashboard reads the latest status from the API.

## Author

**Astha Raut** · [GitHub](https://github.com/AsthaRaut)