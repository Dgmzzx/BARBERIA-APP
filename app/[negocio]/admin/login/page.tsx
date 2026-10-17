import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import LoginForm from "@/components/LoginForm";

export default async function LoginAdmin({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();
  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre")
    .eq("slug", params.negocio)
    .single();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden="true"
        className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[440px]"
      />
      <LoginForm
        negocioSlug={params.negocio}
        negocioNombre={negocio?.nombre ?? null}
      />
    </main>
  );
}
