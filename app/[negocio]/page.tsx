import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { formatearHora12h } from "@/lib/helpers";
import type { Horario } from "@/lib/types";

export const dynamic = "force-dynamic";

const DIAS_NOMBRE = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const PASOS = [
  { numero: "1", titulo: "Elige tu servicio" },
  { numero: "2", titulo: "Escoge fecha y hora" },
  { numero: "3", titulo: "Comparte tus datos" },
];

function formatearSemana(dias: number[]): string {
  const orden = [...dias].sort((a, b) => a - b);
  const rangos: string[] = [];
  let inicio = orden[0];
  let prev = orden[0];
  for (let i = 1; i <= orden.length; i++) {
    if (orden[i] === prev + 1) {
      prev = orden[i];
      continue;
    }
    rangos.push(
      inicio === prev
        ? DIAS_NOMBRE[inicio - 1]
        : `${DIAS_NOMBRE[inicio - 1]}–${DIAS_NOMBRE[prev - 1]}`,
    );
    inicio = orden[i];
    prev = orden[i];
  }
  return rangos.join(", ");
}

function formatearHorario(horarios: Horario[]): string | null {
  if (horarios.length === 0) return null;
  const apertura = horarios
    .map((h) => h.apertura)
    .sort()
    .find(Boolean)!;
  const cierre = horarios
    .map((h) => h.cierre)
    .sort()
    .reverse()
    .find(Boolean)!;
  const semana = formatearSemana([...new Set(horarios.map((h) => h.dia_semana))]);
  return `${semana} · ${formatearHora12h(apertura.slice(0, 5))} a ${formatearHora12h(cierre.slice(0, 5))}`;
}

export default async function PaginaReserva({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*, horarios(*)")
    .eq("slug", params.negocio)
    .eq("activo", true)
    .single();

  if (!negocio) notFound();

  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .eq("negocio_id", negocio.id)
    .eq("activo", true)
    .order("precio");

  const horarios = (negocio.horarios ?? []) as Horario[];
  const textoHorario = formatearHorario(horarios);

  return (
    <main className="min-h-dvh px-4 sm:px-6 py-10 sm:py-12 lg:py-16 max-w-6xl mx-auto">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        {/* Escaparate */}
        <aside className="text-center sm:text-left lg:sticky lg:top-8 lg:self-start">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-cream">
            {negocio.nombre}
          </h1>

          {textoHorario && (
            <p className="font-mono text-xs text-brass mt-4 tracking-[0.12em] uppercase">
              {textoHorario}
            </p>
          )}
          {negocio.direccion && (
            <p className="font-mono text-xs text-cream/55 mt-1.5 tracking-wider uppercase">
              {negocio.direccion}
            </p>
          )}

          <p className="font-body text-sm text-cream/65 mt-5">
            Agenda tu lugar en la silla. Sin llamadas ni esperas: elige el
            servicio, escoge fecha y hora, y listo.
          </p>

          <div className="mt-8 sm:mt-10">
            <p className="font-mono text-[11px] text-brass uppercase tracking-[0.15em] mb-4">
              Así se reserva
            </p>
            <ol className="space-y-3">
              {PASOS.map((p) => (
                <li key={p.numero} className="flex items-center justify-center gap-3 sm:justify-start">
                  <span className="font-mono text-xs text-brass w-6 h-6 shrink-0 flex items-center justify-center border border-brass/40 rounded-full">
                    {p.numero}
                  </span>
                  <span className="font-body text-sm text-cream">{p.titulo}</span>
                </li>
              ))}
            </ol>
          </div>

          {negocio.telefono && (
            <p className="mt-8 font-mono text-xs text-cream/55">
              ¿Dudas? Llámanos al <span className="text-brass">{negocio.telefono}</span>
            </p>
          )}
        </aside>

        {/* Mostrador */}
        <div className="min-w-0">
          <BookingForm
            negocio={negocio}
            servicios={servicios ?? []}
            horarios={horarios}
          />
        </div>
      </div>

      <footer className="mt-16 lg:mt-20 text-center font-mono text-[11px] text-cream/55 tracking-wider">
        {negocio.telefono && <p className="mb-1">{negocio.telefono}</p>}
        {negocio.nombre && <p>{negocio.nombre}</p>}
      </footer>
    </main>
  );
}