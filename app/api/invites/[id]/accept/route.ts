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

  const invite = await prisma.communityInvite.findUnique({
    where: { id: params.id },
  });

  if (!invite || invite.invitedId !== user.id) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.communityInvite.update({
      where: { id: params.id },
      data: { status: "ACCEPTED" },
    }),
    prisma.communityMember.upsert({
      where: {
        communityId_userId: {
          communityId: invite.communityId,
          userId: user.id,
        },
      },
      create: {
        communityId: invite.communityId,
        userId: user.id,
        role: "MEMBER",
      },
      update: {},
    }),
  ]);

  return NextResponse.json({ accepted: true });
}
