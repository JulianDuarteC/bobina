"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guion bajo"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    setServerError(null);

    // El username viaja en user_metadata; un trigger en Postgres
    // (ver README) crea automáticamente la fila en `profiles`.
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { username: values.username } },
    });

    if (error) {
      setServerError(
        error.message === "User already registered"
          ? "Ya existe una cuenta con ese correo."
          : "No pudimos crear tu cuenta. Intenta de nuevo."
      );
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="ticket-card max-w-sm px-8 py-10 text-center">
          <h1 className="font-display text-2xl tracking-marquee text-frame-50">
            Revisa tu correo
          </h1>
          <p className="mt-3 font-body text-sm text-frame-200/80">
            Te enviamos un enlace de verificación. Confírmalo para activar tu
            cuenta.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="ticket-card w-full max-w-sm px-8 py-10">
        <h1 className="mb-6 text-center font-display text-2xl tracking-marquee text-frame-50">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="username" className="field-label">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="field-input"
              placeholder="cinefilo_92"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-marquee-400">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field-input"
              placeholder="tu@correo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-marquee-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="field-input"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-marquee-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-marquee-400">{serverError}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-frame-200/70">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-marquee-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
