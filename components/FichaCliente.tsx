"use client";

import { useState, useEffect } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { formatearHora12h, normalizarTelefono } from "@/lib/helpers";

type CitaConServicio = {
  id: string;
  negocio_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  correo_cliente: string | null;
  notas_cliente: string | null;
  fecha: string;
  hora: string;
  estado: string;
  servicios: { nombre: string } | null;
};

export default function FichaCliente({
  cita,
  onClose,
}: {
  cita: CitaConServicio;
  onClose: () => void;
}) {
  const [historial, setHistorial] = useState<CitaConServicio[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const supabase = crearClienteSupabase();
    supabase
      .from("citas")
      .select("*, servicios(nombre)")
      .eq("negocio_id", cita.negocio_id)
      .eq("telefono_cliente", cita.telefono_cliente)
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false })
      .then(({ data }) => {
        setHistorial(data ?? []);
        setCargando(false);
      });
  }, [cita.negocio_id, cita.telefono_cliente]);

  function abrirWhatsApp(telefono: string) {
    const normalizado = normalizarTelefono(telefono);
    if (!normalizado || normalizado.length < 8) return;
    window.open(`https://wa.me/${normalizado}`, "_blank", "noopener,noreferrer");
  }

  function badgeColor(estado: string) {
    if (estado === "completada")
      return "text-midnight-tertiary border-midnight-tertiary/30 bg-midnight-tertiary/20";
    if (estado === "cancelada")
      return "text-midnight-error border-midnight-error/30 bg-midnight-error/20";
    return "text-midnight-secondary border-midnight-secondary/30 bg-midnight-secondary/20";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-midnight-surface-container border border-midnight-outline rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto motion-safe:animate-fade-up">
        <div className="sticky top-0 bg-midnight-surface-container border-b border-midnight-outline/50 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-midnight-on-surface">
            {cita.nombre_cliente}
          </h2>
          <button
            onClick={onClose}
            className="text-midnight-on-surface-variant/60 hover:text-midnight-on-surface transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section>
            <h3 className="font-mono text-[11px] text-midnight-secondary uppercase tracking-[0.15em] mb-3">
              Datos del cliente
            </h3>
            <div className="space-y-2 text-sm text-midnight-on-surface">
              <p>
                <span className="text-midnight-on-surface-variant/60">Nombre:</span>{" "}
                {cita.nombre_cliente}
              </p>
              <p>
                <span className="text-midnight-on-surface-variant/60">Teléfono:</span>{" "}
                {cita.telefono_cliente}
              </p>
              {cita.correo_cliente && (
                <p>
                  <span className="text-midnight-on-surface-variant/60">Correo:</span>{" "}
                  {cita.correo_cliente}
                </p>
              )}
              {cita.notas_cliente && (
                <p>
                  <span className="text-midnight-on-surface-variant/60">Notas:</span>{" "}
                  {cita.notas_cliente}
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-mono text-[11px] text-midnight-secondary uppercase tracking-[0.15em] mb-3">
              Acciones
            </h3>
            <div className="flex gap-2">
              {cita.telefono_cliente && (
                <>
                  <button
                    onClick={() => abrirWhatsApp(cita.telefono_cliente)}
                    className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-green-500 hover:text-green-500 transition-colors"
                  >
                    WhatsApp
                  </button>
                  <a
                    href={`tel:${normalizarTelefono(cita.telefono_cliente)}`}
                    className="text-xs border border-midnight-outline rounded-full px-3 py-1 hover:border-midnight-secondary hover:text-midnight-secondary transition-colors"
                  >
                    Llamar
                  </a>
                </>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-mono text-[11px] text-midnight-secondary uppercase tracking-[0.15em] mb-3">
              Cita actual
            </h3>
            <div className="bg-midnight-surface-container-high/50 border border-midnight-outline/30 rounded-md p-4 space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-display text-base text-midnight-on-surface">
                  {cita.servicios?.nombre ?? "Sin servicio"}
                </p>
                <span
                  className={`text-xs capitalize px-2.5 py-1 rounded-full border shrink-0 ${badgeColor(cita.estado)}`}
                >
                  {cita.estado}
                </span>
              </div>
              <p className="text-sm text-midnight-on-surface-variant">
                {cita.fecha} · {formatearHora12h(cita.hora)}
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-mono text-[11px] text-midnight-secondary uppercase tracking-[0.15em] mb-3">
              Historial de citas
            </h3>
            {cargando ? (
              <p className="text-sm text-midnight-on-surface-variant/60">
                Cargando historial...
              </p>
            ) : historial.length === 0 ? (
              <p className="text-sm text-midnight-on-surface-variant/60">
                Sin citas anteriores.
              </p>
            ) : (
              <div className="space-y-2">
                {historial.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between border border-midnight-outline/20 rounded-md px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm text-midnight-on-surface">
                        {h.servicios?.nombre ?? "Sin servicio"}
                      </p>
                      <p className="text-xs text-midnight-on-surface-variant/60">
                        {h.fecha} · {formatearHora12h(h.hora)}
                      </p>
                    </div>
                    <span
                      className={`text-xs capitalize px-2 py-0.5 rounded-full border shrink-0 ${badgeColor(h.estado)}`}
                    >
                      {h.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
