import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import AdminSidebar from "@/components/AdminSidebar";

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre")
    .eq("slug", params.negocio)
    .single();

  return (
    <div className="flex min-h-screen bg-base">
      <AdminSidebar
        negocioSlug={params.negocio}
        negocioNombre={negocio?.nombre ?? "Admin"}
      />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
