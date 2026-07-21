"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { formatearHora12h } from "@/lib/helpers";

type CitaConServicio = {
  id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  fecha: string;
  hora: string;
  estado: string;
  servicios: { nombre: string } | null;
};

export default function PanelCitas({
  citasIniciales,
}: {
  citasIniciales: CitaConServicio[];
}) {
  const [citas, setCitas] = useState(citasIniciales);

  async function actualizarEstado(id: string, estado: string) {
  const supabase = crearClienteSupabase();
  const { error } = await supabase.from("citas").update({ estado }).eq("id", id);

  if (error) {
    alert("No se pudo actualizar la cita. Intenta de nuevo.");
    return;
  }
  setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado } : c)));
}

  if (citas.length === 0) {
    return <p className="text-cream/50">Todavía no hay citas reservadas.</p>;
  }

  return (
    <div className="space-y-3">
      {citas.map((cita) => (
        <div
          key={cita.id}
          className="border border-line rounded-lg p-4 bg-surface/20 flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-cream">{cita.nombre_cliente}</p>
            <p className="text-sm text-cream/50">
              {cita.servicios?.nombre} · {cita.fecha} {formatearHora12h(cita.hora)}
            </p>
            <p className="text-sm text-cream/30">{cita.telefono_cliente}</p>
          </div>

          <div className="flex gap-2">
            {cita.estado === "pendiente" ? (
              <>
                <button
                  onClick={() => actualizarEstado(cita.id, "completada")}
                  className="text-xs border border-line rounded-full px-3 py-1 hover:border-brass hover:text-cream transition-colors"
                >
                  Completar
                </button>
                <button
                  onClick={() => actualizarEstado(cita.id, "cancelada")}
                  className="text-xs border border-line rounded-full px-3 py-1 hover:border-signal/50 hover:text-signal transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <span className={`text-xs capitalize px-3 py-1 rounded-full border ${
                cita.estado === "completada"
                  ? "text-green-400 border-green-700/30 bg-green-900/10"
                  : "text-signal/50 border-signal/30"
              }`}>
                {cita.estado}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
