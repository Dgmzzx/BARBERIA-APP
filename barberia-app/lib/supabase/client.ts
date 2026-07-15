import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para usar en componentes del lado del navegador (formularios, etc.)
export function crearClienteSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
