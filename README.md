# secure-client-intake-form

> A production-minded, multi-step client intake form built for service-based businesses — demonstrating modern frontend architecture, form validation, and security-aware design.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Live Demo

🔗 **[View live demo →](#)** _(deploy link goes here — e.g. Vercel)_

---

## Screenshot

> _Screenshot placeholder — add after first deployment_

---

## Why I Built This

Real service businesses — home care agencies, cleaning companies, legal intake offices — regularly need intake forms that are:

- **Trustworthy** in appearance (clients are sharing sensitive information)
- **Validated rigorously** on both client and server
- **Bot-resistant** in production (Turnstile, rate limiting)
- **Maintainable** by a small team without a heavy backend

Most tutorials cover basic form validation. This project goes further — it models what a production-ready intake form looks like: multi-step flow, per-step validation, security-conscious API design, and clear extension points for real persistence and notifications.

---

## Features

- **5-step multi-section form** — About You, About the Client, Service Needs, Payment & Coverage, Review & Submit
- **Per-step validation** — only validates fields for the current step before advancing; no confusing pre-emptive errors
- **Dual-layer validation** — Zod schema is shared between the React Hook Form resolver (client) and the API route (server)
- **Progress indicator** — step tracker with completion states, responsive for mobile
- **Loading, success, and error states** — each with appropriate feedback and recovery paths
- **Fake backend route** with full TODO scaffolding for database, email, and CRM integration
- **Rate limiting** — in-memory sliding window; designed to be swapped for Redis
- **Cloudflare Turnstile ready** — placeholder `verifyTurnstileToken()` wired into the API route
- **Security response headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy via `next.config.ts`
- **Privacy warning** — visible near sensitive fields warning against entering real data
- **Fully typed** — strict TypeScript throughout; no `any`, no type assertions
- **Mobile-first** — works cleanly on any screen width

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | RSC + API routes in one project |
| Language | TypeScript (strict) | Catch shape errors at compile time |
| Styling | Tailwind CSS | Fast, consistent, utility-first |
| Forms | React Hook Form | Minimal re-renders, excellent DX |
| Validation | Zod | Single schema shared client + server |
| Bot protection | Cloudflare Turnstile (ready) | Privacy-first CAPTCHA alternative |

---

## Security Considerations

This project is built with a security-first mindset. Here's how each concern is addressed:

### Input Validation

All form submissions are validated **twice**:

1. **Client-side** via React Hook Form + Zod resolver — provides instant feedback without a server round-trip
2. **Server-side** in the API route — the client is never trusted; every submission is re-validated against the same Zod schema before any processing occurs

Server-side validation is mandatory. A motivated attacker can bypass client-side JavaScript entirely and POST directly to `/api/intake`.

### Data Minimization

The form intentionally avoids collecting:
- Full street addresses (asks for city, county, and general area only)
- Diagnosis codes, medications, or specific medical history
- Insurance policy numbers or financial account details

This limits exposure if a data breach were to occur.

### Rate Limiting

`src/lib/security/rate-limit.ts` implements a sliding-window rate limiter keyed on the requester's IP address. It:
- Allows 5 requests per 60-second window per IP
- Returns `429 Too Many Requests` with a `Retry-After` header when exceeded
- In the current demo uses an in-memory Map (resets on restart, single-instance only)

**Production swap**: Replace with Upstash Redis + `@upstash/ratelimit` for distributed, persistent rate limiting.

### Bot Protection (Cloudflare Turnstile)

`src/lib/security/turnstile.ts` provides `verifyTurnstileToken()`. In production:

1. Add the Turnstile widget script to the form page
2. Pass the generated token in the POST body
3. Uncomment the verification block in the API route
4. Set `TURNSTILE_SECRET_KEY` in your environment

Turnstile is privacy-respecting — it does not use tracking cookies and does not require users to solve visual puzzles.

### Security Headers

`next.config.ts` sets the following headers on every response:

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restrict browser APIs |

### PII Logging Policy

The API route logs only a safe summary (county, service type, priority, timestamp) — never the full payload containing names, phone numbers, or email addresses.

---

## How Validation Works

The Zod schema in `src/lib/schemas/intake-schema.ts` is the single source of truth.

- Each form step has its own sub-schema (`aboutYouSchema`, `aboutClientSchema`, etc.)
- All sub-schemas are merged into `intakeFormSchema` for final submission validation
- `stepSchemas` array maps each step index to its sub-schema for per-step client validation
- The API route imports and applies `intakeFormSchema` independently — it does not trust the client

Key validation rules:
- Phone: minimum 7 characters, regex-validated format
- Email: native Zod email format, lowercased before storage
- Notes: max 500–1,000 characters depending on field
- Start date: cannot be more than 90 days in the past
- Client age: must be between 1 and 120
- Consent: must be explicitly checked (`true`) — `false` is a validation error

---

## Turnstile Integration Notes

To enable real bot protection:

1. Create a Turnstile site at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up?to=/:account/turnstile)
2. Copy your site key and secret key into `.env.local`
3. Add the Turnstile widget to `IntakeForm.tsx`:
   ```tsx
   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
   <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
   ```
