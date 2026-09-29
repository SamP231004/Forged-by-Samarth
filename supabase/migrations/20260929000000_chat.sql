-- Client ↔ Samarth chat: one conversation per signed-in client, messages,
-- and private file attachments. Run this in the Supabase SQL editor (or with
-- `supabase db push`). Everything is protected by row level security.

-- ---------------------------------------------------------------------------
-- Admins (you). Add yourself after signing in once:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
-- No policies: only reachable through is_admin() below.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Conversations
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references auth.users (id) on delete cascade,
  client_email text not null,
  client_name text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  last_sender_id uuid,
  client_last_read_at timestamptz not null default now(),
  admin_last_read_at timestamptz not null default 'epoch',
  client_notified_at timestamptz,
  owner_notified_at timestamptz
);
create index if not exists conversations_last_message_idx on public.conversations (last_message_at desc);
alter table public.conversations enable row level security;

drop policy if exists "participants read conversations" on public.conversations;
create policy "participants read conversations" on public.conversations
  for select to authenticated
  using (client_id = auth.uid() or public.is_admin());
-- Inserts and updates only happen through the functions below.

-- ---------------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null default '' check (char_length(body) <= 5000),
  attachment_path text,
  attachment_name text,
  attachment_size integer,
  attachment_type text,
  created_at timestamptz not null default now(),
  constraint message_not_empty check (char_length(body) > 0 or attachment_path is not null)
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
alter table public.messages enable row level security;

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.conversations c where c.id = conversation_id and c.client_id = auth.uid())
  );

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (attachment_path is null or split_part(attachment_path, '/', 1) = conversation_id::text)
    and (
      public.is_admin()
      or exists (select 1 from public.conversations c where c.id = conversation_id and c.client_id = auth.uid())
    )
  );
-- Messages are immutable: no update or delete policies.

-- Stamp sender and time on the server so neither can be spoofed.
create or replace function public.messages_before_insert()
returns trigger
language plpgsql
as $$
begin
  new.sender_id := auth.uid();
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists messages_before_insert on public.messages;
create trigger messages_before_insert
  before insert on public.messages
  for each row execute function public.messages_before_insert();

-- Keep the conversation summary in sync for the inbox list.
create or replace function public.messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = left(coalesce(nullif(new.body, ''), 'Attachment: ' || new.attachment_name), 140),
      last_sender_id = new.sender_id
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.messages_after_insert();

-- ---------------------------------------------------------------------------
-- Functions called from the app
-- ---------------------------------------------------------------------------

-- Returns the signed-in client's conversation, creating it on first visit.
create or replace function public.ensure_conversation()
returns public.conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.conversations;
  u auth.users;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into c from public.conversations where client_id = auth.uid();
  if found then
    return c;
  end if;

  select * into u from auth.users where id = auth.uid();
  insert into public.conversations (client_id, client_email, client_name)
  values (u.id, u.email, nullif(trim(u.raw_user_meta_data ->> 'name'), ''))
  on conflict (client_id) do update set client_id = excluded.client_id
  returning * into c;
  return c;
end;
$$;

-- Records that the caller has read a conversation up to now.
create or replace function public.mark_read(p_conversation uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    update public.conversations set admin_last_read_at = now() where id = p_conversation;
  else
    update public.conversations set client_last_read_at = now()
    where id = p_conversation and client_id = auth.uid();
  end if;
end;
$$;

-- Decides whether the latest message should trigger an email to the other
-- side. Returns 'owner', 'client' or null, throttled to one email per
-- 10 minutes per recipient and skipped if they've already read it.
create or replace function public.claim_notification(p_conversation uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.conversations;
  admin boolean := public.is_admin();
begin
  select * into c from public.conversations where id = p_conversation for update;
  if not found or (not admin and c.client_id <> auth.uid()) then
    return null;
  end if;
  if c.last_sender_id is distinct from auth.uid() then
    return null;
  end if;

  if admin then
    if c.client_notified_at > now() - interval '10 minutes' or c.client_last_read_at >= c.last_message_at then
      return null;
    end if;
    update public.conversations set client_notified_at = now() where id = c.id;
    return 'client';
  else
    if c.owner_notified_at > now() - interval '10 minutes' or c.admin_last_read_at >= c.last_message_at then
      return null;
    end if;
    update public.conversations set owner_notified_at = now() where id = c.id;
    return 'owner';
  end if;
end;
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.ensure_conversation() from public, anon;
revoke all on function public.mark_read(uuid) from public, anon;
revoke all on function public.claim_notification(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.ensure_conversation() to authenticated;
grant execute on function public.mark_read(uuid) to authenticated;
grant execute on function public.claim_notification(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime (respects the RLS policies above)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for attachments, one folder per conversation
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  false,
  8388608,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip'
  ]
)
on conflict (id) do nothing;

drop policy if exists "chat participants read attachments" on storage.objects;
create policy "chat participants read attachments" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-attachments'
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.id::text = (storage.foldername(name))[1] and c.client_id = auth.uid()
      )
    )
  );

drop policy if exists "chat participants upload attachments" on storage.objects;
create policy "chat participants upload attachments" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.id::text = (storage.foldername(name))[1] and c.client_id = auth.uid()
      )
    )
  );
