import "server-only";
import { GridFSBucket, ObjectId } from "mongodb";
import type { Viewer } from "./auth";
import type { Conversation, Message } from "./chat";
import { db } from "./mongo";

type ConversationDoc = {
  _id: ObjectId;
  client_id: string;
  client_email: string;
  client_name: string | null;
  created_at: Date;
  last_message_at: Date;
  last_message_preview: string | null;
  last_sender_id: string | null;
  client_last_read_at: Date;
  admin_last_read_at: Date;
  client_notified_at: Date | null;
  owner_notified_at: Date | null;
};

type MessageDoc = {
  _id: ObjectId;
  conversation_id: ObjectId;
  sender_id: string;
  body: string;
  attachment_id: ObjectId | null;
  attachment_name: string | null;
  attachment_size: number | null;
  attachment_type: string | null;
  created_at: Date;
};

type AttachmentMeta = { conversation_id: ObjectId; content_type: string; uploaded_by: string };

const conversations = db.collection<ConversationDoc>("conversations");
const messages = db.collection<MessageDoc>("messages");
const attachments = new GridFSBucket(db, { bucketName: "attachments" });

let indexes: Promise<unknown> | undefined;
/** Creates indexes once per server instance (a no-op when they already exist). */
function ready() {
  indexes ??= Promise.all([
    conversations.createIndex({ client_id: 1 }, { unique: true }),
    conversations.createIndex({ last_message_at: -1 }),
    messages.createIndex({ conversation_id: 1, created_at: 1 }),
  ]).catch((e) => {
    indexes = undefined;
    throw e;
  });
  return indexes;
}

const toConversation = (c: ConversationDoc): Conversation => ({
  id: c._id.toHexString(),
  client_id: c.client_id,
  client_email: c.client_email,
  client_name: c.client_name,
  created_at: c.created_at.toISOString(),
  last_message_at: c.last_message_at.toISOString(),
  last_message_preview: c.last_message_preview,
  last_sender_id: c.last_sender_id,
  client_last_read_at: c.client_last_read_at.toISOString(),
  admin_last_read_at: c.admin_last_read_at.toISOString(),
});

const toMessage = (m: MessageDoc): Message => ({
  id: m._id.toHexString(),
  conversation_id: m.conversation_id.toHexString(),
  sender_id: m.sender_id,
  body: m.body,
  attachment_id: m.attachment_id?.toHexString() ?? null,
  attachment_name: m.attachment_name,
  attachment_size: m.attachment_size,
  attachment_type: m.attachment_type,
  created_at: m.created_at.toISOString(),
});

const oid = (id: string) => (ObjectId.isValid(id) && /^[0-9a-f]{24}$/i.test(id) ? new ObjectId(id) : null);

/** The conversation if the viewer is its client or an admin, otherwise null. */
export async function getConversation(viewer: Viewer, id: string) {
  const _id = oid(id);
  if (!_id) return null;
  await ready();
  const doc = await conversations.findOne(viewer.isAdmin ? { _id } : { _id, client_id: viewer.id });
  return doc ? toConversation(doc) : null;
}

