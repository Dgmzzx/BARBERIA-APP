"use client";

import { useState } from "react";
import type { Servicio } from "@/lib/types";
import SwitchEstado from "./SwitchEstado";

const claseCampo =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-cream caret-brass outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-ui placeholder:text-white/50 focus:border-brass/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-brass/20";

const claseEtiqueta =
  "block text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55";

const claseBotonPrimario =
  "rounded-xl bg-brass px-4 py-2.5 text-sm font-semibold text-ink transition-[filter,transform,opacity] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 disabled:cursor-not-allowed disabled:opacity-40";

const claseBotonSecundario =
  "rounded-xl border border-line px-4 py-2.5 text-sm text-cream/70 transition-colors hover:border-cream/25 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-cream/55">
          {servicios.length === 1 ? "1 servicio" : `${servicios.length} servicios`}
        </p>
        <button
          onClick={() => {
            setMostrandoForm(!mostrandoForm);
            setNombre("");
            setPrecio("");
            setDuracion("30");
            setDescripcion("");
          }}
          className={claseBotonPrimario}
        >
          Agregar servicio
        </button>
      </div>

      {mostrandoForm && (
        <div className="space-y-3 rounded-2xl border border-line bg-surface/50 p-4 sm:p-5">
          <div>
            <label htmlFor="servicio-nombre" className={claseEtiqueta}>
              Nombre
            </label>
            <input
              id="servicio-nombre"
              type="text"
              placeholder="Ej: Corte clásico"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`mt-2 ${claseCampo}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="servicio-precio" className={claseEtiqueta}>
                Precio $
              </label>
              <input
                id="servicio-precio"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className={`mt-2 ${claseCampo}`}
              />
            </div>
            <div>
              <label htmlFor="servicio-duracion" className={claseEtiqueta}>
                Duración (min)
              </label>
              <input
                id="servicio-duracion"
                type="number"
                min="5"
                step="5"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className={`mt-2 ${claseCampo}`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="servicio-descripcion" className={claseEtiqueta}>
              Descripción (opcional)
            </label>
            <textarea
              id="servicio-descripcion"
              placeholder="Ej: Corte a tijera o máquina, acabado y peinado a tu estilo."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={300}
              rows={2}
              className={`mt-2 resize-none ${claseCampo}`}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setMostrandoForm(false)}
              className={claseBotonSecundario}
            >
              Cancelar
            </button>
            <button
              onClick={crearServicio}
              disabled={!nombre.trim() || !precio || creando}
              className={claseBotonPrimario}
            >
              {creando ? "Guardando…" : "Guardar servicio"}
            </button>
          </div>
        </div>
      )}

      {servicios.length === 0 && !mostrandoForm ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white/[0.04] text-brass">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="3" />
              <path d="M8.12 8.12 12 12" />
              <path d="M20 4 8.12 15.88" />
              <circle cx="6" cy="18" r="3" />
              <path d="M14.8 14.8 20 20" />
            </svg>
          </span>
          <p className="mt-4 font-display text-lg text-cream">
            Aún no hay servicios
          </p>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-cream/55">
            Agrega tu primer servicio para que tus clientes puedan reservarlo.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {servicios.map((s) => (
            <div
              key={s.id}
              className={`rounded-2xl border bg-surface/50 p-4 transition-colors ${
                editandoId === s.id ? "border-brass/40" : "border-line hover:border-cream/15"
              }`}
            >
              {editandoId === s.id ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-cream">
                    Editar servicio
                  </p>
                  <div>
                    <label htmlFor={`editar-nombre-${s.id}`} className={claseEtiqueta}>
                      Nombre
                    </label>
                    <input
                      id={`editar-nombre-${s.id}`}
                      type="text"
                      placeholder="Nombre del servicio"
                      value={edicion.nombre}
                      onChange={(e) =>
                        setEdicion({ ...edicion, nombre: e.target.value })
                      }
                      className={`mt-2 ${claseCampo}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`editar-precio-${s.id}`} className={claseEtiqueta}>
                        Precio $
                      </label>
                      <input
                        id={`editar-precio-${s.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={edicion.precio}
                        onChange={(e) =>
                          setEdicion({ ...edicion, precio: e.target.value })
                        }
                        className={`mt-2 ${claseCampo}`}
                      />
                    </div>
                    <div>
                      <label htmlFor={`editar-duracion-${s.id}`} className={claseEtiqueta}>
                        Duración (min)
                      </label>
                      <input
                        id={`editar-duracion-${s.id}`}
                        type="number"
                        min="5"
                        step="5"
                        value={edicion.duracion}
                        onChange={(e) =>
                          setEdicion({ ...edicion, duracion: e.target.value })
                        }
                        className={`mt-2 ${claseCampo}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`editar-descripcion-${s.id}`} className={claseEtiqueta}>
                      Descripción (opcional)
                    </label>
                    <textarea
                      id={`editar-descripcion-${s.id}`}
                      value={edicion.descripcion}
                      onChange={(e) =>
                        setEdicion({ ...edicion, descripcion: e.target.value })
                      }
                      maxLength={300}
                      rows={2}
                      placeholder="Sin descripción"
                      className={`mt-2 resize-none ${claseCampo}`}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditandoId(null)}
                      className={claseBotonSecundario}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => guardarEdicion(s.id)}
                      disabled={
                        !edicion.nombre.trim() || !edicion.precio || creando
                      }
                      className={claseBotonPrimario}
                    >
                      {creando ? "Guardando…" : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        s.activo ? "text-cream" : "text-cream/55"
                      }`}
                    >
                      {s.nombre}
                    </p>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-cream/55">
                      ${s.precio} · {s.duracion_minutos} min
                    </p>
                    {s.descripcion && (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-cream/55">
                        {s.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-cream/55 transition-colors hover:border-cream/25 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
                      aria-label={`Editar servicio ${s.nombre}`}
                      title="Editar servicio"
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
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <SwitchEstado
                      activo={s.activo}
                      onToggle={() => toggleActivo(s.id, s.activo)}
                      etiqueta={`${s.nombre}: ${s.activo ? "activo" : "inactivo"}`}
                    />
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
