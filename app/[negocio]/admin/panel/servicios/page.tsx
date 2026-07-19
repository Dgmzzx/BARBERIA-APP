import { obtenerNegocio, crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ServiciosList from "@/components/ServiciosList";

export default async function PaginaServicios({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();
  const negocio = await obtenerNegocio(params.negocio);
  if (!negocio) notFound();

  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .eq("negocio_id", negocio.id)
    .order("precio");

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl">Servicios</h1>
        <p className="text-sm text-cream/40 mt-1">
          {servicios?.length ?? 0} servicio
          {(servicios?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>
      <ServiciosList
        serviciosIniciales={servicios ?? []}
        negocioId={negocio.id}
      />
    </div>
  );
}
