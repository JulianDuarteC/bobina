import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { filterProfanity } from "@/lib/moderation";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const comments = await prisma.communityPostComment.findMany({
    where: { postId: params.id },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: {
        username: c.author.username,
        displayName: c.author.displayName,
        avatarUrl: c.author.avatarUrl,
      },
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
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
  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Debes ser miembro para comentar" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const content = filterProfanity((body.content ?? "").trim()).filtered;

  if (!content) {
    return NextResponse.json(
      { error: "El comentario no puede estar vacío" },
      { status: 400 }
    );
  }

  const comment = await prisma.communityPostComment.create({
    data: { postId: params.id, userId: user.id, content },
    include: { author: true },
  });

  return NextResponse.json({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: {
      username: comment.author.username,
      displayName: comment.author.displayName,
      avatarUrl: comment.author.avatarUrl,
    },
  });
}
