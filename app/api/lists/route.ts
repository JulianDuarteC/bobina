import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const title = (body.title ?? "").trim();

  if (!title) {
    return NextResponse.json(
      { error: "El título es requerido" },
      { status: 400 }
    );
  }

  const list = await prisma.customList.create({
    data: {
      userId: user.id,
      title,
      description: body.description?.trim() || null,
      isPrivate: Boolean(body.isPrivate),
    },
  });

  return NextResponse.json(list);
}
