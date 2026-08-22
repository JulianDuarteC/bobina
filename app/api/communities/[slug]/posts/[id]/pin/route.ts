import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
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

  if (!membership || membership.status !== "ACTIVE" || membership.role === "MEMBER") {
    return NextResponse.json(
      { error: "Requiere rol de administrador o moderador" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const post = await prisma.communityPost.update({
    where: { id: params.id },
    data: { isPinned: Boolean(body.isPinned) },
  });

  return NextResponse.json(post);
}
