"use client";

import { useState } from "react";
import type { Negocio, Horario } from "@/lib/types";
import {
  descomponerHora,
  componerHora,
  formatearHora12h,
} from "@/lib/helpers";
import SwitchEstado from "./SwitchEstado";

type Bloqueo = {
  id: string;
  fecha: string;
  motivo: string | null;
};

type HorarioEdit = {
  dia_semana: number;
  apertura: string;
  cierre: string;
  orden: number;
};

const DIAS: { n: number; label: string }[] = [
  { n: 1, label: "Lunes" },
  { n: 2, label: "Martes" },
  { n: 3, label: "Miércoles" },
  { n: 4, label: "Jueves" },
  { n: 5, label: "Viernes" },
  { n: 6, label: "Sábado" },
  { n: 7, label: "Domingo" },
];

const claseCampo =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-cream caret-brass outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-ui placeholder:text-white/50 focus:border-brass/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-brass/20";

const claseEtiqueta =
  "block text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55";

const claseIconoEliminar =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-cream/55 transition-colors hover:bg-white/[0.05] hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40";

function horariosIniciales(negocio: Negocio): HorarioEdit[] {
  const h = (negocio as any).horarios as Horario[] | undefined;
  if (!h) return [];
  return h.map((h) => ({
    dia_semana: h.dia_semana,
    apertura: h.apertura.slice(0, 5),
    cierre: h.cierre.slice(0, 5),
    orden: h.orden,
  }));
}

