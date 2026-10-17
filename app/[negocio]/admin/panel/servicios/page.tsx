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
    <div>
      <header>
        <h1 className="font-display text-2xl leading-tight text-cream md:text-3xl">
          Servicios
        </h1>
        <p className="mt-1.5 text-sm text-cream/55">
          Lo que tus clientes ven y reservan en la página pública.
        </p>
      </header>
      <div className="mt-8">
        <ServiciosList
          serviciosIniciales={servicios ?? []}
          negocioId={negocio.id}
        />
      </div>
    </div>
  );
}
