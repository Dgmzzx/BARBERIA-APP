"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import type { Negocio, Servicio, Horario } from "@/lib/types";
import { formatearHora12h, obtenerRangosDelDia } from "@/lib/helpers";

type Paso = "servicio" | "horario" | "datos" | "confirmado";

export default function BookingForm({
  negocio,
  servicios,
  horarios: horariosProp,
}: {
  negocio: Negocio;
  servicios: Servicio[];
  horarios: Horario[];
}) {
  const [paso, setPaso] = useState<Paso>("servicio");
  const [servicioElegido, setServicioElegido] = useState<Servicio | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [horasPosibles, setHorasPosibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [fechaInvalida, setFechaInvalida] = useState("");

  const horasDisponibles = horasPosibles.filter((h) => !horasOcupadas.includes(h));
  const horarios = horariosProp;

  function diaEsLaborable(fechaStr: string): boolean {
    const d = new Date(fechaStr + "T12:00:00");
    const jsDay = d.getDay();
    const diaLocal = jsDay === 0 ? 7 : jsDay;
    return horarios.some((h) => h.dia_semana === diaLocal);
  }

  async function fechaEstaBloqueada(fechaStr: string): Promise<boolean> {
    const supabase = crearClienteSupabase();
    const { data } = await supabase
      .from("bloqueos")
      .select("id")
      .eq("negocio_id", negocio.id)
      .eq("fecha", fechaStr)
      .maybeSingle();
    return !!data;
  }

  async function alElegirFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setHora("");
    setError("");
    setHorasOcupadas([]);
    setFechaInvalida("");

    if (!diaEsLaborable(nuevaFecha)) {
      setFechaInvalida("Ese día no es laborable.");
      return;
    }

    const bloqueada = await fechaEstaBloqueada(nuevaFecha);
    if (bloqueada) {
      setFechaInvalida("Ese día está bloqueado (vacaciones, feriado…).");
      return;
    }

    const d = new Date(nuevaFecha + "T12:00:00");
    const diaLocal = d.getDay() === 0 ? 7 : d.getDay();
    const rangos = obtenerRangosDelDia(horarios, diaLocal);
    setHorasPosibles(rangos.length > 0 ? generarHoras(rangos) : []);

    setCargandoHoras(true);

    const supabase = crearClienteSupabase();
    const { data } = await supabase
      .from("citas")
      .select("hora")
      .eq("negocio_id", negocio.id)
      .eq("fecha", nuevaFecha)
      .neq("estado", "cancelada");

    setHorasOcupadas((data ?? []).map((c) => c.hora.slice(0, 5)));
    setCargandoHoras(false);
  }

  async function confirmarCita() {
    if (!servicioElegido || !fecha || !hora || !nombre || !telefono) return;
    setEnviando(true);
    setError("");

    const respuesta = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        negocio_id: negocio.id,
        servicio_id: servicioElegido.id,
        nombre_cliente: nombre,
        telefono_cliente: telefono,
        fecha,
        hora,
      }),
    });

    setEnviando(false);

    if (!respuesta.ok) {
      const data = await respuesta.json().catch(() => null);
      setError(data?.error ?? "No se pudo reservar la cita. Intenta de nuevo.");
      if (respuesta.status === 409) alElegirFecha(fecha);
      return;
    }
    setPaso("confirmado");
  }

  if (paso === "confirmado") {
    const fechaObj = new Date(fecha + "T12:00:00");
    const fechaFormateada = fechaObj.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="motion-safe:animate-fade-up">
        <div className="bg-cream text-ink rounded-md overflow-hidden shadow-lg">
          <div className="p-6 sm:p-8">
            <div className="flex justify-end mb-6">
              <div
                className="motion-safe:animate-stamp-in font-display text-sm text-signal border border-signal/60 px-3 py-1 tracking-[0.15em] select-none"
                style={{ transform: "rotate(6deg)" }}
              >
                CONFIRMADO
              </div>
            </div>

            <div className="mb-6">
              <p className="font-display text-2xl sm:text-3xl text-ink leading-tight">
                {servicioElegido?.nombre}
              </p>
              <p className="font-mono text-xs text-ink/40 mt-1.5">
                {servicioElegido?.duracion_minutos} min
              </p>
            </div>

            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="font-mono text-[10px] text-ink/30 uppercase tracking-widest mb-1">
                  Fecha
                </p>
                <p className="font-body text-sm sm:text-base text-ink">
                  {fechaFormateada}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-ink/30 uppercase tracking-widest mb-1">
                  Hora
                </p>
                <p className="font-mono text-2xl sm:text-3xl text-ink leading-none tracking-tight">
                  {formatearHora12h(hora)}
                </p>
              </div>
            </div>

            <div className="border-t border-dashed border-ink/20 pt-5">
              <p className="font-display text-lg text-ink">
                {nombre}, te esperamos
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Barber pole divider */}
      <div className="barber-rule" role="separator" />

      {/* Paso 1: servicio */}
      <section className="motion-safe:animate-fade-up">
        <label className="block font-mono text-[11px] text-brass uppercase tracking-[0.15em] mb-4">
          Servicio
        </label>

        {servicios.length === 0 && (
          <p className="font-mono text-xs text-cream/30">
            No hay servicios disponibles por el momento.
          </p>
        )}

        <div className="space-y-2">
          {servicios.map((s) => {
            const selected = servicioElegido?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setServicioElegido(s);
                  setPaso("horario");
                }}
                className={`w-full text-left border rounded-md p-4 transition-all duration-150
                  ${selected
                    ? "border-signal/60 bg-signal/[0.06] border-l-2 border-l-signal"
                    : "border-line hover:border-brass/30 hover:bg-surface/50 border-l-2 border-l-transparent"
                  }`}
              >
                <div className="flex justify-between items-baseline">
                  <span className={`font-display text-lg ${selected ? "text-cream" : "text-cream/90"}`}>
                    {s.nombre}
                  </span>
                  <span className="font-mono text-sm text-brass tabular-nums shrink-0 ml-4">
                    ${s.precio}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-cream/30 tracking-wide">
                  {s.duracion_minutos} min
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Paso 2: fecha y hora */}
      {servicioElegido && (
        <section className="motion-safe:animate-fade-up">
          <label className="block font-mono text-[11px] text-brass uppercase tracking-[0.15em] mb-4">
            Fecha y hora
          </label>
          <div className="space-y-4">
            <input
              type="date"
              value={fecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => alElegirFecha(e.target.value)}
              className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-sm text-cream placeholder:text-muted
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />

            {fechaInvalida && (
              <p className="font-mono text-xs text-signal">{fechaInvalida}</p>
            )}

            {cargandoHoras && (
              <p className="font-mono text-xs text-cream/30">Buscando horarios disponibles...</p>
            )}

            {!cargandoHoras && !fechaInvalida && fecha && horasDisponibles.length === 0 && (
              <p className="font-mono text-xs text-cream/30">
                No hay horarios disponibles ese día. Elige otra fecha.
              </p>
            )}

            {!cargandoHoras && !fechaInvalida && horasDisponibles.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {horasDisponibles.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHora(h)}
                    className={`font-mono text-sm border rounded-md py-2.5 px-2 transition-all duration-150
                      ${hora === h
                        ? "bg-brass text-ink border-brass font-medium"
                        : "border-line text-cream/70 hover:border-brass/30 hover:text-cream/90"
                      }`}
                  >
                    {formatearHora12h(h)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Paso 3: datos del cliente */}
      {servicioElegido && fecha && hora && !fechaInvalida && (
        <section className="motion-safe:animate-fade-up space-y-4">
          <label className="block font-mono text-[11px] text-brass uppercase tracking-[0.15em]">
            Tus datos
          </label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-sm text-cream placeholder:text-muted
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-sm text-cream placeholder:text-muted
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />

            {error && (
              <p className="font-mono text-xs text-signal">{error}</p>
            )}

            <button
              onClick={confirmarCita}
              disabled={!nombre || !telefono || enviando}
              className="w-full bg-signal text-cream text-sm font-semibold tracking-wide
                         rounded-md px-8 py-3.5
                         shadow-lg shadow-signal/20
                         transition-all duration-150
                         hover:bg-signal/90 active:scale-[0.97]
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {enviando ? "Reservando..." : "Confirmar cita"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function generarHoras(rangos: { apertura: string; cierre: string }[]): string[] {
  const horas: string[] = [];
  for (const { apertura, cierre } of rangos) {
    let [h, m] = apertura.split(":").map(Number);
    const [hFin, mFin] = cierre.split(":").map(Number);
    while (h < hFin || (h === hFin && m < mFin)) {
      horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += 30;
      if (m >= 60) { m = 0; h += 1; }
    }
  }
  return horas;
}
