import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para Client Components ("use client").
// Usa las variables públicas — nunca pongas aquí la service_role key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
