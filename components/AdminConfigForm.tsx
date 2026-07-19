"use client";

import { useState } from "react";
import type { Negocio } from "@/lib/types";

type Bloqueo = {
  id: string;
  fecha: string;
  motivo: string | null;
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

export default function AdminConfigForm({
  negocio,
  bloqueosIniciales,
}: {
  negocio: Negocio;
  bloqueosIniciales: Bloqueo[];
}) {
  const [apertura, setApertura] = useState(negocio.hora_apertura.slice(0, 5));
  const [cierre, setCierre] = useState(negocio.hora_cierre.slice(0, 5));
  const [dias, setDias] = useState<number[]>([...negocio.dias_laborales]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>(bloqueosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState("");
  const [error, setError] = useState("");

  const [nuevoBloqueoFecha, setNuevoBloqueoFecha] = useState("");
  const [nuevoBloqueoMotivo, setNuevoBloqueoMotivo] = useState("");
  const [creandoBloqueo, setCreandoBloqueo] = useState(false);

  function toggleDia(n: number) {
    setDias((prev) =>
      prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n].sort()
    );
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
        hora_apertura: apertura,
        hora_cierre: cierre,
        dias_laborales: dias,
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

      {/* Horario */}
      <div className="border border-line rounded-lg p-5 bg-surface/30 space-y-4">
        <p className="text-xs text-cream/40 uppercase tracking-widest">
          Horario
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-cream/30 uppercase tracking-wider block mb-1.5">
              Apertura
            </label>
            <input
              type="time"
              value={apertura}
              onChange={(e) => setApertura(e.target.value)}
              className="w-full bg-base border border-line rounded-md px-3 py-2 text-sm text-cream"
            />
          </div>
          <div>
            <label className="text-[10px] text-cream/30 uppercase tracking-wider block mb-1.5">
              Cierre
            </label>
            <input
              type="time"
              value={cierre}
              onChange={(e) => setCierre(e.target.value)}
              className="w-full bg-base border border-line rounded-md px-3 py-2 text-sm text-cream"
            />
          </div>
        </div>
      </div>

      {/* Días laborales */}
      <div className="border border-line rounded-lg p-5 bg-surface/30 space-y-4">
        <p className="text-xs text-cream/40 uppercase tracking-widest">
          Días laborales
        </p>
        <div className="flex flex-wrap gap-2">
          {DIAS.map(({ n, label }) => {
            const activo = dias.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggleDia(n)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  activo
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line text-cream/30 hover:text-cream/50"
                }`}
              >
                {label}
              </button>
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
                className="flex items-center justify-between bg-base rounded-md px-3 py-2"
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
              className="bg-base border border-line rounded-md px-3 py-2 text-sm text-cream"
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
              className="bg-base border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/20"
            />
          </div>
          <button
            onClick={agregarBloqueo}
            disabled={!nuevoBloqueoFecha || creandoBloqueo}
            className="text-sm px-4 py-2 rounded-md bg-accent text-cream font-medium disabled:opacity-40 transition-opacity"
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
          className="text-sm px-6 py-2.5 rounded-md bg-accent text-cream font-medium disabled:opacity-40 transition-opacity"
        >
          {guardando ? "Guardando..." : "Guardar horario y días"}
        </button>
        {exito && <p className="text-xs text-green-400">{exito}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
