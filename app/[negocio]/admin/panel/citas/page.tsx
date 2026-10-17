import { obtenerNegocio, crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Horario } from "@/lib/types";
import PanelCitas from "@/components/PanelCitas";

export default async function PaginaCitas({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();
  const negocio = await obtenerNegocio(params.negocio);
  if (!negocio) notFound();

  const { data: citas } = await supabase
    .from("citas")
    .select("*, servicios(nombre)")
    .eq("negocio_id", negocio.id)
    .order("fecha", { ascending: false })
    .order("hora", { ascending: true });

  const { data: horarios } = await supabase
    .from("horarios")
    .select("*")
    .eq("negocio_id", negocio.id);

  const total = citas?.length ?? 0;

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl leading-tight text-cream md:text-3xl">
          Citas
        </h1>
        <p className="mt-1.5 text-sm text-cream/55">
          {total === 1 ? "1 cita en total" : `${total} citas en total`}
        </p>
      </header>
      <div className="mt-8">
        <PanelCitas
          negocioId={negocio.id}
          citasIniciales={citas ?? []}
          horarios={(horarios as Horario[]) ?? []}
        />
      </div>
    </div>
  );
}
