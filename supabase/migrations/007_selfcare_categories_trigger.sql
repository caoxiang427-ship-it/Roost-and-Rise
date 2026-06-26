create or replace function public.create_default_categories()
returns trigger as $$
begin
  insert into public.selfcare_categories (user_id, label, emoji, display_order) values
    (new.id, 'Water', '💧', 1),
    (new.id, 'Meal', '🍱', 2),
    (new.id, 'Sleep', '😴', 3),
    (new.id, 'Break', '☕', 4),
    (new.id, 'Hobby', '🎨', 5),
    (new.id, 'Other', '💭', 6);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_user_created_default_categories
  after insert on auth.users
  for each row execute function public.create_default_categories();
