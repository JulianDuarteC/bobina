import type { MetadataRoute } from "next";

// IMPORTANTE: reemplaza esta URL por tu dominio real una vez publicado.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tu-dominio.com";

// Sitemap de las rutas estáticas principales. Las rutas dinámicas
// (perfiles, películas, comunidades) no están incluidas todavía — para
// un sitio con más tráfico, vale la pena generar un sitemap dinámico
// consultando la base de datos (ver nota en el README).
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/explore", "/search", "/communities", "/terms", "/privacy"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
