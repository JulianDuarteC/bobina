import { NextRequest, NextResponse } from "next/server";
import { searchTv } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "El parámetro 'q' es requerido" },
      { status: 400 }
    );
  }

  try {
    const results = await searchTv(query, page);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error buscando series en TMDb:", error);
    return NextResponse.json(
      { error: "No se pudo completar la búsqueda en este momento" },
      { status: 502 }
    );
  }
}
