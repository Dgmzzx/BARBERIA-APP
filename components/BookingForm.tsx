"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import type { Negocio, Servicio } from "@/lib/types";

type Paso = "servicio" | "horario" | "datos" | "confirmado";

export default function BookingForm({
  negocio,
  servicios,
}: {
  negocio: Negocio;
  servicios: Servicio[];
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
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [fechaInvalida, setFechaInvalida] = useState("");

  const todasLasHoras = generarHoras(negocio.hora_apertura, negocio.hora_cierre);
  const horasDisponibles = todasLasHoras.filter((h) => !horasOcupadas.includes(h));

  function diaEsLaborable(fechaStr: string): boolean {
    const d = new Date(fechaStr + "T12:00:00");
    const jsDay = d.getDay();
    const diaLocal = jsDay === 0 ? 7 : jsDay;
    return negocio.dias_laborales.includes(diaLocal);
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
        <div className="bg-cream text-base rounded-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-end mb-6">
              <div
                className="motion-safe:animate-stamp-in font-mono text-[11px] text-stamp border border-stamp/60 px-2.5 py-0.5 tracking-[0.15em] select-none"
                style={{ transform: "rotate(6deg)" }}
              >
                CONFIRMADO
              </div>
            </div>

            <div className="mb-6">
              <p className="font-display text-2xl sm:text-3xl text-base leading-tight">
                {servicioElegido?.nombre}
              </p>
              <p className="font-mono text-xs text-base/40 mt-1.5">
                {servicioElegido?.duracion_minutos} min
              </p>
            </div>

            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="font-mono text-[10px] text-base/30 uppercase tracking-widest mb-1">
                  Fecha
                </p>
                <p className="font-body text-sm sm:text-base text-base">
                  {fechaFormateada}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-base/30 uppercase tracking-widest mb-1">
                  Hora
                </p>
                <p className="font-mono text-2xl sm:text-3xl text-base leading-none tracking-tight">
                  {hora}
                </p>
              </div>
            </div>

            <div className="border-t border-dashed border-base/20 pt-5">
              <p className="font-display text-lg text-base">
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
      {/* Paso 1: servicio */}
      <section className="motion-safe:animate-fade-up">
        <label className="block font-mono text-[11px] text-accent uppercase tracking-[0.15em] mb-4">
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
                className={`w-full text-left border rounded-sm p-4 transition-all duration-200
                  ${selected
                    ? "border-accent/60 bg-accent/[0.06] border-l-2 border-l-accent"
                    : "border-line hover:border-cream/20 hover:bg-surface/50 border-l-2 border-l-transparent"
                  }`}
              >
                <div className="flex justify-between items-baseline">
                  <span className={`font-display text-lg ${selected ? "text-cream" : "text-cream/90"}`}>
                    {s.nombre}
                  </span>
                  <span className="font-mono text-sm text-accent tabular-nums shrink-0 ml-4">
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
          <label className="block font-mono text-[11px] text-accent uppercase tracking-[0.15em] mb-4">
            Fecha y hora
          </label>
          <div className="space-y-4">
            <input
              type="date"
              value={fecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => alElegirFecha(e.target.value)}
              className="w-full bg-surface border border-line rounded-sm px-4 py-3
                         font-mono text-sm text-cream/90 placeholder-cream/20
                         focus:outline-none focus:border-accent/40
                         transition-colors"
            />

            {fechaInvalida && (
              <p className="font-mono text-xs text-cream/40">{fechaInvalida}</p>
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
                    className={`font-mono text-sm border rounded-sm py-2.5 px-2 transition-all duration-150
                      ${hora === h
                        ? "bg-accent text-base border-accent font-medium"
                        : "border-line text-cream/70 hover:border-accent/30 hover:text-cream/90"
                      }`}
                  >
                    {h}
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
          <label className="block font-mono text-[11px] text-accent uppercase tracking-[0.15em]">
            Tus datos
          </label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-surface border border-line rounded-sm px-4 py-3
                         font-body text-sm text-cream/90 placeholder-cream/20
                         focus:outline-none focus:border-accent/40
                         transition-colors"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-surface border border-line rounded-sm px-4 py-3
                         font-body text-sm text-cream/90 placeholder-cream/20
                         focus:outline-none focus:border-accent/40
                         transition-colors"
            />

            {error && (
              <p className="font-mono text-xs text-stamp">{error}</p>
            )}

            <button
              onClick={confirmarCita}
              disabled={!nombre || !telefono || enviando}
              className="w-full bg-accent text-base text-sm font-medium rounded-sm py-3.5
                         tracking-wider transition-all duration-200
                         hover:bg-accent/90
                         disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-accent"
            >
              {enviando ? "Reservando..." : "Confirmar cita"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function generarHoras(apertura: string, cierre: string): string[] {
  const horas: string[] = [];
  let [h, m] = apertura.split(":").map(Number);
  const [hFin, mFin] = cierre.split(":").map(Number);

  while (h < hFin || (h === hFin && m < mFin)) {
    horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }
  return horas;
}
