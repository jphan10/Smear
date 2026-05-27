create table if not exists public.canonical_reset_flags (
  canonical_climb_id uuid not null references public.canonical_climbs(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  created_at        timestamptz not null default now(),
  primary key (canonical_climb_id, user_id)
);

alter table public.canonical_reset_flags enable row level security;

create policy "Users can view their own reset flags"
  on public.canonical_reset_flags for select
  using (auth.uid() = user_id);

create policy "Users can flag canonical climbs as reset"
  on public.canonical_reset_flags for insert
  with check (auth.uid() = user_id);

create or replace function public.flag_canonical_reset(p_canonical_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reset_count int;
begin
  insert into public.canonical_reset_flags (canonical_climb_id, user_id)
  values (p_canonical_id, auth.uid())
  on conflict do nothing;

  select count(*) into v_reset_count
  from public.canonical_reset_flags
  where canonical_climb_id = p_canonical_id;

  update public.canonical_climbs
  set takedown_votes = v_reset_count
  where id = p_canonical_id;
end;
$$;
