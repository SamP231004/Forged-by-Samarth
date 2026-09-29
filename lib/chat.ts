export const ATTACHMENT_BUCKET = "chat-attachments";

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
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  attachment_type: string | null;
  created_at: string;
};

export const MAX_MESSAGE_LENGTH = 5000;

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next: string | null | undefined, fallback = "/chat") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

export const displayName = (c: Pick<Conversation, "client_name" | "client_email">) =>
  c.client_name || c.client_email.split("@")[0];
