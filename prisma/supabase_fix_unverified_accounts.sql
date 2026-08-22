-- Ejecuta esto en el SQL Editor de Supabase. Corrige el trigger de
-- creación de perfiles: antes se disparaba al REGISTRARSE (INSERT en
-- auth.users), lo cual creaba el perfil aunque la persona nunca
-- confirmara su correo. Ahora se dispara solo cuando el correo queda
-- CONFIRMADO (email_confirmed_at pasa de null a una fecha).

-- 1. Limpieza: borra los perfiles de cuentas que se registraron pero
--    nunca confirmaron su correo (esto es lo que viste en la búsqueda
--    de personas). Gracias a los "onDelete: Cascade" del schema, esto
--    también limpia sus reseñas, follows, etc. si llegaron a tener
--    alguno (poco probable si nunca confirmaron).
delete from public.profiles
where id in (
  select id from auth.users where email_confirmed_at is null
);

-- 2. Reemplaza la función y el trigger.
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

-- Quita el trigger viejo (que se disparaba en el registro).
drop trigger if exists on_auth_user_created on auth.users;

-- Trigger nuevo: se dispara solo cuando email_confirmed_at pasa de
-- null a tener una fecha (o sea, justo al confirmar el correo).
drop trigger if exists on_auth_user_confirmed on auth.users;

create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute procedure public.handle_new_user();
