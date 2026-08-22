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

  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    await prisma.$transaction([
      prisma.reviewLike.create({
        data: { reviewId: params.id, userId: user.id },
      }),
      prisma.review.update({
        where: { id: params.id },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    // No te notificamos si te das like a ti mismo.
    if (review && review.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: review.userId,
          actorId: user.id,
          type: "LIKE",
          entityId: params.id,
        },
      });
    }
  } catch {
    // Ya le había dado like antes: no es un error, solo ignoramos.
  }

  return NextResponse.json({ liked: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const existing = await prisma.reviewLike.findUnique({
    where: { reviewId_userId: { reviewId: params.id, userId: user.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.reviewLike.delete({
        where: { reviewId_userId: { reviewId: params.id, userId: user.id } },
      }),
      prisma.review.update({
        where: { id: params.id },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  }

  return NextResponse.json({ liked: false });
}
