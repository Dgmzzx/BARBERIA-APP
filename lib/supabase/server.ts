import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

// Cliente de Supabase para usar en Server Components / rutas del servidor
export function crearClienteSupabaseServidor() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// Cachea la consulta del negocio por slug dentro del mismo request.
// Así layout y página comparten la misma llamada en vez de hacer dos viajes.
export const obtenerNegocio = cache(async (slug: string) => {
  const supabase = crearClienteSupabaseServidor();
  const { data } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
});