/** Returns the client's conversation, creating it on their first visit. */
export async function ensureConversation(viewer: Viewer, pendingName?: string) {
  await ready();
  const now = new Date();
  const doc = await conversations.findOneAndUpdate(
    { client_id: viewer.id },
    {
      $setOnInsert: {
        client_email: viewer.email,
        client_name: viewer.name.trim() || pendingName?.trim().slice(0, 100) || null,
        created_at: now,
        last_message_at: now,
        last_message_preview: null,
        last_sender_id: null,
        client_last_read_at: now,
        admin_last_read_at: new Date(0),
        client_notified_at: null,
        owner_notified_at: null,
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  return toConversation(doc!);
}

export async function listConversations() {
  await ready();
  const docs = await conversations.find().sort({ last_message_at: -1 }).limit(200).toArray();
  return docs.map(toConversation);
}

/** The latest 500 messages, oldest first, or just those since `after` when polling. */
export async function listMessages(conversationId: string, after?: Date) {
  await ready();
  const conversation_id = new ObjectId(conversationId);
  const docs = after
    ? await messages.find({ conversation_id, created_at: { $gte: after } }).sort({ created_at: 1, _id: 1 }).limit(200).toArray()
    : (await messages.find({ conversation_id }).sort({ created_at: -1, _id: -1 }).limit(500).toArray()).reverse();
  return docs.map(toMessage);
}

/** Records that the viewer has read the conversation up to now. */
export async function markRead(viewer: Viewer, conversationId: string) {
  const _id = new ObjectId(conversationId);
  await conversations.updateOne(
    viewer.isAdmin ? { _id } : { _id, client_id: viewer.id },
    { $set: { [viewer.isAdmin ? "admin_last_read_at" : "client_last_read_at"]: new Date() } },
  );
}

export async function sendMessage(
  viewer: Viewer,
  conversationId: string,
  body: string,
  file: { name: string; type: string; data: Buffer } | null,
) {
  const conversation_id = new ObjectId(conversationId);

  let attachment_id: ObjectId | null = null;
  if (file) {
    const metadata: AttachmentMeta = { conversation_id, content_type: file.type, uploaded_by: viewer.id };
    const upload = attachments.openUploadStream(file.name, { metadata });
    await new Promise<void>((resolve, reject) => {
      upload.once("finish", () => resolve());
      upload.once("error", reject);
      upload.end(file.data);
    });
    attachment_id = upload.id;
  }

  const doc: MessageDoc = {
    _id: new ObjectId(),
    conversation_id,
    sender_id: viewer.id,
    body,
    attachment_id,
    attachment_name: file?.name ?? null,
    attachment_size: file?.data.length ?? null,
    attachment_type: file?.type ?? null,
    created_at: new Date(),
  };
  await messages.insertOne(doc);

  // Keep the conversation summary in sync for the inbox list.
  await conversations.updateOne(
    { _id: conversation_id },
    {
      $set: {
        last_message_at: doc.created_at,
        last_message_preview: (body || `Attachment: ${file?.name}`).slice(0, 140),
        last_sender_id: viewer.id,
      },
    },
  );
  return toMessage(doc);
}

/** Someone viewing the thread polls every few seconds, which keeps their read time this fresh. */
const ACTIVE_WINDOW_MS = 15_000;
const NOTIFY_THROTTLE_MS = 10 * 60_000;

/**
 * Decides whether a message should trigger an email to the other side and
 * atomically records it. Skipped if they're looking at the thread right now,
 * and throttled to one email per 10 minutes per recipient.
 */
export async function claimNotification(viewer: Viewer, message: Message): Promise<"owner" | "client" | null> {
  const recipient = viewer.isAdmin ? "client" : "owner";
  const readField = viewer.isAdmin ? "client_last_read_at" : "admin_last_read_at";
  const notifiedField = viewer.isAdmin ? "client_notified_at" : "owner_notified_at";
  const now = Date.now();

  const claimed = await conversations.findOneAndUpdate(
    {
      _id: new ObjectId(message.conversation_id),
      last_sender_id: viewer.id,
      [readField]: { $lt: new Date(new Date(message.created_at).getTime() - ACTIVE_WINDOW_MS) },
      $or: [{ [notifiedField]: null }, { [notifiedField]: { $lt: new Date(now - NOTIFY_THROTTLE_MS) } }],
    },
    { $set: { [notifiedField]: new Date(now) } },
  );
  return claimed ? recipient : null;
}

/** Opens an attachment for download if the viewer can see its conversation. */
export async function openAttachment(viewer: Viewer, id: string) {
  const _id = oid(id);
  if (!_id) return null;
  const file = await db.collection<{ _id: ObjectId; filename: string; length: number; metadata: AttachmentMeta }>("attachments.files").findOne({ _id });
  if (!file || !(await getConversation(viewer, file.metadata.conversation_id.toHexString()))) return null;
  return {
    filename: file.filename,
    size: file.length,
    contentType: file.metadata.content_type,
    stream: attachments.openDownloadStream(_id),
  };
}
