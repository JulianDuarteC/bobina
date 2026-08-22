import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSiteModerator } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: { contentType: string; contentId: string } }
) {
  const mod = await requireSiteModerator();
  if (!mod) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { contentType, contentId } = params;

  await prisma.report.updateMany({
    where: { contentType: contentType as any, contentId, status: "PENDING" },
    data: { status: "APPROVED" },
  });

  if (contentType === "REVIEW") {
    await prisma.review
      .update({ where: { id: contentId }, data: { hiddenBySystem: true } })
      .catch(() => null);
  } else if (contentType === "COMMUNITY_POST") {
    await prisma.communityPost
      .update({ where: { id: contentId }, data: { hiddenBySystem: true } })
      .catch(() => null);
  }

  return NextResponse.json({ success: true });
}
