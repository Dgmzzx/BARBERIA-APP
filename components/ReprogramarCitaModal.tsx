"use client";

import { useState, useEffect } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import {
  formatearHora12h,
  formatearFechaLarga,
  obtenerRangosDelDia,
} from "@/lib/helpers";
import type { Horario } from "@/lib/types";

const claseEtiqueta =
  "block text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55";

export default function ReprogramarCitaModal({
  cita,
  horarios,
  onConfirm,
  onClose,
}: {
  cita: {
    id: string;
    negocio_id: string;
    fecha: string;
    hora: string;
    servicios: { nombre: string } | null;
  };
  horarios: Horario[];
  onConfirm: (fecha: string, hora: string) => void;
  onClose: () => void;
}) {
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [fechaInvalida, setFechaInvalida] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onClose]);

  function diaEsLaborable(fechaStr: string): boolean {
    const d = new Date(fechaStr + "T12:00:00");
    const diaLocal = d.getDay() === 0 ? 7 : d.getDay();
    return horarios.some((h) => h.dia_semana === diaLocal);
  }

  async function alElegirFecha(fechaStr: string) {
    setNuevaFecha(fechaStr);
    setNuevaHora("");
    setHorasDisponibles([]);
    setFechaInvalida("");

    if (fechaStr < hoy) {
      setFechaInvalida("No puedes seleccionar una fecha pasada.");
      return;
    }

    if (!diaEsLaborable(fechaStr)) {
      setFechaInvalida("Ese día no es laborable.");
      return;
    }

    setCargandoHoras(true);

    const supabase = crearClienteSupabase();
    const { data: bloqueo } = await supabase
      .from("bloqueos")
      .select("id")
      .eq("negocio_id", cita.negocio_id)
      .eq("fecha", fechaStr)
      .maybeSingle();

    if (bloqueo) {
      setFechaInvalida("Ese día está bloqueado (vacaciones, feriado…).");
      setCargandoHoras(false);
      return;
    }

    const d = new Date(fechaStr + "T12:00:00");
    const diaLocal = d.getDay() === 0 ? 7 : d.getDay();
    const rangos = obtenerRangosDelDia(horarios, diaLocal);

    const { data: ocupadas } = await supabase
      .from("citas")
      .select("hora")
      .eq("negocio_id", cita.negocio_id)
      .eq("fecha", fechaStr)
      .neq("estado", "cancelada")
      .neq("id", cita.id);

    const ocupadasSet = new Set((ocupadas ?? []).map((c) => c.hora.slice(0, 5)));
    const horas = generarHoras(rangos).filter((h) => !ocupadasSet.has(h));
    setHorasDisponibles(horas);
    setCargandoHoras(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reprogramar-titulo"
    >
      <div className="fixed inset-0 bg-ink/70" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_32px_80px_-32px_rgba(0,0,0,0.9)] motion-safe:animate-fade-up">
        <header className="flex items-center justify-between gap-3 border-b border-line/60 px-5 py-4">
          <h2
            id="reprogramar-titulo"
            className="font-display text-lg text-cream"
          >
            Reprogramar cita
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cream/55 transition-colors hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <div className="rounded-xl border border-line/70 bg-ink/50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55">
              Cita actual
            </p>
            <p className="mt-1.5 text-sm text-cream">
              {cita.servicios?.nombre ?? "Sin servicio"}
            </p>
            <p className="mt-0.5 text-[13px] text-cream/55">
              {formatearFechaLarga(cita.fecha)} ·{" "}
              <span className="font-mono tabular-nums">
                {formatearHora12h(cita.hora)}
              </span>
            </p>
          </div>

          <div>
            <label htmlFor="nueva-fecha" className={claseEtiqueta}>
              Nueva fecha
            </label>
            <input
              id="nueva-fecha"
              type="date"
              value={nuevaFecha}
              min={hoy}
              onChange={(e) => alElegirFecha(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-cream caret-brass outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-ui focus:border-brass/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-brass/20"
            />
            {fechaInvalida && (
              <p role="alert" className="mt-2 text-[13px] text-red-300">
                {fechaInvalida}
              </p>
            )}
          </div>

          {cargandoHoras && (
            <p className="text-[13px] text-cream/55">
              Buscando horarios disponibles…
            </p>
          )}

          {!cargandoHoras && !fechaInvalida && nuevaFecha && horasDisponibles.length === 0 && (
            <p className="text-[13px] text-cream/55">
              No hay horarios disponibles ese día. Elige otra fecha.
            </p>
          )}

          {!cargandoHoras && horasDisponibles.length > 0 && (
            <div>
              <p className={claseEtiqueta}>Nueva hora</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {horasDisponibles.map((h) => (
                  <button
                    key={h}
                    onClick={() => setNuevaHora(h)}
                    className={`rounded-lg border py-2.5 font-mono text-[13px] tabular-nums transition-colors duration-150 ease-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 ${
                      nuevaHora === h
                        ? "border-brass bg-brass font-semibold text-ink"
                        : "border-line text-cream/70 hover:border-brass/40 hover:text-cream"
                    }`}
                  >
                    {formatearHora12h(h)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-line px-4 py-3 text-sm text-cream/70 transition-colors hover:border-cream/25 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(nuevaFecha, nuevaHora)}
              disabled={!nuevaFecha || !nuevaHora}
              className="flex-1 rounded-xl bg-brass px-4 py-3 text-sm font-semibold text-ink transition-[filter,transform,opacity] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Reprogramar
            </button>
          </div>
        </div>
      </div>
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
