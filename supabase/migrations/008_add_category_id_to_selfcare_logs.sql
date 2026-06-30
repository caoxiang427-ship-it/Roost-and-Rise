create table public.selfcare_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  activity text,
  amount numeric,
  logged_at timestamp with time zone default now()
);

alter table public.selfcare_logs enable row level security;

create policy "User can view own logs" 
  on public.selfcare_logs for select
  using (auth.uid() = user_id);

create policy "User can insert own logs" 
  on public.selfcare_logs for insert
  with check (auth.uid() = user_id);

alter table public.selfcare_logs
add column category_id uuid references public.selfcare_categories(id) on delete set null;

alter table public.selfcare_logs drop column category;