4. Capture the token in `onSubmit` and include it in the POST body
5. Uncomment the verification block in `src/app/api/intake/route.ts`

---

## Rate Limiting Notes

The current in-memory implementation is intentionally simple for demo purposes. For production:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});
```

Then replace `checkRateLimit()` calls in the API route with `ratelimit.limit(key)`.

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/secure-client-intake-form.git
cd secure-client-intake-form

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Leave the keys blank for local dev — Turnstile verification is skipped when no key is set

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the form.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | Production only | Cloudflare Turnstile secret key (server-side) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Production only | Cloudflare Turnstile site key (client-side) |
| `ADMIN_NOTIFICATION_EMAIL` | Production only | Where to send new submission alerts |

Never commit `.env.local`. The `.gitignore` excludes it by default.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # Page shell, header, form card
│   ├── globals.css             # Tailwind base + custom utilities
│   └── api/
│       └── intake/
│           └── route.ts        # POST handler with validation, rate limiting
├── components/
│   ├── intake/
│   │   ├── IntakeForm.tsx      # Multi-step form (all 5 steps)
│   │   ├── ProgressIndicator.tsx
│   │   ├── SuccessState.tsx
│   │   └── ErrorState.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Label.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       └── Checkbox.tsx
└── lib/
    ├── schemas/
    │   └── intake-schema.ts    # Zod schema — client + server source of truth
    ├── security/
    │   ├── rate-limit.ts       # Sliding-window rate limiter
    │   └── turnstile.ts        # Cloudflare Turnstile verifier
    └── utils.ts                # Shared helpers (cn, formatDate, etc.)
```

---

## Future Improvements

These are the natural next steps for a production deployment:

- **Database persistence** — store submissions in Supabase or Firebase; encrypt PII at rest
- **Email notifications** — use [Resend](https://resend.com) to notify staff of new submissions
- **Admin dashboard** — view, filter, and export submissions; mark as contacted
- **File uploads** — attach supporting documents (POA, insurance card) with strict MIME validation and virus scanning
- **Audit logging** — record who viewed or modified each record
- **Staff authentication** — protect the admin dashboard with NextAuth or Clerk
- **Real Turnstile integration** — swap in live keys; add invisible mode for low-friction UX
- **Redis-backed rate limiting** — use Upstash for distributed, persistent rate limits
- **End-to-end tests** — Playwright tests covering the full submission flow and error states
- **Accessibility audit** — axe-core + manual screen reader testing

---

## License

MIT — free to use, fork, and adapt. Attribution appreciated but not required.

---

_Built by Alex Brown · [GitHub](https://github.com/yourusername) · Portfolio project_
