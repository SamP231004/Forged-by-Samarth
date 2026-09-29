-- Google and GitHub put the display name in different metadata fields.
-- Pick the best one available when a client's conversation is created.
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
  values (
    u.id,
    u.email,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'user_name'), '')
    )
  )
  on conflict (client_id) do update set client_id = excluded.client_id
  returning * into c;
  return c;
end;
$$;

revoke all on function public.ensure_conversation() from public, anon;
grant execute on function public.ensure_conversation() to authenticated;
