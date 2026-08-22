import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (user.id === params.id) {
    return NextResponse.json(
      { error: "No puedes seguirte a ti mismo" },
      { status: 400 }
    );
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: { followerId: user.id, followingId: params.id },
    },
    create: { followerId: user.id, followingId: params.id },
    update: {},
  });

  await prisma.notification.create({
    data: {
      userId: params.id,
      actorId: user.id,
      type: "FOLLOW",
    },
  });

  return NextResponse.json({ following: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await prisma.follow
    .delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: params.id,
        },
      },
    })
    .catch(() => null); // Si no existía la relación, no es un error real.

  return NextResponse.json({ following: false });
}
