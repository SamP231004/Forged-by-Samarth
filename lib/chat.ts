export const PROJECT_STATUSES = ["discovery", "proposal", "in_progress", "review", "completed", "on_hold"] as const;
export const CONTRACT_STATUSES = ["none", "drafting", "sent", "signed"] as const;
export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "AED", "SGD"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export type Currency = (typeof CURRENCIES)[number];

export const projectStatusLabel: Record<ProjectStatus, string> = {
  discovery: "Discovery",
  proposal: "Proposal",
  in_progress: "In progress",
  review: "In review",
  completed: "Completed",
  on_hold: "On hold",
};

export const contractStatusLabel: Record<ContractStatus, string> = {
  none: "Not started",
  drafting: "Being drafted",
  sent: "Awaiting signature",
  signed: "Signed",
};

export type Milestone = {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  due_date: string | null;
  amount: number | null;
  done: boolean;
};

/** The project summary pinned beside a conversation. Set by the admin, visible to both sides. */
export type Project = {
  title: string;
  status: ProjectStatus;
  /** YYYY-MM-DD */
  start_date: string | null;
  /** YYYY-MM-DD */
  due_date: string | null;
  currency: Currency;
  total_amount: number;
  amount_paid: number;
  contract_status: ContractStatus;
  /** An https link, or one of this conversation's attachments. */
  contract_url: string | null;
  /** YYYY-MM-DD */
  contract_signed_on: string | null;
  next_step: string;
  milestones: Milestone[];
  updated_at: string;
};

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
  project: Project | null;
};

export type Reaction = { user_id: string; emoji: string };

/** A snapshot of the message being replied to, taken when the reply is sent. */
export type ReplyRef = {
  id: string;
  sender_id: string;
  body: string;
  attachment_name: string | null;
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
  reply_to: ReplyRef | null;
  reactions: Reaction[];
  edited_at: string | null;
  created_at: string;
  /** Bumped on every edit or reaction so polling picks up the change. */
  updated_at: string;
};

/** What a thread poll returns besides the messages themselves. */
export type ThreadSync = {
  messages: Message[];
  /** When the other side last had the thread open, for read receipts. */
  peerLastReadAt: string;
  project: Project | null;
};

export const MAX_MESSAGE_LENGTH = 5000;

/** Uploads go through a Vercel function, whose request body limit is 4.5 MB. */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

/** Senders can fix a text message for this long after sending it. */
export const EDIT_WINDOW_MS = 2 * 60_000;

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "🙏", "🔥"];
export const MORE_REACTIONS = ["🎉", "👏", "💯", "✅", "👀", "🤔", "😍", "🙌", "💪", "🚀", "😅", "😢", "👌", "⭐", "🤝", "⚡", "😊", "🙂"];
export const ALLOWED_REACTIONS = new Set([...QUICK_REACTIONS, ...MORE_REACTIONS]);

/** Name typed on the login form, picked up when the conversation is first created. */
export const PENDING_NAME_COOKIE = "chat-name";

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next: string | null | undefined, fallback = "/chat") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

export const displayName = (c: Pick<Conversation, "client_name" | "client_email">) =>
  c.client_name || c.client_email.split("@")[0];

export const byCreatedAt = (a: Message, b: Message) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);

export const canEdit = (m: Message, userId: string, now = Date.now()) =>
  m.sender_id === userId && !!m.body && now - new Date(m.created_at).getTime() < EDIT_WINDOW_MS;

/** A short one-line summary of a message, for reply quotes and previews. */
export const excerpt = (m: { body: string; attachment_name: string | null }, max = 140) =>
  (m.body || (m.attachment_name ? `📎 ${m.attachment_name}` : "")).replace(/\s+/g, " ").slice(0, max);

export const fileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
