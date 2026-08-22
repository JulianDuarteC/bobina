import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
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

  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId: community.id, userId: user.id },
    },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "Debes ser miembro para invitar a otras personas" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const invitedId = body.invitedUserId;

  if (!invitedId) {
    return NextResponse.json(
      { error: "Falta el usuario a invitar" },
      { status: 400 }
    );
  }

  const alreadyMember = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: community.id, userId: invitedId } },
  });
  if (alreadyMember) {
    return NextResponse.json(
      { error: "Esa persona ya es miembro de la comunidad" },
      { status: 400 }
    );
  }

  const invite = await prisma.communityInvite
    .upsert({
      where: { communityId_invitedId: { communityId: community.id, invitedId } },
      create: {
        communityId: community.id,
        invitedId,
        invitedById: user.id,
        status: "PENDING",
      },
      // Si había una invitación previa rechazada, se reabre.
      update: { status: "PENDING", invitedById: user.id },
    });

  await prisma.notification.create({
    data: {
      userId: invitedId,
      actorId: user.id,
      type: "COMMUNITY_INVITE",
      entityId: invite.id,
    },
  });

  return NextResponse.json(invite);
}
