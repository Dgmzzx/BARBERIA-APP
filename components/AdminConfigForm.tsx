"use client";

import { useState } from "react";
import type { Negocio, Horario } from "@/lib/types";
import { descomponerHora, componerHora } from "@/lib/helpers";

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
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl text-cream">Configuraci&oacute;n</h1>
        <p className="text-sm text-cream/40 mt-1">Horarios y bloqueos del negocio</p>
      </div>

      {/* Horarios */}
      <section className="border border-line rounded-xl p-6 bg-surface/20">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brass" />
          <p className="text-xs text-brass/70 uppercase tracking-[0.15em] font-medium">
            Horarios por d&iacute;a
          </p>
        </div>

        <p className="text-xs text-cream/25 leading-relaxed mb-5">
          Activa o desactiva d&iacute;as y ajusta los bloques de horario.
        </p>

        <div className="space-y-1">
          {DIAS.map(({ n, label }) => {
            const bloques = bloquesDelDia(n);
            const activo = bloques.length > 0;
            const expandido = diaExpandido === n;
            return (
              <div key={n}>
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer select-none transition-all ${
                    expandido
                      ? "bg-ink border-l-2 border-brass"
                      : activo
                        ? "hover:bg-ink/60 border-l-2 border-transparent hover:border-brass/30"
                        : "hover:bg-ink/30 border-l-2 border-transparent"
                  }`}
                  onClick={() => setDiaExpandido(expandido ? null : n)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors text-xs font-mono ${activo ? "text-brass" : "text-cream/15"}`}>
                      <span className="inline-block w-4 text-center">{expandido ? "▾" : "▸"}</span>
                    </span>
                    <span className={`font-mono text-xs uppercase tracking-wider transition-colors ${activo ? "text-cream/80" : "text-cream/20"}`}>
                      {label}
                    </span>
                    {activo && (
                      <span className="text-[9px] text-cream/20 font-mono tracking-wider">
                        {bloques.length} bloque{bloques.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {!activo && (
                      <span className="text-[9px] text-cream/15 font-mono tracking-wider">Inactivo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {activo && expandido && (
                      <button
                        onClick={() => agregarBloque(n)}
                        className="text-[10px] text-brass/60 hover:text-brass transition-colors uppercase tracking-[0.12em] font-medium"
                      >
                        + Bloque
                      </button>
                    )}
                    <button
                      onClick={() => toggleDia(n)}
                      className={`text-xs transition-colors ${
                        activo
                          ? "text-signal/50 hover:text-signal"
                          : "text-brass/40 hover:text-brass"
                      }`}
                    >
                      {activo ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {expandido && activo && (
                  <div className="space-y-2 ml-10 mt-2 mb-3">
                    {bloques.map((bloque) => (
                      <div key={bloque.orden} className="flex items-center gap-2 px-1">
                        <span className="text-[9px] text-brass/30 font-mono w-3">{bloque.orden + 1}</span>
                        <div className="flex items-center gap-2 border border-brass/20 rounded-lg px-3 py-1.5 bg-ink/60">
                          <SelectorHora
                            value={bloque.apertura}
                            onChange={(v) => actualizarBloque(n, bloque.orden, "apertura", v)}
                          />
                          <span className="text-brass/40 text-xs font-mono">—</span>
                          <SelectorHora
                            value={bloque.cierre}
                            onChange={(v) => actualizarBloque(n, bloque.orden, "cierre", v)}
                          />
                        </div>
                        <button
                          onClick={() => eliminarBloque(n, bloque.orden)}
                          className="text-cream/15 hover:text-signal/70 transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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
            );
          })}
        </div>
      </section>

      {/* Bloqueos */}
      <section className="border border-line rounded-xl p-6 bg-surface/20">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-signal" />
          <p className="text-xs text-signal/70 uppercase tracking-[0.15em] font-medium">
            D&iacute;as bloqueados
          </p>
        </div>

        {bloqueos.length === 0 ? (
          <p className="text-sm text-cream/25 mb-5">No hay d&iacute;as bloqueados</p>
        ) : (
          <div className="space-y-2 mb-5">
            {bloqueos.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between border border-line/50 rounded-lg px-4 py-2.5 bg-ink/40"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
                  <span className="font-mono text-sm text-brass/80">{b.fecha}</span>
                  {b.motivo && (
                    <span className="text-cream/30 text-xs ml-1">— {b.motivo}</span>
                  )}
                </div>
                <button
                  onClick={() => eliminarBloqueo(b.id)}
                  className="text-[10px] text-cream/20 hover:text-signal/60 transition-colors uppercase tracking-wider"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-[9px] text-cream/20 uppercase tracking-[0.12em] block mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={nuevoBloqueoFecha}
              onChange={(e) => setNuevoBloqueoFecha(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-ink border border-line rounded-lg px-3 py-2 text-sm text-cream w-40"
            />
          </div>
          <div>
            <label className="text-[9px] text-cream/20 uppercase tracking-[0.12em] block mb-1.5">
              Motivo (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Vacaciones"
              value={nuevoBloqueoMotivo}
              onChange={(e) => setNuevoBloqueoMotivo(e.target.value)}
              className="bg-ink border border-line rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/15 w-40"
            />
          </div>
          <button
            onClick={agregarBloqueo}
            disabled={!nuevoBloqueoFecha || creandoBloqueo}
            className="text-xs px-4 py-2.5 rounded-lg bg-signal/90 hover:bg-signal text-cream font-medium disabled:opacity-30 transition-all tracking-wide"
          >
            {creandoBloqueo ? "..." : "Bloquear"}
          </button>
        </div>
      </section>

      {/* Guardar */}
      <div className="flex items-center gap-4">
        <button
          onClick={guardarConfig}
          disabled={guardando}
          className="inline-flex items-center gap-2 text-sm px-8 py-3 rounded-xl bg-signal text-cream font-semibold tracking-wide transition-all hover:bg-signal/90 disabled:opacity-40 active:scale-[0.98]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="6" cy="18" r="2.5" />
            <line x1="8.5" y1="8.5" x2="20" y2="20" />
            <line x1="8.5" y1="15.5" x2="20" y2="4" />
          </svg>
          {guardando ? "Guardando..." : "Guardar horario y d&iacute;as"}
        </button>
        {exito && <p className="text-xs text-brass/70">{exito}</p>}
        {error && <p className="text-xs text-signal/80">{error}</p>}
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
        className="bg-transparent text-cream text-sm font-mono appearance-none cursor-pointer outline-none w-6 text-center"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h} className="bg-ink">{h}</option>
        ))}
      </select>
      <span className="text-brass/40 text-xs font-mono">:</span>
      <select
        value={min}
        onChange={(e) => actualizar({ min: e.target.value })}
        className="bg-transparent text-cream text-sm font-mono appearance-none cursor-pointer outline-none w-6 text-center"
      >
        <option value="00" className="bg-ink">00</option>
        <option value="30" className="bg-ink">30</option>
      </select>
      <div className="flex rounded overflow-hidden border border-brass/15 ml-1.5">
        <button
          onClick={() => actualizar({ periodo: "AM" })}
          className={`text-[9px] px-1.5 py-0.5 font-mono uppercase tracking-widest transition-colors ${
            periodo === "AM" ? "bg-brass text-ink font-semibold" : "bg-transparent text-cream/25 hover:text-cream/60"
          }`}
        >
          AM
        </button>
        <button
          onClick={() => actualizar({ periodo: "PM" })}
          className={`text-[9px] px-1.5 py-0.5 font-mono uppercase tracking-widest transition-colors ${
            periodo === "PM" ? "bg-brass text-ink font-semibold" : "bg-transparent text-cream/25 hover:text-cream/60"
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
}
