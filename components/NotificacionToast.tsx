"use client";

import { useEffect, useState, useCallback } from "react";
import type { EventoSSE } from "@/lib/hooks/useEventosSSE";

type Toast = {
  id: string;
  type: "cita" | "recordatorio";
  eventType?: string;
  titulo: string;
  descripcion: string;
  color: string;
  timestamp: number;
};

let toastId = 0;

function crearToast(evento: EventoSSE): Toast | null {
  if (evento.type === "connected") return null;

  if (evento.type === "recordatorio") {
    const d = evento.data;
    return {
      id: String(++toastId),
      type: "recordatorio",
      titulo: "⏰ Recordatorio",
      descripcion: `${d.cliente} — ${d.servicio ?? "Sin servicio"} a las ${d.hora}`,
      color: "border-l-yellow-500 bg-yellow-500/10",
      timestamp: Date.now(),
    };
  }

  if (evento.type === "cita") {
    const d = evento.data;
    const nombre = d.new?.nombre_cliente ?? d.old?.nombre_cliente ?? "";
    const servicio = d.new?.servicios?.nombre ?? "";

    switch (d.event) {
      case "INSERT":
        return {
          id: String(++toastId),
          type: "cita",
          eventType: "INSERT",
          titulo: "🆕 Nueva cita",
          descripcion: `${nombre} — ${servicio}`,
          color: "border-l-green-500 bg-green-500/10",
          timestamp: Date.now(),
        };
      case "UPDATE":
        return {
          id: String(++toastId),
          type: "cita",
          eventType: "UPDATE",
          titulo: "✏️ Cita actualizada",
          descripcion: `${nombre}`,
          color: "border-l-blue-500 bg-blue-500/10",
          timestamp: Date.now(),
        };
      case "DELETE":
        return {
          id: String(++toastId),
          type: "cita",
          eventType: "DELETE",
          titulo: "🗑️ Cita eliminada",
          descripcion: nombre,
          color: "border-l-red-500 bg-red-500/10",
          timestamp: Date.now(),
        };
    }
  }

  return null;
}

export default function NotificacionToast({
  evento,
}: {
  evento: EventoSSE | null;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remover = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!evento) return;
    const toast = crearToast(evento);
    if (!toast) return;

    setToasts((prev) => {
      const siguientes = [...prev, toast];
      return siguientes.slice(-3);
    });

    const timer = setTimeout(() => remover(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [evento, remover]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto border border-line rounded-lg p-4 shadow-lg bg-surface border-l-4 ${toast.color} motion-safe:animate-fade-up`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-cream">{toast.titulo}</p>
              <p className="text-xs text-cream/60 mt-0.5 truncate">
                {toast.descripcion}
              </p>
            </div>
            <button
              onClick={() => remover(toast.id)}
              className="text-cream/30 hover:text-cream/70 transition-colors shrink-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="mt-2 h-0.5 bg-line/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-brass/50 rounded-full animate-shrink"
              style={{
                animation: `shrink 6s linear forwards`,
              }}
            />
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
