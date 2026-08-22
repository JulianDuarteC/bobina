import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const name = (body.name ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "El nombre es requerido" },
      { status: 400 }
    );
  }

  let slug = slugify(name);
  const existing = await prisma.community.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const community = await prisma.community.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || null,
      isPrivate: Boolean(body.isPrivate),
      creatorId: user.id,
      members: {
        create: { userId: user.id, role: "ADMIN" },
      },
    },
  });

  return NextResponse.json(community);
}
