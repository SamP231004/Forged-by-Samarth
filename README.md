# Samarth Patel — Freelance Developer Site

Personal site for an independent full stack developer. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui-style components, Framer Motion, React Hook Form + Zod, Resend and Supabase.

Everything is message-first — there are no calls. Clients reach out through the on-site chat (sign in with email), the contact form, email, WhatsApp or Telegram, and scope, pricing and the contract are agreed in writing.

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
| `lib/site.ts` | Email, WhatsApp number, Telegram, domain, stats (`X+` placeholders) |
| `lib/content.ts` | Services, process, reasons, tech stack, **testimonials (placeholders)**, pricing "from" amounts, FAQ |
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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (or legacy anon) key |

## On-site chat (Supabase)

Clients sign in with Google, GitHub, or a magic link / 6-digit email code and get a private, persistent thread with you at `/chat`. You reply from `/inbox`. Messages are stored in Postgres, attachments in a private Storage bucket, and both are locked down with row level security. New messages arrive live (Supabase Realtime), and the other side gets an email via Resend if they haven't read the message (at most once every 10 minutes).

Without the Supabase variables the site still builds; the chat pages show a "coming soon" notice.

**Setup**

1. Create a Supabase project and add the two `NEXT_PUBLIC_SUPABASE_*` variables.
2. Run the files in [`supabase/migrations/`](supabase/migrations/) in order in the SQL editor. They create the tables, policies, realtime publication and the `chat-attachments` bucket.
3. **Authentication → URL Configuration:** set the Site URL to `https://forged-by-samarth.vercel.app` and add `https://forged-by-samarth.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` to the redirect URLs.
   - **Google:** in Google Cloud Console create an OAuth client (type *Web application*) with the authorised redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, then paste the client ID and secret into **Authentication → Sign In / Providers → Google**.
   - **GitHub:** at github.com → Settings → Developer settings → OAuth Apps, create an app with the homepage `https://forged-by-samarth.vercel.app` and callback URL `https://<project-ref>.supabase.co/auth/v1/callback`, then paste its client ID and a client secret into **Authentication → Sign In / Providers → GitHub**.
4. **Authentication → Emails → Magic Link template:** add `{{ .Token }}` so people who open the email on another device can type the code instead.
5. **Authentication → SMTP:** plug in Resend's SMTP details. Supabase's built-in mailer is heavily rate limited.
6. Sign in once at `/login` with your own email, then make yourself the admin:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@yourdomain.com';
   ```

   From then on `/chat` redirects you to `/inbox`.

## Deploying to Vercel

Import the repository in Vercel, add the environment variables above, then deploy. Nothing else is needed.

## Structure

```
app/                  routes, metadata, sitemap, robots, OG image, API routes
  api/contact         enquiry form → Resend (with attachment + confirmation email)
  api/estimate        emails the visitor their estimate (recomputed server-side)
  api/chat/notify     emails the other side about a new chat message (throttled in the DB)
  login, auth/*       magic-link / email-code sign-in and sign-out
  chat, inbox         client conversation and your inbox
  projects/[slug]     statically generated case-study pages
components/sections/  one file per homepage section
components/motion/    Reveal, TextReveal, Magnetic, SpotlightCard
components/chat/      chat thread, inbox, login form
components/ui/        Button, Input, Accordion, Section helpers, icons
lib/                  content, config, validation, estimator logic, email helpers
lib/supabase/         browser, server and middleware clients
supabase/migrations/  database schema, RLS policies and storage bucket
```
