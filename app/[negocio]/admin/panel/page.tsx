import { crearClienteSupabaseServidor, obtenerNegocio } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import PanelCitas from "@/components/PanelCitas";
import { formatearHora12h } from "@/lib/helpers";
import type { Horario } from "@/lib/types";

export default async function PanelAdmin({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();
  const negocio = await obtenerNegocio(params.negocio);
  if (!negocio) notFound();

  const hoy = new Date().toISOString().split("T")[0];
  const hoyFormateado = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  const { data: citasHoy } = await supabase
    .from("citas")
    .select("*, servicios(nombre)")
    .eq("negocio_id", negocio.id)
    .eq("fecha", hoy)
    .order("hora");

  const { count: pendientes } = await supabase
    .from("citas")
    .select("*", { count: "exact", head: true })
    .eq("negocio_id", negocio.id)
    .eq("estado", "pendiente")
    .gte("fecha", hoy);

  const { data: horarios } = await supabase
    .from("horarios")
    .select("*")
    .eq("negocio_id", negocio.id)
    .order("dia_semana");

  const citasHoyCount = citasHoy?.length ?? 0;
  const completadasHoy =
    citasHoy?.filter((c) => c.estado === "completada").length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-2xl">Dashboard</h1>
        <p className="text-sm text-cream/40 mt-1 capitalize">{hoyFormateado}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border border-line rounded-lg p-5 bg-surface/50">
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-2">
            Citas hoy
          </p>
          <p className="font-display text-3xl text-cream">{citasHoyCount}</p>
        </div>
        <div className="border border-line rounded-lg p-5 bg-surface/50">
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-2">
            Pendientes
          </p>
          <p className="font-display text-3xl text-signal">{pendientes}</p>
        </div>
        <div className="border border-line rounded-lg p-5 bg-surface/50">
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-2">
            Completadas hoy
          </p>
          <p className="font-display text-3xl text-cream">{completadasHoy}</p>
        </div>
      </div>

      <h2 className="font-display text-lg mb-4">Citas</h2>
      <PanelCitas citasIniciales={citasHoy ?? []} horarios={(horarios as Horario[]) ?? []} />
    </div>
  );
}
