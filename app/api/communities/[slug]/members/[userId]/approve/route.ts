import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
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

  if (
    !requesterMembership ||
    requesterMembership.status !== "ACTIVE" ||
    requesterMembership.role === "MEMBER"
  ) {
    return NextResponse.json(
      { error: "Requiere rol de administrador o moderador" },
      { status: 403 }
    );
  }

  const updated = await prisma.communityMember
    .update({
      where: {
        communityId_userId: { communityId: community.id, userId: params.userId },
      },
      data: { status: "ACTIVE" },
    })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ approved: true });
}
