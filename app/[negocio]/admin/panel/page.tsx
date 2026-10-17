import { crearClienteSupabaseServidor, obtenerNegocio } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PanelCitas from "@/components/PanelCitas";
import { formatearFechaLarga } from "@/lib/helpers";
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
  const hoyFormateado = formatearFechaLarga(hoy);

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
  const pendientesCount = pendientes ?? 0;
  const completadasHoy =
    citasHoy?.filter((c) => c.estado === "completada").length ?? 0;

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl leading-tight text-cream md:text-3xl">
          {hoyFormateado}
        </h1>
        <p className="mt-1.5 text-sm text-cream/55">
          {citasHoyCount === 0
            ? "Sin citas agendadas para hoy"
            : citasHoyCount === 1
              ? "1 cita agendada para hoy"
              : `${citasHoyCount} citas agendadas para hoy`}
        </p>
      </header>

      <section
        aria-label="Resumen del día"
        className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface/50"
      >
        <dl className="grid grid-cols-3 divide-x divide-line/70">
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55">
              Citas hoy
            </dt>
            <dd className="mt-1.5 font-display text-3xl tabular-nums text-cream">
              {citasHoyCount}
            </dd>
          </div>
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55">
              Pendientes
            </dt>
            <dd
              className={`mt-1.5 font-display text-3xl tabular-nums ${
                pendientesCount > 0 ? "text-brass" : "text-cream/40"
              }`}
            >
              {pendientesCount}
            </dd>
          </div>
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55">
              Completadas
            </dt>
            <dd className="mt-1.5 font-display text-3xl tabular-nums text-cream">
              {completadasHoy}
            </dd>
          </div>
        </dl>
      </section>

      <h2 className="mb-4 mt-10 font-display text-xl text-cream">
        Agenda de hoy
      </h2>
      <PanelCitas
        negocioId={negocio.id}
        citasIniciales={citasHoy ?? []}
        horarios={(horarios as Horario[]) ?? []}
      />
    </div>
  );
}
