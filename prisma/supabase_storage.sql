-- Ejecuta esto en el SQL Editor de Supabase para habilitar subida de
-- avatares y banners. Crea un bucket público llamado "profile-media" y
-- las políticas para que cada usuario solo pueda escribir en su propia
-- carpeta (organizada por su user id).

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do nothing;

-- Lectura pública: cualquiera puede VER avatares/banners (es contenido
-- público de un perfil, como en cualquier red social).
create policy "Cualquiera puede ver archivos de perfil"
  on storage.objects for select
  using (bucket_id = 'profile-media');

-- Escritura: solo el dueño puede subir/actualizar archivos dentro de su
-- propia carpeta (la carpeta debe llamarse igual que su user id).
create policy "Los usuarios suben sus propios archivos de perfil"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Los usuarios actualizan sus propios archivos de perfil"
  on storage.objects for update
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
