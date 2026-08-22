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

  const updated = await prisma.conversationParticipant
    .update({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
      data: { status: "ACCEPTED" },
    })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ status: "ACCEPTED" });
}
