import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { headers } from "next/headers";
import { layout, sendEmail } from "./email";
import { db, mongoClient, mongoUri } from "./mongo";
import { site } from "./site";

/** Chat is switched off (with a friendly notice) until MongoDB and auth are configured. */
export const chatEnabled = Boolean(mongoUri && process.env.BETTER_AUTH_SECRET);

const appUrl = (process.env.BETTER_AUTH_URL || site.url).replace(/\/+$/, "");

/** Verified emails that get the inbox instead of a client thread. */
const adminEmails = (process.env.ADMIN_EMAILS || site.email)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const google = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
const github = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;

/** OAuth providers with credentials set; the login form only shows these. */
export const oauthProviders = [google && "google", github && "github"].filter(Boolean) as ("google" | "github")[];

export const auth = betterAuth({
  baseURL: appUrl,
  database: mongodbAdapter(db, { client: mongoClient }),
  // Stored in MongoDB so limits hold across serverless instances.
  rateLimit: { storage: "database" },
  socialProviders: {
    ...(google && { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } }),
    ...(github && { github: { clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! } }),
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        const link = `${appUrl}/login?email=${encodeURIComponent(email)}&code=${otp}`;
        await sendEmail({
          to: email,
          subject: `Your sign-in code: ${otp}`,
          html: layout(
            "Sign in to chat",
            `<p style="font-size:14px;line-height:1.6">Use this code to sign in. It expires in 10 minutes.</p>
            <p style="font-family:ui-monospace,Menlo,monospace;font-size:28px;letter-spacing:0.3em;margin:16px 0">${otp}</p>
            <p style="margin:24px 0 0"><a href="${link}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px">Sign in</a></p>
            <p style="font-size:12px;color:#71717a;margin-top:16px">If you didn't ask for this, you can ignore this email.</p>`,
          ),
        });
      },
    }),
    nextCookies(),
  ],
});

export type Viewer = { id: string; email: string; name: string; isAdmin: boolean };

/** The signed-in user for the current request, or null. */
export async function getViewer(): Promise<Viewer | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.emailVerified && adminEmails.includes(user.email.toLowerCase()),
  };
}
