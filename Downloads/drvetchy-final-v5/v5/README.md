# DR VETCHY Store

## Run locally

```bash
npm install
npm run dev:all
```

The store runs on Vite and the email API runs in the same project on port 3001. The Vite dev server proxies `/api` requests to it.

## Admin

`/admin`

Email: `admin@drvetchy.com`
Password: `Admin@123`

Change these values in `src/main.jsx` before production.

## Email setup

Automatic owner email is prepared through Resend. Copy `.env.example` to `.env` and set:

- `RESEND_API_KEY`
- `MAIL_FROM` (a sender/domain verified with Resend)
- `OWNER_EMAIL` (defaults to samahsalah2555@gmail.com)

If the email service is not configured, checkout falls back to a prefilled `mailto:` message.

## Admin sections

- Overview
- Products
- Orders
- Content & Logo
- Message Templates
- Settings

WhatsApp owner number is configured in `src/main.jsx` as `201004283651`.
