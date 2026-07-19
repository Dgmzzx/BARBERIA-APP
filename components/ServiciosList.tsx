"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import type { Servicio } from "@/lib/types";

export default function ServiciosList({
  serviciosIniciales,
  negocioId,
}: {
  serviciosIniciales: Servicio[];
  negocioId: string;
}) {
  const [servicios, setServicios] = useState(serviciosIniciales);

  async function toggleActivo(id: string, activo: boolean) {
    const supabase = crearClienteSupabase();
    const { error } = await supabase
      .from("servicios")
      .update({ activo: !activo })
      .eq("id", id);

    if (error) {
      alert("No se pudo actualizar el servicio.");
      return;
    }
    setServicios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s))
    );
  }

  if (servicios.length === 0) {
    return <p className="text-cream/40 text-sm">No hay servicios registrados.</p>;
  }

  return (
    <div className="space-y-2">
      {servicios.map((s) => (
        <div
          key={s.id}
          className="border border-line rounded-lg p-4 bg-surface/30 flex items-center justify-between"
        >
          <div>
            <p className={`font-medium text-sm ${!s.activo ? "text-cream/40" : ""}`}>
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
  );
}
