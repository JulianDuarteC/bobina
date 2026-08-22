-- Ejecuta esto una vez en el SQL Editor de tu proyecto de Supabase,
-- DESPUÉS de correr `prisma migrate dev` (para que la tabla profiles ya exista).
--
-- Crea automáticamente una fila en `profiles` cuando alguien CONFIRMA
-- su correo en Supabase Auth (no cuando se registra) — así una cuenta
-- que nunca verifica su email nunca llega a tener perfil ni aparece en
-- ninguna parte de la app.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_confirmed on auth.users;

create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute procedure public.handle_new_user();

-- Row Level Security: cada usuario solo puede editar su propio perfil,
-- pero todos pueden leer perfiles públicos.
alter table public.profiles enable row level security;

create policy "Los perfiles son visibles para todos"
  on public.profiles for select
  using (true);

create policy "Los usuarios solo editan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);
