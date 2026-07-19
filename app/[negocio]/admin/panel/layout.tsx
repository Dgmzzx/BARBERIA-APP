import { obtenerNegocio } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { negocio: string };
}) {
  const negocio = await obtenerNegocio(params.negocio);
  if (!negocio) notFound();

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
