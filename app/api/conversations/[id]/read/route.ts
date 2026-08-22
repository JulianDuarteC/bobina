import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await prisma.conversationParticipant
    .update({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
      data: { lastReadAt: new Date() },
    })
    .catch(() => null);

  return NextResponse.json({ success: true });
}
