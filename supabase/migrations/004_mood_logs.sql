create table public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null,
  logged_at timestamp with time zone default now()
);

alter table public.mood_logs enable row level security;

create policy "Users can view own moods" 
  on public.mood_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own moods" 
  on public.mood_logs for insert
  with check (auth.uid() = user_id);
