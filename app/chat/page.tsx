import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChatThread } from "@/components/chat/chat-thread";
import { ChatUnavailable } from "@/components/chat/chat-unavailable";
import { SignOutButton } from "@/components/chat/sign-out-button";
import { chatEnabled, getViewer } from "@/lib/auth";
import { PENDING_NAME_COOKIE } from "@/lib/chat";
import { ensureConversation, listMessages, markRead } from "@/lib/chat-store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function ChatPage() {
  if (!chatEnabled) return <ChatUnavailable />;

  const user = await getViewer();
  if (!user) redirect("/login?next=/chat");
  if (user.isAdmin) redirect("/inbox");

  const pendingName = (await cookies()).get(PENDING_NAME_COOKIE)?.value;
  const conversation = await ensureConversation(user, pendingName && decodeURIComponent(pendingName));
  const [messages] = await Promise.all([listMessages(conversation.id), markRead(user, conversation.id)]);

  return (
    <section className="container-page pb-8 pt-24 sm:pt-28">
      <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card/60 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.4)] backdrop-blur-xl sm:h-[calc(100dvh-10rem)]">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
            SP
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-medium">{site.name}</h1>
            <p className="truncate text-xs text-muted-foreground">Replies personally, usually within a day · {site.timezone}</p>
          </div>
          <SignOutButton email={user.email} />
        </header>

        <div className="min-h-0 flex-1">
          <ChatThread
            conversationId={conversation.id}
            userId={user.id}
            viewer="client"
            initialMessages={messages}
            greeting={
              <div className="mx-auto mb-6 max-w-md rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Hi{conversation.client_name ? ` ${conversation.client_name.split(" ")[0]}` : ""} 👋</p>
                <p className="mt-2 leading-relaxed">
                  Tell me what you&apos;re building, who it&apos;s for and roughly when you need it. Attach a brief or
                  wireframes if you have them. Everything happens here in writing — no calls needed — and you&apos;ll
                  get an email when I reply.
                </p>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
