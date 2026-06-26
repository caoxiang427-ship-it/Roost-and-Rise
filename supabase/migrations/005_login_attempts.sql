create table public.login_attempts (
  email text primary key,
  count_fail_times integer not null default 0,
  locked_until timestamp with time zone,
  last_attempt_at timestamp with time zone default now()
);

alter table public.login_attempts enable row level security;

create policy "Anyone can read login attempts"
  on public.login_attempts for select
  using (true);

create policy "Anyone can insert login attempts"
  on public.login_attempts for insert
  with check (true);

create policy "Anyone can update login attempts"
  on public.login_attempts for update
  using (true);
