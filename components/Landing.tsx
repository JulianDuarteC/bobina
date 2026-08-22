import Link from "next/link";

export function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 font-body text-xs uppercase tracking-marquee text-marquee-500">
        Ahora en cartelera
      </span>
      <h1 className="max-w-2xl font-display text-5xl leading-tight tracking-marquee text-frame-50 sm:text-6xl">
        Lleva tu diario de cine
      </h1>
      <p className="mt-4 max-w-md font-body text-frame-200/80">
        Registra lo que ves, califica, escribe reseñas y descubre qué está
        viendo tu comunidad.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/register" className="btn-primary">
          Crear cuenta
        </Link>
        <Link href="/login" className="btn-ghost">
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
