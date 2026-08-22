import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Devuelve el usuario autenticado (o null) leyendo la sesión de Supabase
// desde las cookies de la request actual.
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// Devuelve el perfil solo si tiene rol de moderador/admin a nivel de
// sitio (distinto de los roles por comunidad). Usado para proteger el
// backoffice de moderación.
export async function requireSiteModerator() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || (profile.siteRole !== "MODERATOR" && profile.siteRole !== "ADMIN")) {
    return null;
  }

  return { user, profile };
}
