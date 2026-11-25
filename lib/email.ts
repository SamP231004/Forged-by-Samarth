import "server-only";
import nodemailer from "nodemailer";
import { site } from "./site";
import { escapeHtml } from "./utils";

const user = process.env.GMAIL_USER ?? site.email;
// Google displays app passwords in groups of four; the spaces aren't part of them.
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

// Fail well before a serverless function times out.
const transport = pass
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  : null;

type Attachment = { filename: string; content: Buffer };

/**
 * Sends an email through Gmail. Without an app password, emails are logged in
 * development and rejected in production so failures are never silent.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Attachment[];
}) {
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev] To: ${opts.to} | Subject: ${opts.subject}`);
      return;
    }
    throw new Error("Email is not configured. Set GMAIL_APP_PASSWORD.");
  }
  await transport.sendMail({ from: { name: site.name, address: user }, ...opts });
}

export const ownerInbox = process.env.CONTACT_TO_EMAIL ?? site.email;

/** Minimal, client-safe email layout. */
export function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:32px">
  <tr><td>
    <div style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:8px;background:#18181b;color:#fff;font-size:12px;font-weight:600">SP</div>
    <h1 style="font-size:20px;letter-spacing:-0.02em;margin:24px 0 8px">${escapeHtml(title)}</h1>
    ${body}
    <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a">${escapeHtml(site.name)} · ${escapeHtml(site.role)} · <a href="${site.url}" style="color:#71717a">${site.url.replace(/^https?:\/\//, "")}</a></p>
  </td></tr></table></td></tr></table></body></html>`;
}

export function row(label: string, value: string) {
  return `<tr><td style="padding:8px 0;color:#71717a;font-size:13px;width:140px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;font-size:14px">${escapeHtml(value)}</td></tr>`;
}
