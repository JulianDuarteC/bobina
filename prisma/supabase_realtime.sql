-- Ejecuta esto en el SQL Editor de Supabase DESPUÉS de correr la
-- migración de Prisma que crea las tablas de chat. Habilita que el
-- navegador reciba mensajes nuevos en tiempo real (sin refrescar la
-- página), usando el sistema de Realtime de Supabase sobre la tabla
-- direct_messages.

-- 1. Agrega la tabla a la publicación de Realtime.
alter publication supabase_realtime add table direct_messages;

-- 2. RLS: solo los participantes de una conversación pueden "escuchar"
-- sus mensajes en tiempo real. Esto no afecta a Prisma (que usa una
-- conexión con privilegios elevados y no pasa por RLS) — es solo para
-- las suscripciones de Realtime que hace el navegador del usuario.
alter table direct_messages enable row level security;

create policy "Los participantes ven los mensajes de su conversación"
  on direct_messages for select
  using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = direct_messages.conversation_id
        and cp.user_id = auth.uid()
    )
  );
