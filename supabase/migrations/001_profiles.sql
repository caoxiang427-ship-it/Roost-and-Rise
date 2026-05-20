/* profiles table
stores user data including id and name, when the profile is created
linked to auth.users table
*/

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamp with time zone default now()
);

-- Enable row level security, users cannot access profile data other than theirs
alter table public.profiles enable row level security;

-- Read policy, allow users to read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Update policy, allow users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a new profile row when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

/* Attach the trigger
trigger fires after every new user is inserted into auth.users
*/

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
