# Samarth Patel — Freelance Developer Site

Personal site for an independent full stack developer. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui-style components, Framer Motion, React Hook Form + Zod and Resend.

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
| `lib/site.ts` | Email, WhatsApp number, Telegram, booking link, domain, stats (`X+` placeholders) |
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
| `CONTACT_TO_EMAIL` | Inbox that receives enquiries (defaults to `site.email`) |

## Deploying to Vercel

Import the repository in Vercel, add the environment variables above, then deploy. Nothing else is needed.

## Structure

```
app/                  routes, metadata, sitemap, robots, OG image, API routes
  api/contact         enquiry form → Resend (with attachment + confirmation email)
  api/estimate        emails the visitor their estimate (recomputed server-side)
  projects/[slug]     statically generated case-study pages
components/sections/  one file per homepage section
components/motion/    Reveal, TextReveal, Magnetic, SpotlightCard
components/ui/        Button, Input, Accordion, Section helpers, icons
lib/                  content, config, validation, estimator logic, email helpers
```
