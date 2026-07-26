import { useEffect, useRef, useState } from "react";

export type EventoSSE =
  | { type: "connected" }
  | {
      type: "cita";
      data: { event: "INSERT" | "UPDATE" | "DELETE"; new: any; old: any };
    }
  | {
      type: "recordatorio";
      data: {
        event: "recordatorio";
        id: string;
        cliente: string;
        servicio: string;
        hora: string;
      };
    };

export function useEventosSSE(
  negocioId: string | null
): EventoSSE | null {
  const [ultimoEvento, setUltimoEvento] = useState<EventoSSE | null>(null);
  const ultimoRef = useRef<EventoSSE | null>(null);

  useEffect(() => {
    if (!negocioId) return;

    const es = new EventSource(`/api/sse?negocio_id=${negocioId}`);

    es.addEventListener("connected", () => {
      ultimoRef.current = { type: "connected" };
      setUltimoEvento({ type: "connected" });
    });

    es.addEventListener("cita", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const evento: EventoSSE = { type: "cita", data };
      ultimoRef.current = evento;
      setUltimoEvento(evento);
    });

    es.addEventListener("recordatorio", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const evento: EventoSSE = { type: "recordatorio", data };
      ultimoRef.current = evento;
      setUltimoEvento(evento);
    });

    es.onerror = () => {};

    return () => {
      es.close();
    };
  }, [negocioId]);

  return ultimoEvento;
}
