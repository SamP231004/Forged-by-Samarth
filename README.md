# Samarth Patel — Freelance Developer Site

Personal site for an independent software developer. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui-style components, Framer Motion, React Hook Form + Zod, Resend, MongoDB and Better Auth.

Everything is message-first — there are no calls. Clients reach out through the on-site chat (sign in with email), the contact form, email or WhatsApp, and scope, pricing and the contract are agreed in writing.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Without `RESEND_API_KEY`, the contact form and estimator log emails to the console in development. In production they return an error until the key is set.

## Make it yours

Everything editable lives in `lib/`:

| File | What to change |
| --- | --- |
| `lib/site.ts` | Email, phone/WhatsApp number, domain, stats (`X+` placeholders) |
| `lib/content.ts` | Services, process, reasons, tech stack, testimonials (shown once `approved`), pricing "from" amounts, FAQ |
| `lib/projects.ts` | Case studies: timelines, outcomes, live/GitHub links (marked `TODO`) |
| `lib/estimator.ts` | Base prices, add-on costs and timeline multipliers for the estimator |

**Portrait:** save your photo as `public/samarth.jpg` (or `.png` / `.webp`). The About card picks it up at build time and otherwise shows an "SP" monogram.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and OpenGraph |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Samarth Patel <hello@yourdomain.com>` |
| `CONTACT_TO_EMAIL` | Inbox that receives enquiries and chat notifications (defaults to `site.email`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | Database name (defaults to `forge`) |
| `BETTER_AUTH_SECRET` | Random secret for signing sessions (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | The site's URL; `http://localhost:3000` locally (defaults to `NEXT_PUBLIC_SITE_URL`) |
| `ADMIN_EMAILS` | Comma-separated emails that get the inbox (defaults to `site.email`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app |

## On-site chat (MongoDB + Better Auth)

Clients sign in with Google, GitHub, or a link / 6-digit code sent by email and get a private, persistent thread with you at `/chat`. You reply from `/inbox`. Auth is handled by [Better Auth](https://www.better-auth.com); users, sessions, conversations and messages live in MongoDB, and attachments (up to 4 MB) in GridFS. Every read and write goes through API routes that check the signed-in user can see the conversation. Open threads poll for new messages every few seconds, and the other side gets an email via Resend if they aren't looking at the thread (at most once every 10 minutes).

Without `MONGODB_URI` and `BETTER_AUTH_SECRET` the site still builds; the chat pages show a "coming soon" notice.

**Setup**

1. Create a free MongoDB Atlas cluster (M0 clusters don't pause when idle). Under **Network Access** allow `0.0.0.0/0` (Vercel has no fixed IPs), create a database user, and copy the connection string into `MONGODB_URI`. Collections and indexes are created automatically.
2. Set `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL=http://localhost:3000` for local development.
   - **Google:** in Google Cloud Console create an OAuth client (type *Web application*) with the authorised redirect URIs `https://forged-by-samarth.vercel.app/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google`.
   - **GitHub:** at github.com → Settings → Developer settings → OAuth Apps, create an app with the homepage `https://forged-by-samarth.vercel.app` and callback URL `https://forged-by-samarth.vercel.app/api/auth/callback/github` (GitHub allows one callback per app, so make a second app for localhost if you need it).
3. Sign-in codes are sent through Resend, so `RESEND_API_KEY` and `RESEND_FROM_EMAIL` must be set (without them, codes are only logged to the console in development).
4. Sign in at `/login` with an address listed in `ADMIN_EMAILS` (it must be verified, which all three sign-in methods guarantee). From then on `/chat` redirects you to `/inbox`.

## Deploying to Vercel

Import the repository in Vercel, add the environment variables above, then deploy. Nothing else is needed.

## Structure

```
app/                  routes, metadata, sitemap, robots, OG image, API routes
  api/contact         enquiry form → Resend (with attachment + confirmation email)
  api/estimate        emails the visitor their estimate (recomputed server-side)
  api/auth/[...all]   Better Auth (OAuth callbacks, email codes, sessions)
  api/chat/*          send/poll messages, inbox list, attachment downloads
  login, auth/signout email-code / OAuth sign-in and sign-out
  chat, inbox         client conversation and your inbox
  projects/[slug]     statically generated case-study pages
components/sections/  one file per homepage section
components/motion/    Reveal, TextReveal, Magnetic, SpotlightCard
components/chat/      chat thread, inbox, login form
components/ui/        Button, Input, Accordion, Section helpers, icons
lib/                  content, config, validation, estimator logic, email helpers
lib/auth.ts           Better Auth config and getViewer()
lib/chat-store.ts     MongoDB queries for conversations, messages and attachments
```
