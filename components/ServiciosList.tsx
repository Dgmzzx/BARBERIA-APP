"use client";

import { useState } from "react";
import type { Servicio } from "@/lib/types";

export default function ServiciosList({
  serviciosIniciales,
  negocioId,
}: {
  serviciosIniciales: Servicio[];
  negocioId: string;
}) {
  const [servicios, setServicios] = useState(serviciosIniciales);
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("30");
  const [creando, setCreando] = useState(false);

  async function toggleActivo(id: string, activo: boolean) {
    const res = await fetch("/api/servicios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, activo: !activo }),
    });

    if (!res.ok) {
      alert("No se pudo actualizar el servicio.");
      return;
    }
    setServicios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s))
    );
  }

  async function crearServicio() {
    if (!nombre.trim() || !precio) return;

    setCreando(true);
    const res = await fetch("/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        negocio_id: negocioId,
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        duracion_minutos: parseInt(duracion, 10),
      }),
    });

    setCreando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "No se pudo crear el servicio.");
      return;
    }

    const nuevo = await res.json();
    setServicios((prev) => [...prev, nuevo]);
    setNombre("");
    setPrecio("");
    setDuracion("30");
    setMostrandoForm(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-cream/40">
          {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => {
            setMostrandoForm(!mostrandoForm);
            setNombre("");
            setPrecio("");
            setDuracion("30");
          }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-line text-cream/60 hover:text-accent hover:border-accent/50 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Agregar
        </button>
      </div>

      {mostrandoForm && (
        <div className="border border-line rounded-lg p-4 bg-surface/50 space-y-3">
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-base border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/20"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-cream/30 uppercase tracking-wider block mb-1">
                Precio $
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full bg-base border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-cream/30 uppercase tracking-wider block mb-1">
                Duraci&oacute;n (min)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-base border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setMostrandoForm(false)}
              className="text-xs px-3 py-1.5 rounded-md border border-line text-cream/40 hover:text-cream/60 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={crearServicio}
              disabled={!nombre.trim() || !precio || creando}
              className="text-xs px-4 py-1.5 rounded-md bg-accent text-cream font-medium disabled:opacity-40 transition-opacity"
            >
              {creando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {servicios.length === 0 && !mostrandoForm ? (
        <p className="text-cream/40 text-sm pt-2">
          No hay servicios registrados.
        </p>
      ) : (
        <div className="space-y-2">
          {servicios.map((s) => (
            <div
              key={s.id}
              className="border border-line rounded-lg p-4 bg-surface/30 flex items-center justify-between"
            >
              <div>
                <p
                  className={`font-medium text-sm ${!s.activo ? "text-cream/40" : ""}`}
                >
                  {s.nombre}
                </p>
                <p className="text-xs text-cream/40">
                  ${s.precio} &middot; {s.duracion_minutos} min
                </p>
              </div>
              <button
                onClick={() => toggleActivo(s.id, s.activo)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  s.activo
                    ? "border-green-700/40 text-green-400 bg-green-900/10"
                    : "border-line text-cream/30"
                }`}
              >
                {s.activo ? "Activo" : "Inactivo"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
