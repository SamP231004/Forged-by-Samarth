export type Conversation = {
  id: string;
  client_id: string;
  client_email: string;
  client_name: string | null;
  created_at: string;
  last_message_at: string;
  last_message_preview: string | null;
  last_sender_id: string | null;
  client_last_read_at: string;
  admin_last_read_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_id: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  attachment_type: string | null;
  created_at: string;
};

export const MAX_MESSAGE_LENGTH = 5000;

/** Uploads go through a Vercel function, whose request body limit is 4.5 MB. */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

/** Name typed on the login form, picked up when the conversation is first created. */
export const PENDING_NAME_COOKIE = "chat-name";

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next: string | null | undefined, fallback = "/chat") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

export const displayName = (c: Pick<Conversation, "client_name" | "client_email">) =>
  c.client_name || c.client_email.split("@")[0];

export const byCreatedAt = (a: Message, b: Message) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
