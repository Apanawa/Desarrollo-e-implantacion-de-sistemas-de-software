-- Lab3 CRUD Supabase: tabla de pendientes por usuario.
-- Ejecuta este archivo en SQL Editor o con `supabase db push`.

create table if not exists public.pendientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pendientes enable row level security;
revoke all on table public.pendientes from anon, authenticated;
grant select, insert, update, delete on table public.pendientes to authenticated;

drop policy if exists "pendientes_select_own" on public.pendientes;
create policy "pendientes_select_own" on public.pendientes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "pendientes_insert_own" on public.pendientes;
create policy "pendientes_insert_own" on public.pendientes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "pendientes_update_own" on public.pendientes;
create policy "pendientes_update_own" on public.pendientes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "pendientes_delete_own" on public.pendientes;
create policy "pendientes_delete_own" on public.pendientes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists pendientes_user_created_idx
  on public.pendientes (user_id, created_at desc);

create or replace function public.set_pendientes_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pendientes_set_updated_at on public.pendientes;
create trigger pendientes_set_updated_at
  before update on public.pendientes
  for each row execute function public.set_pendientes_updated_at();
