"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { formatearHora12h, normalizarTelefono, badgeColor } from "@/lib/helpers";
import type { Horario } from "@/lib/types";
import FichaCliente from "./FichaCliente";
import ReprogramarCitaModal from "./ReprogramarCitaModal";
import CancelarCitaModal from "./CancelarCitaModal";

type CitaConServicio = {
  id: string;
  negocio_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  correo_cliente: string | null;
  notas_cliente: string | null;
  motivo_cancelacion: string | null;
  fecha: string;
  hora: string;
  estado: string;
  servicios: { nombre: string } | null;
};

export default function PanelCitas({
  citasIniciales,
  horarios,
}: {
  citasIniciales: CitaConServicio[];
  horarios: Horario[];
}) {
  const [citas, setCitas] = useState(citasIniciales);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaConServicio | null>(null);
  const [citaReprogramar, setCitaReprogramar] = useState<CitaConServicio | null>(null);
  const [citaCancelar, setCitaCancelar] = useState<CitaConServicio | null>(null);

  async function actualizarEstado(id: string, estado: string) {
    const supabase = crearClienteSupabase();
    const { error } = await supabase.from("citas").update({ estado }).eq("id", id);

    if (error) {
      alert("No se pudo actualizar la cita. Intenta de nuevo.");
      return;
    }
    setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado } : c)));
  }

  function abrirWhatsApp(telefono: string) {
    const normalizado = normalizarTelefono(telefono);
    if (!normalizado) {
      alert("El cliente no tiene un número de teléfono registrado.");
      return;
    }
    if (normalizado.length < 8) {
      alert("El número de teléfono no es válido.");
      return;
    }
    try {
      window.open(`https://wa.me/${normalizado}`, "_blank", "noopener,noreferrer");
    } catch {
      alert("No se pudo abrir WhatsApp. Intenta de nuevo.");
    }
  }

  async function reprogramarCita(id: string, fecha: string, hora: string) {
    const supabase = crearClienteSupabase();
    const { error } = await supabase
      .from("citas")
      .update({ fecha, hora })
      .eq("id", id);

    if (error) {
      alert("No se pudo reprogramar la cita. Intenta de nuevo.");
      return;
    }
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, fecha, hora } : c))
    );
    setCitaReprogramar(null);
    alert("Cita reprogramada correctamente.");
  }

  async function confirmarCancelacion(id: string, motivo: string) {
    const estado = motivo === "No asistió" ? "no_asistio" : "cancelada";
    const supabase = crearClienteSupabase();
    const { error } = await supabase
      .from("citas")
      .update({ estado, motivo_cancelacion: motivo })
      .eq("id", id);

    if (error) {
      alert("No se pudo cancelar la cita. Intenta de nuevo.");
      return;
    }
    setCitas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, estado, motivo_cancelacion: motivo } : c
      )
    );
    setCitaCancelar(null);
    alert("Cita cancelada correctamente.");
  }

  if (citas.length === 0) {
    return <p className="text-midnight-on-surface-variant">Todavía no hay citas reservadas.</p>;
  }

  return (
    <div className="space-y-3">
      {citas.map((cita) => (
        <div
          key={cita.id}
          className="border border-midnight-outline rounded-lg p-4 bg-midnight-surface-container flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-midnight-on-surface">{cita.nombre_cliente}</p>
            <p className="text-sm text-midnight-on-surface-variant">
              {cita.servicios?.nombre} · {cita.fecha} {formatearHora12h(cita.hora)}
            </p>
            <p className="text-sm text-midnight-on-surface-variant/60">{cita.telefono_cliente}</p>
          </div>

          <div className="flex gap-2">
            {cita.estado === "pendiente" ? (
              <>
                <button
                  onClick={() => actualizarEstado(cita.id, "confirmada")}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-secondary hover:text-midnight-secondary transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setCitaCancelar(cita)}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-error/50 hover:text-midnight-error transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setCitaReprogramar(cita)}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-secondary hover:text-midnight-secondary transition-colors"
                  title="Reprogramar cita"
                >
                  Reprogramar
                </button>
              </>
            ) : cita.estado === "confirmada" ? (
              <>
                <button
                  onClick={() => actualizarEstado(cita.id, "en_proceso")}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-secondary hover:text-midnight-secondary transition-colors"
                >
                  En proceso
                </button>
                <button
                  onClick={() => setCitaCancelar(cita)}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-error/50 hover:text-midnight-error transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setCitaReprogramar(cita)}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-secondary hover:text-midnight-secondary transition-colors"
                  title="Reprogramar cita"
                >
                  Reprogramar
                </button>
              </>
            ) : cita.estado === "en_proceso" ? (
              <>
                <button
                  onClick={() => actualizarEstado(cita.id, "completada")}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-secondary hover:text-midnight-secondary transition-colors"
                >
                  Completar
                </button>
                <button
                  onClick={() => setCitaCancelar(cita)}
                  className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-error/50 hover:text-midnight-error transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <span className={`text-xs capitalize px-3 py-1 rounded-full border ${badgeColor(cita.estado)}`}>
                {cita.estado === "no_asistio" ? "No asistió" : cita.estado === "en_proceso" ? "En proceso" : cita.estado}
              </span>
            )}
            <button
              onClick={() => setCitaSeleccionada(cita)}
              className="border border-midnight-outline rounded-full p-1 hover:border-midnight-secondary hover:text-midnight-secondary transition-colors"
              title="Ver detalles del cliente"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
            {cita.telefono_cliente && (
              <button
                onClick={() => abrirWhatsApp(cita.telefono_cliente)}
                className="border border-midnight-outline rounded-full p-1 hover:border-green-500 hover:text-green-500 transition-colors"
                title="Contactar por WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {citaSeleccionada && (
        <FichaCliente
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
        />
      )}

      {citaReprogramar && (
        <ReprogramarCitaModal
          cita={citaReprogramar}
          horarios={horarios}
          onConfirm={(fecha, hora) => reprogramarCita(citaReprogramar.id, fecha, hora)}
          onClose={() => setCitaReprogramar(null)}
        />
      )}

      {citaCancelar && (
        <CancelarCitaModal
          onConfirm={(motivo) => confirmarCancelacion(citaCancelar.id, motivo)}
          onClose={() => setCitaCancelar(null)}
        />
      )}
    </div>
  );
}
