create table public.selfcare_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  emoji text not null,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.selfcare_categories enable row level security;

create policy "Users can view own categories"
  on public.selfcare_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.selfcare_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.selfcare_categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.selfcare_categories for delete
  using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.selfcare_categories to authenticated;
