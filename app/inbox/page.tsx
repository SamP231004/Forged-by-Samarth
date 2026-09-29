import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChatUnavailable } from "@/components/chat/chat-unavailable";
import { Inbox } from "@/components/chat/inbox";
import type { Conversation, Message } from "@/lib/chat";
import { chatEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ c?: string }> };

export default async function InboxPage({ searchParams }: Props) {
  if (!chatEnabled) return <ChatUnavailable />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/inbox");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  const { c: selectedId } = await searchParams;

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(200);

  const selected = selectedId ? (conversations ?? []).find((c) => c.id === selectedId) : undefined;
  const { data: messages } = selected
    ? await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selected.id)
        .order("created_at", { ascending: true })
        .limit(500)
    : { data: [] };

  return (
    <Inbox
      adminId={user.id}
      adminEmail={user.email ?? ""}
      initialConversations={(conversations ?? []) as Conversation[]}
      selectedId={selected?.id ?? null}
      initialMessages={(messages ?? []) as Message[]}
    />
  );
}
