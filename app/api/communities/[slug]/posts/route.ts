import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { filterProfanity } from "@/lib/moderation";

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

  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Debes unirte a la comunidad para publicar" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const title = filterProfanity((body.title ?? "").trim()).filtered;
  const content = filterProfanity((body.content ?? "").trim()).filtered;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Título y contenido son requeridos" },
      { status: 400 }
    );
  }

  const post = await prisma.communityPost.create({
    data: { communityId: community.id, userId: user.id, title, content },
  });

  return NextResponse.json(post);
}
