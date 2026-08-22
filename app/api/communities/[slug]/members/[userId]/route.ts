import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; userId: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const community = await prisma.community.findUnique({
    where: { slug: params.slug },
  });
  if (!community) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const requesterMembership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId: community.id, userId: user.id },
    },
  });

  if (requesterMembership?.status !== "ACTIVE" || requesterMembership.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo el admin puede cambiar roles" },
      { status: 403 }
    );
  }

  // El creador siempre es admin; no se puede cambiar su rol desde acá.
  if (params.userId === community.creatorId) {
    return NextResponse.json(
      { error: "No puedes cambiar el rol del creador" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const newRole = body.role === "MODERATOR" ? "MODERATOR" : "MEMBER";

  const updated = await prisma.communityMember.update({
    where: {
      communityId_userId: { communityId: community.id, userId: params.userId },
    },
    data: { role: newRole },
  });

  return NextResponse.json(updated);
}
