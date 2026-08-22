import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { ChromeAdSlot, ChromeFooter } from "@/components/PageChrome";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import "./globals.css";

// Anton: condensada tipo cartel de marquesina — para títulos y navegación.
const marquee = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marquee",
});

// Inter: neutra y muy legible — para cuerpo de texto y UI.
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tu-dominio.com"
  ),
  title: "Bobina — Tu diario de cine",
  description:
    "Registra las películas que ves, escribe reseñas y descubre qué está viendo tu comunidad.",
  openGraph: {
    title: "Bobina — Tu diario de cine",
    description:
      "Registra las películas que ves, escribe reseñas y descubre qué está viendo tu comunidad.",
    type: "website",
    locale: "es_CO",
    siteName: "Bobina",
  },
  twitter: {
    card: "summary",
    title: "Bobina — Tu diario de cine",
    description:
      "Registra las películas que ves, escribe reseñas y descubre qué está viendo tu comunidad.",
  },
};

const THEME_ATTR: Record<string, string> = {
  BOBINA: "bobina",
  NOIR: "noir",
  TECHNICOLOR: "technicolor",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const profile = user
    ? await prisma.profile.findUnique({
        where: { id: user.id },
        select: { colorTheme: true },
      })
    : null;

  const themeAttr = THEME_ATTR[profile?.colorTheme ?? "BOBINA"];

  return (
    <html
      lang="es"
      data-theme={themeAttr}
      className={`${marquee.variable} ${body.variable} dark`}
    >
      <body>
        <NavBar />
        <ChromeAdSlot />
        {children}
        <ChromeFooter />
      </body>
    </html>
  );
}
