import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
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

  const existing = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId: community.id, userId: user.id },
    },
  });

  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ joined: true });
  }
  if (existing?.status === "PENDING") {
    return NextResponse.json({ pending: true });
  }

  // Comunidades públicas: acceso inmediato. Privadas: queda pendiente
  // de aprobación por un admin/moderador.
  await prisma.communityMember.create({
    data: {
      communityId: community.id,
      userId: user.id,
      role: "MEMBER",
      status: community.isPrivate ? "PENDING" : "ACTIVE",
    },
  });

  if (community.isPrivate) {
    return NextResponse.json({ pending: true });
  }

  return NextResponse.json({ joined: true });
}

export async function DELETE(
  _request: NextRequest,
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

  // El creador no puede abandonar su propia comunidad (evita comunidades
  // huérfanas sin admin). Tendría que transferir el rol primero — fuera
  // de alcance por ahora.
  if (community.creatorId === user.id) {
    return NextResponse.json(
      { error: "El creador no puede abandonar la comunidad" },
      { status: 400 }
    );
  }

  await prisma.communityMember
    .delete({
      where: {
        communityId_userId: { communityId: community.id, userId: user.id },
      },
    })
    .catch(() => null);

  return NextResponse.json({ joined: false });
}
