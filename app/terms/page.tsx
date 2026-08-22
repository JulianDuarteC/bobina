export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 font-display text-3xl tracking-marquee text-frame-50">
        Términos de Servicio
      </h1>
      <p className="mb-10 font-body text-xs text-frame-200/50">
        Última actualización: 22 de agosto de 2026 — Este es un borrador base, revísalo
        con un abogado antes de publicar la app.
      </p>

      <div className="space-y-8 font-body text-sm leading-relaxed text-frame-100/90">
        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            1. Aceptación de los términos
          </h2>
          <p>
            Al crear una cuenta o usar Bobina ("la aplicación", "el
            servicio"), aceptas estos Términos de Servicio. Si no estás de
            acuerdo, no debes usar la aplicación.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            2. Tu cuenta
          </h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu
            contraseña y de toda la actividad que ocurra en tu cuenta. Debes
            proporcionar información veraz al registrarte. Nos reservamos el
            derecho de suspender o eliminar cuentas que incumplan estos
            términos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            3. Contenido de los usuarios
          </h2>
          <p>
            Conservas todos los derechos sobre el contenido que publicas
            (reseñas, listas, comentarios, mensajes, imágenes de perfil).
            Al publicar contenido, nos otorgas una licencia no exclusiva
            para mostrarlo dentro de la aplicación con el fin de operar el
            servicio.
          </p>
          <p className="mt-2">
            No debes publicar contenido que sea ilegal, difamatorio,
            discriminatorio, que incite al odio o la violencia, que
            constituya acoso, o que infrinja derechos de propiedad
            intelectual de terceros. El contenido reportado y verificado
            puede ser ocultado o eliminado según nuestro{" "}
            <a href="#" className="text-marquee-400 hover:underline">
              sistema de moderación
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            4. Datos de películas y series
          </h2>
          <p>
            Este producto usa la API de TMDb pero no está avalado ni
            certificado por TMDb. Los datos de películas, series, pósters e
            imágenes relacionadas provienen de{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-marquee-400 hover:underline"
            >
              The Movie Database (TMDb)
            </a>{" "}
            y están sujetos a sus propios términos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            5. Conducta prohibida
          </h2>
          <p>
            No está permitido: usar la aplicación con fines ilegales,
            intentar acceder sin autorización a cuentas ajenas, distribuir
            spam o malware, ni intentar interferir con el funcionamiento
            normal del servicio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            6. Terminación
          </h2>
          <p>
            Puedes dejar de usar la aplicación en cualquier momento.
            Podemos suspender o cancelar tu acceso si incumples estos
            términos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            7. Limitación de responsabilidad
          </h2>
          <p>
            La aplicación se ofrece "tal cual", sin garantías de ningún
            tipo. En la medida permitida por la ley, no somos responsables
            por daños indirectos derivados del uso del servicio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            8. Cambios a estos términos
          </h2>
          <p>
            Podemos actualizar estos términos ocasionalmente. Te
            notificaremos de cambios importantes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-frame-50">
            9. Contacto
          </h2>
          <p>
            Para preguntas sobre estos términos:{" "}
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
