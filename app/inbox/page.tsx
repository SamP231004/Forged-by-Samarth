import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChatUnavailable } from "@/components/chat/chat-unavailable";
import { Inbox } from "@/components/chat/inbox";
import { chatEnabled, getViewer } from "@/lib/auth";
import { listConversations, listMessages, markRead } from "@/lib/chat-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ c?: string }> };

export default async function InboxPage({ searchParams }: Props) {
  if (!chatEnabled) return <ChatUnavailable />;

  const user = await getViewer();
  if (!user) redirect("/login?next=/inbox");
  if (!user.isAdmin) notFound();

  const { c: selectedId } = await searchParams;

  const conversations = await listConversations();
  const selected = selectedId ? conversations.find((c) => c.id === selectedId) : undefined;
  const [messages] = selected ? await Promise.all([listMessages(selected.id), markRead(user, selected.id)]) : [[]];

  return (
    <Inbox
      adminId={user.id}
      adminEmail={user.email}
      initialConversations={conversations}
      selectedId={selected?.id ?? null}
      initialMessages={messages}
    />
  );
}
