import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSiteModerator } from "@/lib/auth";

const STRIKE_TRUST_PENALTY = 20;

export async function POST(
  request: NextRequest,
  { params }: { params: { contentType: string; contentId: string } }
) {
  const mod = await requireSiteModerator();
  if (!mod) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { contentType, contentId } = params;
  const body = await request.json().catch(() => ({}));

  let targetUserId: string | null = null;

  if (contentType === "REVIEW") {
    const review = await prisma.review.findUnique({ where: { id: contentId } });
    targetUserId = review?.userId ?? null;
  } else if (contentType === "COMMUNITY_POST") {
    const post = await prisma.communityPost.findUnique({ where: { id: contentId } });
    targetUserId = post?.userId ?? null;
  } else if (contentType === "USER") {
    targetUserId = contentId;
  }

  if (!targetUserId) {
    return NextResponse.json({ error: "No se encontró a quién sancionar" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.moderationLog.create({
      data: {
        moderatorId: mod.user.id,
        action: "WARNING",
        targetUserId,
        reason: body.reason || null,
      },
    }),
    prisma.profile.update({
      where: { id: targetUserId },
      data: { trustScore: { decrement: STRIKE_TRUST_PENALTY } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
