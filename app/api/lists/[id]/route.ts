import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function assertOwnership(listId: string, userId: string) {
  const list = await prisma.customList.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId) return null;
  return list;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const list = await assertOwnership(params.id, user.id);
  if (!list) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const body = await request.json();

  const updated = await prisma.customList.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && {
        description: body.description?.trim() || null,
      }),
      ...(body.isPrivate !== undefined && {
        isPrivate: Boolean(body.isPrivate),
      }),
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

  const list = await assertOwnership(params.id, user.id);
  if (!list) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.customList.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
