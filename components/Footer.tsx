import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-reel-800 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        {/* Atribución requerida por los términos de uso de la API de TMDb */}
        <p className="font-body text-xs text-frame-200/50">
          Este producto usa la API de TMDb pero no está avalado ni
          certificado por{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-marquee-400 hover:underline"
          >
            TMDb
          </a>
          .
        </p>

        <div className="flex gap-4 font-body text-xs text-frame-200/40">
          <Link href="/terms" className="hover:text-frame-100">
            Términos de servicio
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-frame-100">
            Privacidad
          </Link>
        </div>

        <p className="font-body text-[11px] text-frame-200/30">
          © {new Date().getFullYear()} Bobina
        </p>
      </div>
    </footer>
  );
}
