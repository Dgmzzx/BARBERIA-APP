import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PaginaConfig({
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

  const diasMap: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl">Configuración</h1>
        <p className="text-sm text-cream/40 mt-1">Datos del negocio</p>
      </div>

      <div className="space-y-4">
        <div className="border border-line rounded-lg p-5 bg-surface/30">
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">
            Nombre
          </p>
          <p className="font-display text-lg">{negocio.nombre}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-line rounded-lg p-5 bg-surface/30">
            <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">
              Apertura
            </p>
            <p className="font-mono text-lg">
              {negocio.hora_apertura.slice(0, 5)}
            </p>
          </div>
          <div className="border border-line rounded-lg p-5 bg-surface/30">
            <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">
              Cierre
            </p>
            <p className="font-mono text-lg">
              {negocio.hora_cierre.slice(0, 5)}
            </p>
          </div>
        </div>

        <div className="border border-line rounded-lg p-5 bg-surface/30">
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-3">
            Días laborales
          </p>
          <div className="flex flex-wrap gap-2">
            {negocio.dias_laborales.map((d: number) => (
              <span
                key={d}
                className="text-xs border border-line rounded-full px-3 py-1 text-cream/60"
              >
                {diasMap[d]}
              </span>
            ))}
          </div>
        </div>

        {negocio.direccion && (
          <div className="border border-line rounded-lg p-5 bg-surface/30">
            <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">
              Dirección
            </p>
            <p className="text-sm">{negocio.direccion}</p>
          </div>
        )}

        {negocio.telefono && (
          <div className="border border-line rounded-lg p-5 bg-surface/30">
            <p className="text-xs text-cream/40 uppercase tracking-widest mb-1">
              Teléfono
            </p>
            <p className="font-mono text-sm">{negocio.telefono}</p>
          </div>
        )}
      </div>
    </div>
  );
}
