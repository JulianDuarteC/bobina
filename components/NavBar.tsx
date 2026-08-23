import Link from "next/link";
import { Bell, Shield, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./LogoutButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MobileNav } from "./MobileNav";

export async function NavBar() {
  const user = await getCurrentUser();
  const profile = user
    ? await prisma.profile.findUnique({ where: { id: user.id } })
    : null;

  const unreadCount = user
    ? await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      })
    : 0;

  let unreadMessagesCount = 0;
  if (user) {
    const myParticipations = await prisma.conversationParticipant.findMany({
      where: { userId: user.id, status: { in: ["ACCEPTED", "PENDING"] } },
      include: {
        conversation: {
          include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
        },
      },
    });

    unreadMessagesCount = myParticipations.filter((p) => {
      if (p.status === "PENDING") return true;
      const lastMessage = p.conversation.messages[0];
      if (!lastMessage || lastMessage.senderId === user.id) return false;
      return !p.lastReadAt || p.lastReadAt < lastMessage.createdAt;
    }).length;
  }

  return (
    <nav className="relative flex items-center justify-between border-b border-reel-800 px-4 py-3 sm:px-6">
      <Link href="/" className="font-display text-lg tracking-marquee text-marquee-500">
        BOBINA
      </Link>

      {/* Navegación de escritorio: oculta por debajo de md */}
      <div className="hidden items-center gap-4 md:flex">
        <Link href="/explore" className="font-body text-sm text-frame-100 hover:text-marquee-400">
          Explorar
        </Link>
        <Link href="/communities" className="font-body text-sm text-frame-100 hover:text-marquee-400">
          Comunidades
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-1.5 font-body text-sm text-frame-100 hover:text-marquee-400"
        >
          <Search size={16} strokeWidth={2} />
          Buscar
        </Link>
        {profile ? (
          <>
            <Link
              href="/messages"
              className="relative font-body text-sm text-frame-100 hover:text-marquee-400"
            >
              Mensajes
              {unreadMessagesCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-marquee-500 px-1 font-body text-[10px] font-bold text-reel-950">
                  {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                </span>
              )}
            </Link>
            <Link
              href="/notifications"
              className="relative text-frame-100 hover:text-marquee-400"
              title="Notificaciones"
            >
              <Bell size={18} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-marquee-500 px-1 font-body text-[10px] font-bold text-reel-950">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href={`/${profile.username}`}
              className="font-body text-sm text-frame-100 hover:text-marquee-400"
            >
              Mi perfil
            </Link>
            {(profile.siteRole === "MODERATOR" || profile.siteRole === "ADMIN") && (
              <Link
                href="/admin/moderation"
                className="text-frame-200/70 hover:text-marquee-400"
                title="Panel de moderación"
              >
                <Shield size={18} strokeWidth={2} />
              </Link>
            )}
            <ThemeSwitcher userId={profile.id} initialTheme={profile.colorTheme} />
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="font-body text-sm text-frame-100 hover:text-marquee-400">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary !px-4 !py-1.5 !text-xs">
              Crear cuenta
            </Link>
          </>
        )}
      </div>

      {/* Menú hamburguesa: solo por debajo de md */}
      <MobileNav
        profile={profile}
        unreadCount={unreadCount}
        unreadMessagesCount={unreadMessagesCount}
      />
    </nav>
  );
}
