import { cache } from "react";
import { notFound } from "next/navigation";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import BookingForm from "@/components/BookingForm";
import { formatearHora12h } from "@/lib/helpers";
import type { Horario } from "@/lib/types";

const DIAS_NOMBRE = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const PASOS = [
  { numero: "1", titulo: "Elige tu servicio" },
  { numero: "2", titulo: "Escoge fecha y hora" },
  { numero: "3", titulo: "Comparte tus datos" },
];

export const obtenerNegocioConHorarios = cache(async (slug: string) => {
  const supabase = crearClienteSupabaseServidor();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*, horarios(*)")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  return negocio;
});

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

export default async function PaginaReserva({ slug }: { slug: string }) {
  const negocio = await obtenerNegocioConHorarios(slug);

  if (!negocio) notFound();

  const supabase = crearClienteSupabaseServidor();

  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .eq("negocio_id", negocio.id)
    .eq("activo", true)
    .order("precio");

  const horarios = (negocio.horarios ?? []) as Horario[];
  const textoHorario = formatearHorario(horarios);

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
      <div
        aria-hidden="true"
        className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]"
      />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 xl:gap-16">
        {/* Escaparate */}
        <aside className="text-center sm:text-left lg:sticky lg:top-10 lg:self-start">
          <h1 className="text-balance font-display text-4xl leading-[1.05] tracking-[-0.01em] text-cream sm:text-5xl">
            {negocio.nombre}
          </h1>

          {textoHorario && (
            <p className="mt-4 text-[13px] font-medium tracking-wide text-brass">
              {textoHorario}
            </p>
          )}
          {negocio.direccion && (
            <p className="mt-1.5 text-[13px] text-white/50">{negocio.direccion}</p>
          )}

          <p className="mx-auto mt-5 max-w-prose text-[15px] leading-relaxed text-white/60 sm:mx-0">
            Agenda tu lugar en la silla. Sin llamadas ni esperas: elige el
            servicio, escoge fecha y hora, y listo.
          </p>

          <div className="mt-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
              Así se reserva
            </p>
            <ol className="mt-5 space-y-3.5">
              {PASOS.map((p) => (
                <li
                  key={p.numero}
                  className="flex items-center justify-center gap-3.5 sm:justify-start"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[12px] font-medium tabular-nums text-brass">
                    {p.numero}
                  </span>
                  <span className="text-[15px] text-cream/90">{p.titulo}</span>
                </li>
              ))}
            </ol>
          </div>

          {negocio.telefono && (
            <p className="mt-8 text-[13px] text-white/50">
              ¿Dudas? Llámanos al{" "}
              <span className="whitespace-nowrap font-medium text-brass">
                {negocio.telefono}
              </span>
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

      <footer className="mt-16 text-center text-xs text-white/50 lg:mt-20">
        {negocio.telefono && <p className="mb-1">{negocio.telefono}</p>}
        {negocio.nombre && <p>{negocio.nombre}</p>}
      </footer>
    </main>
  );
}
