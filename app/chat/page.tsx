import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChatUnavailable } from "@/components/chat/chat-unavailable";
import { SignOutButton } from "@/components/chat/sign-out-button";
import { ChatWorkspace } from "@/components/chat/workspace";
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
      <div className="mx-auto h-[calc(100dvh-8rem)] overflow-hidden rounded-3xl border border-border bg-card/60 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.4)] backdrop-blur-xl sm:h-[calc(100dvh-10rem)]">
        <ChatWorkspace
          conversationId={conversation.id}
          userId={user.id}
          viewer="client"
          peerName={site.name.split(" ")[0]}
          initial={{ messages, peerLastReadAt: conversation.admin_last_read_at, project: conversation.project }}
          header={{
            avatar: (
              <span key="avatar" className="relative grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
                SP
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success" />
              </span>
            ),
            title: <h1 key="title" className="truncate text-sm font-medium">{site.name}</h1>,
            subtitle: `Replies personally, usually within a day · ${site.timezone}`,
            trailing: <SignOutButton key="signout" email={user.email} />,
          }}
          greeting={
            <div key="greeting" className="mx-auto mb-6 max-w-md rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
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
    </section>
  );
}
