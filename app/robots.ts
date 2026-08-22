import type { MetadataRoute } from "next";

// IMPORTANTE: reemplaza esta URL por tu dominio real una vez publicado.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tu-dominio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // El panel de moderación y las conversaciones privadas no
        // deben indexarse en buscadores.
        disallow: ["/admin/", "/messages/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
