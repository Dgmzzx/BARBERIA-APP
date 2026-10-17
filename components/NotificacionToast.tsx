"use client";

import { useEffect, useState, useCallback } from "react";
import type { EventoSSE } from "@/lib/hooks/useEventosSSE";

type Toast = {
  id: string;
  type: "cita" | "recordatorio";
  eventType?: string;
  titulo: string;
  descripcion: string;
  punto: string;
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
      titulo: "Recordatorio",
      descripcion: `${d.cliente} — ${d.servicio ?? "Sin servicio"} a las ${d.hora}`,
      punto: "bg-amber-400",
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
          titulo: "Nueva cita",
          descripcion: `${nombre} — ${servicio}`,
          punto: "bg-brass",
          timestamp: Date.now(),
        };
      case "UPDATE":
        return {
          id: String(++toastId),
          type: "cita",
          eventType: "UPDATE",
          titulo: "Cita actualizada",
          descripcion: `${nombre}`,
          punto: "bg-cream/60",
          timestamp: Date.now(),
        };
      case "DELETE":
        return {
          id: String(++toastId),
          type: "cita",
          eventType: "DELETE",
          titulo: "Cita eliminada",
          descripcion: nombre,
          punto: "bg-red-400",
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
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-xl border border-line bg-surface/95 p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)] motion-safe:animate-fade-up"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toast.punto}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-cream">{toast.titulo}</p>
              <p className="mt-0.5 truncate text-xs text-cream/55">
                {toast.descripcion}
              </p>
            </div>
            <button
              onClick={() => remover(toast.id)}
              aria-label="Descartar notificación"
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-cream/55 transition-colors hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-line/50">
            <div
              className="h-full rounded-full bg-brass/60"
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
