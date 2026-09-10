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
  const [descripcion, setDescripcion] = useState("");
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [edicion, setEdicion] = useState({
    nombre: "",
    precio: "",
    duracion: "30",
    descripcion: "",
  });

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
        descripcion: descripcion.trim() || null,
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
    setDescripcion("");
    setMostrandoForm(false);
  }

  async function guardarEdicion(id: string) {
    if (!edicion.nombre.trim() || !edicion.precio) return;

    setCreando(true);
    const res = await fetch("/api/servicios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        nombre: edicion.nombre.trim(),
        precio: parseFloat(edicion.precio),
        duracion_minutos: parseInt(edicion.duracion, 10),
        descripcion: edicion.descripcion.trim() || null,
      }),
    });

    setCreando(false);

    if (!res.ok) {
      alert("No se pudo guardar el servicio.");
      return;
    }

    setServicios((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              nombre: edicion.nombre.trim(),
              precio: parseFloat(edicion.precio),
              duracion_minutos: parseInt(edicion.duracion, 10),
              descripcion: edicion.descripcion.trim() || null,
            }
          : s
      )
    );
    setEditandoId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-cream/55">
          {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => {
            setMostrandoForm(!mostrandoForm);
            setNombre("");
            setPrecio("");
            setDuracion("30");
            setDescripcion("");
          }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-line text-cream/60 hover:text-brass hover:border-brass/50 transition-colors"
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
            className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-cream/55 uppercase tracking-wider block mb-1">
                Precio $
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45"
              />
            </div>
            <div>
              <label className="text-[10px] text-cream/55 uppercase tracking-wider block mb-1">
                Duraci&oacute;n (min)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-cream/55 uppercase tracking-wider block mb-1">
              Descripci&oacute;n (opcional)
            </label>
            <textarea
              placeholder="Ej: Corte a tijera o máquina, acabado y peinado a tu estilo."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={300}
              rows={2}
              className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setMostrandoForm(false)}
              className="text-xs px-3 py-1.5 rounded-md border border-line text-cream/60 hover:text-cream/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={crearServicio}
              disabled={!nombre.trim() || !precio || creando}
              className="text-xs px-4 py-1.5 rounded-md bg-signal text-cream font-medium disabled:opacity-40 transition-opacity"
            >
              {creando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {servicios.length === 0 && !mostrandoForm ? (
        <p className="text-cream/60 text-sm pt-2">
          No hay servicios registrados.
        </p>
      ) : (
        <div className="space-y-2">
          {servicios.map((s) => (
            <div
              key={s.id}
              className={`border border-line rounded-lg p-4 bg-surface/30 transition-colors ${
                editandoId === s.id ? "border-brass/40" : ""
              }`}
            >
              {editandoId === s.id ? (
                <div className="space-y-3">
                  <p className="font-medium text-sm text-cream">
                    Editar servicio
                  </p>
                  <input
                    type="text"
                    placeholder="Nombre del servicio"
                    value={edicion.nombre}
                    onChange={(e) =>
                      setEdicion({ ...edicion, nombre: e.target.value })
                    }
                    className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-cream/55 uppercase tracking-wider block mb-1">
                        Precio $
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={edicion.precio}
                        onChange={(e) =>
                          setEdicion({ ...edicion, precio: e.target.value })
                        }
                        className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-cream/55 uppercase tracking-wider block mb-1">
                        Duraci&oacute;n (min)
                      </label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={edicion.duracion}
                        onChange={(e) =>
                          setEdicion({ ...edicion, duracion: e.target.value })
                        }
                        className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-cream/55 uppercase tracking-wider block mb-1">
                      Descripci&oacute;n (opcional)
                    </label>
                    <textarea
                      value={edicion.descripcion}
                      onChange={(e) =>
                        setEdicion({ ...edicion, descripcion: e.target.value })
                      }
                      maxLength={300}
                      rows={2}
                      placeholder="Sin descripción"
                      className="w-full bg-ink border border-line rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/45 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditandoId(null)}
                      className="text-xs px-3 py-1.5 rounded-md border border-line text-cream/60 hover:text-cream/80 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => guardarEdicion(s.id)}
                      disabled={
                        !edicion.nombre.trim() || !edicion.precio || creando
                      }
                      className="text-xs px-4 py-1.5 rounded-md bg-brass text-ink font-medium disabled:opacity-40 transition-opacity"
                    >
                      {creando ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`font-medium text-sm ${!s.activo ? "text-cream/55" : ""}`}
                    >
                      {s.nombre}
                    </p>
                    <p className="text-xs text-cream/55">
                      ${s.precio} &middot; {s.duracion_minutos} min
                    </p>
                    {s.descripcion && (
                      <p className="text-xs text-cream/60 mt-1 leading-relaxed">
                        {s.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditandoId(s.id);
                        setEdicion({
                          nombre: s.nombre,
                          precio: String(s.precio),
                          duracion: String(s.duracion_minutos),
                          descripcion: s.descripcion ?? "",
                        });
                      }}
                      className="p-2 rounded-md border border-line text-cream/60 hover:text-brass hover:border-brass/50 transition-colors"
                      aria-label={`Editar servicio ${s.nombre}`}
                      title="Editar servicio"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleActivo(s.id, s.activo)}
                      className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                        s.activo
                          ? "border-green-700/40 text-green-400 bg-green-900/10"
                          : "border-line text-cream/55"
                      }`}
                    >
                      {s.activo ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
