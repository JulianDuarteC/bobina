import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { filterProfanity, containsSpoilerKeywords } from "@/lib/moderation";

async function assertOwnership(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== userId) return null;
  return review;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const review = await assertOwnership(params.id, user.id);
  if (!review) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();

  let content: string | null = body.content ?? null;
  let hasSpoilers = Boolean(body.hasSpoilers);

  if (content) {
    content = filterProfanity(content).filtered;
    if (!hasSpoilers && containsSpoilerKeywords(content)) {
      hasSpoilers = true;
    }
  }

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: {
      rating: body.rating ?? null,
      content,
      hasSpoilers,
      isRewatch: Boolean(body.isRewatch),
      ...(body.watchedDate && { watchedDate: new Date(body.watchedDate) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const review = await assertOwnership(params.id, user.id);
  if (!review) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.review.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
