import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const REPORT_THRESHOLD = 5;
const MIN_TRUST_SCORE = 50;

const VALID_CONTENT_TYPES = ["REVIEW", "COMMUNITY_POST", "USER"];
const VALID_REASONS = ["SPAM", "HATE_SPEECH", "UNMARKED_SPOILER", "NSFW", "HARASSMENT"];

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { contentType, contentId, reason } = body;

  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "contentType inválido" }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "reason inválido" }, { status: 400 });
  }
  if (!contentId) {
    return NextResponse.json({ error: "Falta contentId" }, { status: 400 });
  }

  await prisma.report
    .create({
      data: { reporterId: user.id, contentType, contentId, reason },
    })
    .catch(() => null); // ya lo habías reportado antes: no es un error

  // Umbral de cuarentena automática: si el contenido acumula 5+
  // reportes de personas con trust_score > 50, se oculta y queda en la
  // cola prioritaria del backoffice.
  if (contentType === "REVIEW" || contentType === "COMMUNITY_POST") {
    const reports = await prisma.report.findMany({
      where: { contentType, contentId, status: "PENDING" },
      include: { reporter: true },
    });

    const qualifyingReporters = new Set(
      reports
        .filter((r) => r.reporter.trustScore > MIN_TRUST_SCORE)
        .map((r) => r.reporterId)
    );

    if (qualifyingReporters.size >= REPORT_THRESHOLD) {
      if (contentType === "REVIEW") {
        await prisma.review
          .update({ where: { id: contentId }, data: { hiddenBySystem: true } })
          .catch(() => null);
      } else {
        await prisma.communityPost
          .update({ where: { id: contentId }, data: { hiddenBySystem: true } })
          .catch(() => null);
      }
    }
  }

  return NextResponse.json({ success: true });
}
