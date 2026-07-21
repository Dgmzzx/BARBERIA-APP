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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl">Configuración</h1>
        <p className="text-sm text-cream/40 mt-1">Datos del negocio</p>
      </div>

      {/* Horarios por día */}
      <div className="border border-line rounded-lg p-5 bg-surface/30 space-y-4">
        <p className="text-xs text-cream/40 uppercase tracking-widest">
          Horarios por día
        </p>
        <p className="text-[10px] text-cream/20 leading-relaxed">
          Activa o desactiva días y agrega bloques de horario para cada uno.
        </p>
        <div className="space-y-1">
          {DIAS.map(({ n, label }) => {
            const bloques = bloquesDelDia(n);
            const activo = bloques.length > 0;
            const expandido = diaExpandido === n;
            return (
              <div key={n}>
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer select-none transition-colors ${
                    expandido
                      ? "bg-ink border border-line"
                      : activo
                        ? "hover:bg-ink/50 border border-transparent"
                        : "hover:bg-ink/30 border border-transparent"
                  }`}
                  onClick={() => setDiaExpandido(expandido ? null : n)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-cream/20 font-mono">{expandido ? "▾" : "▸"}</span>
                    <span className={`font-mono text-xs uppercase tracking-wider transition-colors ${activo ? "text-cream/80" : "text-cream/20"}`}>
                      {label}
                    </span>
                    {activo && (
                      <span className="text-[10px] text-cream/20 font-mono">
                        {bloques.length} bloque{bloques.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {!activo && (
                      <span className="text-[9px] text-cream/20 font-mono">Inactivo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {activo && expandido && (
                      <button
                        onClick={() => agregarBloque(n)}
                        className="text-[10px] text-brass/60 hover:text-brass transition-colors uppercase tracking-wider"
                      >
                        + Bloque
                      </button>
                    )}
                    <button
                      onClick={() => toggleDia(n)}
                      className={`text-xs transition-colors ${activo ? "text-signal/50 hover:text-signal" : "text-brass/50 hover:text-brass"}`}
                    >
                      {activo ? "✕" : "+"}
                    </button>
                  </div>
                </div>
                {expandido && activo && (
                  <div className="space-y-2 ml-6 mt-2 mb-2">
                    {bloques.map((bloque) => (
                      <div key={bloque.orden} className="flex items-center gap-2">
                        <SelectorHora
                          value={bloque.apertura}
                          onChange={(v) => actualizarBloque(n, bloque.orden, "apertura", v)}
                        />
                        <span className="text-cream/20 text-xs">a</span>
                        <SelectorHora
                          value={bloque.cierre}
                          onChange={(v) => actualizarBloque(n, bloque.orden, "cierre", v)}
                        />
                        <button
                          onClick={() => eliminarBloque(n, bloque.orden)}
                          className="text-red-400/40 hover:text-red-400 transition-colors text-xs ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bloqueos */}
      <div className="border border-line rounded-lg p-5 bg-surface/30 space-y-4">
        <p className="text-xs text-cream/40 uppercase tracking-widest">
          Días bloqueados (vacaciones, feriados…)
        </p>

        {bloqueos.length === 0 ? (
          <p className="text-sm text-cream/30">No hay días bloqueados</p>
        ) : (
          <div className="space-y-2">
            {bloqueos.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between bg-ink rounded-md px-3 py-2"
              >
                <div className="text-sm">
                  <span className="font-mono text-cream/80">{b.fecha}</span>
                  {b.motivo && (
                    <span className="text-cream/40 ml-2">— {b.motivo}</span>
                  )}
                </div>
                <button
                  onClick={() => eliminarBloqueo(b.id)}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div>
            <label className="text-[10px] text-cream/30 uppercase tracking-wider block mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={nuevoBloqueoFecha}
              onChange={(e) => setNuevoBloqueoFecha(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream"
            />
          </div>
          <div>
            <label className="text-[10px] text-cream/30 uppercase tracking-wider block mb-1">
              Motivo (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Vacaciones"
              value={nuevoBloqueoMotivo}
              onChange={(e) => setNuevoBloqueoMotivo(e.target.value)}
              className="bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/20"
            />
          </div>
          <button
            onClick={agregarBloqueo}
            disabled={!nuevoBloqueoFecha || creandoBloqueo}
            className="text-sm px-4 py-2 rounded-md bg-signal text-cream font-medium disabled:opacity-40 transition-opacity"
          >
            {creandoBloqueo ? "..." : "Bloquear"}
          </button>
        </div>
      </div>

      {/* Guardar horario */}
      <div className="flex items-center gap-4">
        <button
          onClick={guardarConfig}
          disabled={guardando}
          className="text-sm px-6 py-2.5 rounded-md bg-signal text-cream font-semibold tracking-wide transition-opacity disabled:opacity-40"
        >
          {guardando ? "Guardando..." : "Guardar horario y días"}
        </button>
        {exito && <p className="text-xs text-green-400">{exito}</p>}
        {error && <p className="text-xs text-signal">{error}</p>}
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
    <div className="flex gap-1 items-center">
      <select
        value={h12}
        onChange={(e) => actualizar({ h12: Number(e.target.value) })}
        className="bg-ink border border-line rounded-md px-2 py-2 text-sm text-cream"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-cream/30 text-sm">:</span>
      <select
        value={min}
        onChange={(e) => actualizar({ min: e.target.value })}
        className="bg-ink border border-line rounded-md px-2 py-2 text-sm text-cream"
      >
        <option value="00">00</option>
        <option value="30">30</option>
      </select>
      <select
        value={periodo}
        onChange={(e) => actualizar({ periodo: e.target.value as "AM" | "PM" })}
        className="bg-ink border border-line rounded-md px-2 py-2 text-sm text-cream"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
