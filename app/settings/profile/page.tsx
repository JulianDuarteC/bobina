import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileEditForm } from "@/components/settings/ProfileEditForm";

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) redirect("/login");

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-8 font-display text-2xl tracking-marquee text-frame-50">
        Editar perfil
      </h1>
      <ProfileEditForm profile={profile} />
    </main>
  );
}
