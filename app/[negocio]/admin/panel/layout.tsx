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
    <div className="flex min-h-dvh flex-col bg-ink lg:flex-row">
      <AdminSidebar
        negocioSlug={params.negocio}
        negocioNombre={negocio?.nombre ?? "Admin"}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
