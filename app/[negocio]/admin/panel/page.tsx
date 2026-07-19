import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function Dashboard({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", params.negocio)
    .single();

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

  const citasHoyCount = citasHoy?.length ?? 0;
  const completadasHoy =
    citasHoy?.filter((c) => c.estado === "completada").length ?? 0;

  return (
    <div className="max-w-4xl">
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
          <p className="font-display text-3xl text-accent">{pendientes}</p>
        </div>
        <div className="border border-line rounded-lg p-5 bg-surface/50">
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-2">
            Completadas hoy
          </p>
          <p className="font-display text-3xl text-cream">{completadasHoy}</p>
        </div>
      </div>

      <h2 className="font-display text-lg mb-4">Citas de hoy</h2>

      {!citasHoy || citasHoy.length === 0 ? (
        <p className="text-cream/40 text-sm">
          No hay citas programadas para hoy.
        </p>
      ) : (
        <div className="space-y-2">
          {citasHoy.map((cita) => (
            <div
              key={cita.id}
              className="border border-line rounded-lg p-4 bg-surface/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-accent tabular-nums w-12">
                  {cita.hora.slice(0, 5)}
                </span>
                <div>
                  <p className="font-medium text-sm">{cita.nombre_cliente}</p>
                  <p className="text-xs text-cream/40">
                    {cita.servicios?.nombre}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  cita.estado === "completada"
                    ? "bg-green-900/20 text-green-400"
                    : cita.estado === "cancelada"
                      ? "bg-red-900/20 text-red-400"
                      : "bg-accent/15 text-accent"
                }`}
              >
                {cita.estado === "pendiente"
                  ? "Pendiente"
                  : cita.estado === "completada"
                    ? "Completada"
                    : "Cancelada"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
