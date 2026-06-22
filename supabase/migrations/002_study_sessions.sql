-- sessions table

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_in_min integer not null,
  type_of_session text not null, 
  stopped_at timestamp with time zone default now()
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

