"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { formatearHora12h, obtenerRangosDelDia } from "@/lib/helpers";
import type { Horario } from "@/lib/types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-midnight-surface-container border border-midnight-outline rounded-lg w-full max-w-md motion-safe:animate-fade-up">
        <div className="sticky top-0 bg-midnight-surface-container border-b border-midnight-outline/50 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-midnight-on-surface">
            Reprogramar cita
          </h2>
          <button
            onClick={onClose}
            className="text-midnight-on-surface-variant/60 hover:text-midnight-on-surface transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="bg-midnight-surface-container-high/50 border border-midnight-outline/30 rounded-md p-3 space-y-1">
            <p className="text-xs text-midnight-on-surface-variant/60">
              Cita actual
            </p>
            <p className="text-sm text-midnight-on-surface">
              {cita.servicios?.nombre ?? "Sin servicio"}
            </p>
            <p className="text-xs text-midnight-on-surface-variant">
              {cita.fecha} · {formatearHora12h(cita.hora)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-[11px] text-midnight-secondary uppercase tracking-[0.15em]">
              Nueva fecha
            </label>
            <input
              type="date"
              value={nuevaFecha}
              min={hoy}
              onChange={(e) => alElegirFecha(e.target.value)}
              className="w-full bg-midnight-surface border border-midnight-outline rounded-md px-4 py-3
                         font-body text-sm text-midnight-on-surface placeholder:text-midnight-on-surface-variant/60
                         focus:outline-none focus:border-midnight-secondary/50 focus:ring-1 focus:ring-midnight-secondary/20
                         transition-all duration-150"
            />
            {fechaInvalida && (
              <p className="font-mono text-xs text-midnight-error">{fechaInvalida}</p>
            )}
          </div>

          {cargandoHoras && (
            <p className="font-mono text-xs text-midnight-on-surface-variant/60">
              Buscando horarios disponibles...
            </p>
          )}

          {!cargandoHoras && !fechaInvalida && nuevaFecha && horasDisponibles.length === 0 && (
            <p className="font-mono text-xs text-midnight-on-surface-variant/60">
              No hay horarios disponibles ese día. Elige otra fecha.
            </p>
          )}

          {!cargandoHoras && horasDisponibles.length > 0 && (
            <div className="space-y-2">
              <label className="block font-mono text-[11px] text-midnight-secondary uppercase tracking-[0.15em]">
                Nueva hora
              </label>
              <div className="grid grid-cols-4 gap-2">
                {horasDisponibles.map((h) => (
                  <button
                    key={h}
                    onClick={() => setNuevaHora(h)}
                    className={`font-mono text-sm border rounded-md py-2.5 px-2 transition-all duration-150
                      ${nuevaHora === h
                        ? "bg-midnight-secondary text-midnight-on-secondary border-midnight-secondary font-medium"
                        : "border-midnight-outline text-midnight-on-surface-variant/70 hover:border-midnight-secondary/30 hover:text-midnight-on-surface/90"
                      }`}
                  >
                    {formatearHora12h(h)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 text-xs border border-midnight-outline rounded-full px-4 py-2.5 text-midnight-on-surface-variant hover:border-midnight-on-surface-variant/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(nuevaFecha, nuevaHora)}
              disabled={!nuevaFecha || !nuevaHora}
              className="flex-1 text-xs bg-midnight-secondary text-midnight-on-secondary rounded-full px-4 py-2.5 font-semibold
                         transition-all duration-150 hover:bg-midnight-secondary/90 active:scale-[0.97]
                         disabled:opacity-30 disabled:cursor-not-allowed"
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