export default function AdminConfigForm({
  negocio,
  bloqueosIniciales,
}: {
  negocio: Negocio;
  bloqueosIniciales: Bloqueo[];
}) {
  const [horarios, setHorarios] = useState<HorarioEdit[]>(horariosIniciales(negocio));
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>(bloqueosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState("");
  const [error, setError] = useState("");

  const [diaExpandido, setDiaExpandido] = useState<number | null>(null);
  const [nuevoBloqueoFecha, setNuevoBloqueoFecha] = useState("");
  const [nuevoBloqueoMotivo, setNuevoBloqueoMotivo] = useState("");
  const [creandoBloqueo, setCreandoBloqueo] = useState(false);

  function bloquesDelDia(dia: number) {
    return horarios
      .filter((h) => h.dia_semana === dia)
      .sort((a, b) => a.orden - b.orden);
  }

  function toggleDia(n: number) {
    const tieneBloques = bloquesDelDia(n).length > 0;
    if (tieneBloques) {
      setHorarios((prev) => prev.filter((h) => h.dia_semana !== n));
    } else {
      const maxOrden = horarios
        .filter((h) => h.dia_semana === n)
        .reduce((max, h) => Math.max(max, h.orden), -1);
      setHorarios((prev) => [
        ...prev,
        { dia_semana: n, apertura: "09:00", cierre: "17:00", orden: maxOrden + 1 },
      ]);
    }
  }

  function agregarBloque(dia: number) {
    const bloques = bloquesDelDia(dia);
    const ultimo = bloques[bloques.length - 1];
    const nuevaApertura = ultimo?.cierre ?? "09:00";
    const nuevoCierre = sumarHora(nuevaApertura, 8);
    setHorarios((prev) => [
      ...prev,
      { dia_semana: dia, apertura: nuevaApertura, cierre: nuevoCierre, orden: bloques.length },
    ]);
  }

  function eliminarBloque(dia: number, orden: number) {
    setHorarios((prev) => prev.filter((h) => !(h.dia_semana === dia && h.orden === orden)));
  }

  function actualizarBloque(dia: number, orden: number, campo: "apertura" | "cierre", valor: string) {
    setHorarios((prev) =>
      prev.map((h) =>
        h.dia_semana === dia && h.orden === orden ? { ...h, [campo]: valor } : h
      )
    );
  }

  function sumarHora(hora: string, horasSumar: number): string {
    const [h, m] = hora.split(":").map(Number);
    const totalMin = h * 60 + m + horasSumar * 60;
    const nuevaH = Math.floor(totalMin / 60) % 24;
    const nuevoM = totalMin % 60;
    return `${String(nuevaH).padStart(2, "0")}:${String(nuevoM).padStart(2, "0")}`;
  }

  async function guardarConfig() {
    setGuardando(true);
    setExito("");
    setError("");

    const res = await fetch("/api/negocio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: negocio.id,
        horarios: horarios.map((h) => ({
          dia_semana: h.dia_semana,
          apertura: h.apertura,
          cierre: h.cierre,
          orden: h.orden,
        })),
      }),
    });

    setGuardando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Error al guardar");
      return;
    }

    setExito("Configuración guardada");
    setTimeout(() => setExito(""), 3000);
  }

  async function agregarBloqueo() {
    if (!nuevoBloqueoFecha) return;
    setCreandoBloqueo(true);

    const res = await fetch("/api/bloqueos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        negocio_id: negocio.id,
        fecha: nuevoBloqueoFecha,
        motivo: nuevoBloqueoMotivo.trim() || null,
      }),
    });

    setCreandoBloqueo(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Error al bloquear fecha");
      return;
    }

    const creado = await res.json();
    setBloqueos((prev) => [...prev, creado]);
    setNuevoBloqueoFecha("");
    setNuevoBloqueoMotivo("");
  }

  async function eliminarBloqueo(id: string) {
    const res = await fetch("/api/bloqueos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      alert("Error al eliminar bloqueo");
      return;
    }

    setBloqueos((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl leading-tight text-cream md:text-3xl">
          Configuración
        </h1>
        <p className="mt-1.5 text-sm text-cream/55">
          Horarios y bloqueos del negocio
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-surface/40 p-5 sm:p-6">
        <h2 className="font-display text-lg text-cream">Horarios</h2>
        <p className="mt-1 text-sm text-cream/55">
          Activa los días que trabajas y ajusta sus bloques de horario.
        </p>

        <div className="mt-5 space-y-1">
          {DIAS.map(({ n, label }) => {
            const bloques = bloquesDelDia(n);
            const activo = bloques.length > 0;
            const expandido = diaExpandido === n;
            const resumen = bloques
              .map(
                (b) =>
                  `${formatearHora12h(b.apertura)}–${formatearHora12h(b.cierre)}`,
              )
              .join(" · ");
            return (
              <div
                key={n}
                className={`rounded-xl transition-colors ${
                  expandido ? "bg-ink/70" : "hover:bg-ink/40"
                }`}
              >
                <div className="flex items-center gap-2 pr-2.5">
                  <button
                    type="button"
                    onClick={() => setDiaExpandido(expandido ? null : n)}
                    aria-expanded={expandido}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className={`shrink-0 text-cream/55 transition-transform duration-150 ease-ui ${
                        expandido ? "rotate-90" : ""
                      }`}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    <span
                      className={`w-24 shrink-0 text-sm font-medium ${
                        activo ? "text-cream" : "text-cream/55"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="hidden min-w-0 flex-1 truncate font-mono text-[11px] tabular-nums text-cream/55 sm:block">
                      {activo ? resumen : "Cerrado"}
                    </span>
                  </button>
                  <div className="ml-auto shrink-0">
                    <SwitchEstado
                      activo={activo}
                      onToggle={() => toggleDia(n)}
                      etiqueta={`${activo ? "Desactivar" : "Activar"} ${label}`}
                    />
                  </div>
                </div>

                {expandido && activo && (
                  <div className="space-y-2 px-3 pb-3 pl-10">
                    {bloques.map((bloque) => (
                      <div key={bloque.orden} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-line bg-ink/60 px-3 py-1.5">
                          <SelectorHora
                            value={bloque.apertura}
                            onChange={(v) =>
                              actualizarBloque(n, bloque.orden, "apertura", v)
                            }
                          />
                          <span className="font-mono text-xs text-cream/30">
                            –
                          </span>
                          <SelectorHora
                            value={bloque.cierre}
                            onChange={(v) =>
                              actualizarBloque(n, bloque.orden, "cierre", v)
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarBloque(n, bloque.orden)}
                          aria-label={`Eliminar bloque ${bloque.orden + 1} de ${label}`}
                          className={claseIconoEliminar}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => agregarBloque(n)}
                      className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-cream/55 transition-colors hover:border-brass/40 hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
                    >
                      + Añadir bloque
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface/40 p-5 sm:p-6">
        <h2 className="font-display text-lg text-cream">Días bloqueados</h2>
        <p className="mt-1 text-sm text-cream/55">
          Los días bloqueados no aparecen disponibles para reservar.
        </p>

        <div className="mt-5">
          {bloqueos.length === 0 ? (
            <p className="text-sm text-cream/55">No hay días bloqueados.</p>
          ) : (
            <div className="space-y-2">
              {bloqueos.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-ink/40 px-4 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-[13px] tabular-nums text-cream">
                      {b.fecha}
                    </span>
                    {b.motivo && (
                      <span className="truncate text-xs text-cream/55">
                        {b.motivo}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarBloqueo(b.id)}
                    aria-label={`Eliminar bloqueo del ${b.fecha}`}
                    className={claseIconoEliminar}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-44">
            <label htmlFor="bloqueo-fecha" className={claseEtiqueta}>
              Fecha
            </label>
            <input
              id="bloqueo-fecha"
              type="date"
              value={nuevoBloqueoFecha}
              onChange={(e) => setNuevoBloqueoFecha(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={`mt-2 ${claseCampo}`}
            />
          </div>
          <div className="w-full sm:w-52">
            <label htmlFor="bloqueo-motivo" className={claseEtiqueta}>
              Motivo (opcional)
            </label>
            <input
              id="bloqueo-motivo"
              type="text"
              placeholder="Ej: Vacaciones"
              value={nuevoBloqueoMotivo}
              onChange={(e) => setNuevoBloqueoMotivo(e.target.value)}
              className={`mt-2 ${claseCampo}`}
            />
          </div>
          <button
            type="button"
            onClick={agregarBloqueo}
            disabled={!nuevoBloqueoFecha || creandoBloqueo}
            className="rounded-xl bg-brass px-5 py-3 text-sm font-semibold text-ink transition-[filter,transform,opacity] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creandoBloqueo ? "Bloqueando…" : "Bloquear"}
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={guardarConfig}
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-xl bg-brass px-6 py-3 text-sm font-semibold text-ink transition-[filter,transform,opacity] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {guardando ? "Guardando…" : "Guardar horario"}
        </button>
        {exito && (
          <p role="status" className="text-[13px] text-brass">
            {exito}
          </p>
        )}
        {error && (
          <p role="alert" className="text-[13px] text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function SelectorHora({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const fallback = value || "08:00";
  const { h12, min, periodo } = descomponerHora(fallback);

  function actualizar(parcial: Partial<{ h12: number; min: string; periodo: "AM" | "PM" }>) {
    onChange(componerHora(
      parcial.h12 ?? h12,
      parcial.min ?? min,
      parcial.periodo ?? periodo,
    ));
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={h12}
        onChange={(e) => actualizar({ h12: Number(e.target.value) })}
        aria-label="Hora"
        className="w-8 cursor-pointer appearance-none bg-transparent text-center font-mono text-sm tabular-nums text-cream outline-none"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h} className="bg-ink">{h}</option>
        ))}
      </select>
      <span className="font-mono text-xs text-cream/30">:</span>
      <select
        value={min}
        onChange={(e) => actualizar({ min: e.target.value })}
        aria-label="Minutos"
        className="w-8 cursor-pointer appearance-none bg-transparent text-center font-mono text-sm tabular-nums text-cream outline-none"
      >
        <option value="00" className="bg-ink">00</option>
        <option value="30" className="bg-ink">30</option>
      </select>
      <div className="ml-1.5 flex overflow-hidden rounded-md border border-line">
        <button
          type="button"
          onClick={() => actualizar({ periodo: "AM" })}
          className={`px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest transition-colors ${
            periodo === "AM"
              ? "bg-brass font-semibold text-ink"
              : "text-cream/55 hover:text-cream/80"
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => actualizar({ periodo: "PM" })}
          className={`px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest transition-colors ${
            periodo === "PM"
              ? "bg-brass font-semibold text-ink"
              : "text-cream/55 hover:text-cream/80"
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
}
