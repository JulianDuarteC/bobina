export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 font-display text-3xl tracking-marquee text-frame-50">
        Política de Privacidad
      </h1>
      <p className="mb-10 font-body text-xs text-frame-200/50">
        Última actualización: 22 de agosto de 2026 — Este es un borrador base, revísalo
        con un abogado antes de publicar la app (en Colombia aplica la Ley
        1581 de 2012 de Protección de Datos Personales; si tienes usuarios
        en la Unión Europea, también podría aplicar el RGPD/GDPR).
      </p>

      <div className="space-y-8 font-body text-sm leading-relaxed text-frame-100/90">
        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            1. Qué información recopilamos
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Datos de cuenta: correo electrónico, nombre de usuario, contraseña (cifrada)</li>
            <li>Datos de perfil que decidas compartir: nombre para mostrar, biografía, ubicación, avatar, banner</li>
            <li>Contenido que publicas: reseñas, calificaciones, listas, publicaciones en comunidades, mensajes directos</li>
            <li>Datos técnicos básicos necesarios para operar el servicio (sesión de autenticación)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            2. Cómo usamos tu información
          </h2>
          <p>
            Usamos tu información para operar la aplicación: mostrar tu
            perfil y contenido a otros usuarios según tu configuración de
            privacidad, enviarte notificaciones dentro de la app, y
            mantener la seguridad del servicio (incluyendo el sistema de
            moderación de contenido).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            3. Con quién compartimos datos
          </h2>
          <p>Usamos los siguientes proveedores para operar Bobina:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-frame-50">Supabase</strong>: aloja
              nuestra base de datos, autenticación y almacenamiento de
              imágenes
            </li>
            <li>
              <strong className="text-frame-50">TMDb</strong>: fuente de
              los datos de películas y series (no recibe tus datos
              personales, solo hacemos consultas de catálogo)
            </li>
            <li>
              <strong className="text-frame-50">Google AdSense</strong>{" "}
              (si está activo): puede usar cookies para mostrar anuncios;
              consulta su propia política de privacidad
            </li>
          </ul>
          <p className="mt-2">
            No vendemos tu información personal a terceros.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            4. Tus derechos
          </h2>
          <p>
            Puedes editar o eliminar la mayoría de tu contenido (reseñas,
            listas, publicaciones) directamente desde la aplicación. Para
            solicitar la eliminación completa de tu cuenta y datos
            asociados, escríbenos a{" "}
            <a
              href="mailto:bobinamovies@gmail.com"
              className="text-marquee-400 hover:underline"
            >
              bobinamovies@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            5. Cookies
          </h2>
          <p>
            Usamos una cookie de sesión estrictamente necesaria para
            mantenerte conectado (gestionada por Supabase Auth). No usamos
            cookies de rastreo publicitario propias; si los anuncios están
            activos, el proveedor de anuncios puede usar sus propias
            cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            6. Seguridad
          </h2>
          <p>
            Tomamos medidas razonables para proteger tu información
            (contraseñas cifradas, conexiones seguras, control de acceso a
            nivel de fila en la base de datos). Ningún sistema es 100%
            seguro.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            7. Cambios a esta política
          </h2>
          <p>
            Podemos actualizar esta política ocasionalmente. Te
            notificaremos de cambios importantes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            8. Contacto
          </h2>
          <p>
            Para preguntas sobre privacidad o solicitar la eliminación de
            tus datos:{" "}
            <a
              href="mailto:bobinamovies@gmail.com"
              className="text-marquee-400 hover:underline"
            >
              bobinamovies@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
