"use client";

import { useState, useEffect } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import {
  formatearHora12h,
  formatearFechaLarga,
  normalizarTelefono,
  badgeColor,
  etiquetaEstado,
} from "@/lib/helpers";
import type { CitaHistorial } from "@/lib/types";

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

const claseSeccion =
  "text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55";

const claseAccion =
  "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs text-cream/70 transition-colors hover:border-cream/25 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40";

export default function FichaCliente({
  cita,
  onClose,
}: {
  cita: CitaConServicio;
  onClose: () => void;
}) {
  const [historial, setHistorial] = useState<CitaConServicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambios, setCambios] = useState<CitaHistorial[]>([]);
  const [cargandoCambios, setCargandoCambios] = useState(true);

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

  useEffect(() => {
    const supabase = crearClienteSupabase();
    supabase
      .from("citas_historial")
      .select("*")
      .eq("cita_id", cita.id)
      .order("creado_en", { ascending: false })
      .then(({ data }) => {
        setCambios(data ?? []);
        setCargandoCambios(false);
      });
  }, [cita.id]);

  useEffect(() => {
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onClose]);

  function abrirWhatsApp(telefono: string) {
    const normalizado = normalizarTelefono(telefono);
    if (!normalizado || normalizado.length < 8) return;
    window.open(`https://wa.me/${normalizado}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ficha-titulo"
    >
      <div className="fixed inset-0 bg-ink/70" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_32px_80px_-32px_rgba(0,0,0,0.9)] motion-safe:animate-fade-up">
        <header className="flex items-center justify-between gap-3 border-b border-line/60 px-5 py-4 sm:px-6">
          <h2
            id="ficha-titulo"
            className="truncate font-display text-xl text-cream"
          >
            {cita.nombre_cliente}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cream/55 transition-colors hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
          >
            <svg
              width="18"
              height="18"
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
        </header>

        <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <section>
            <h3 className={claseSeccion}>Datos del cliente</h3>
            <dl className="mt-3 grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-cream/55">Nombre</dt>
              <dd className="min-w-0 break-words text-cream">
                {cita.nombre_cliente}
              </dd>
              <dt className="text-cream/55">Teléfono</dt>
              <dd className="font-mono text-[13px] tabular-nums text-cream">
                {cita.telefono_cliente}
              </dd>
              {cita.correo_cliente && (
                <>
                  <dt className="text-cream/55">Correo</dt>
                  <dd className="min-w-0 break-words text-cream">
                    {cita.correo_cliente}
                  </dd>
                </>
              )}
              {cita.notas_cliente && (
                <>
                  <dt className="text-cream/55">Notas</dt>
                  <dd className="min-w-0 break-words leading-relaxed text-cream/85">
                    {cita.notas_cliente}
                  </dd>
                </>
              )}
            </dl>
          </section>

          {cita.telefono_cliente && (
            <section>
              <h3 className={claseSeccion}>Contacto</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => abrirWhatsApp(cita.telefono_cliente)}
                  className={`${claseAccion} hover:border-green-400/40 hover:text-green-400`}
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
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                  WhatsApp
                </button>
                <a
                  href={`tel:${normalizarTelefono(cita.telefono_cliente)}`}
                  className={claseAccion}
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                  Llamar
                </a>
              </div>
            </section>
          )}

          <section>
            <h3 className={claseSeccion}>Cita actual</h3>
            <div className="mt-3 rounded-xl border border-line/70 bg-ink/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-base text-cream">
                  {cita.servicios?.nombre ?? "Sin servicio"}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeColor(cita.estado)}`}
                >
                  {etiquetaEstado(cita.estado)}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-cream/55">
                {formatearFechaLarga(cita.fecha)} ·{" "}
                <span className="font-mono tabular-nums">
                  {formatearHora12h(cita.hora)}
                </span>
              </p>
            </div>
          </section>

          <section>
            <h3 className={claseSeccion}>Historial de cambios</h3>
            <div className="mt-3">
              {cargandoCambios ? (
                <p className="text-sm text-cream/55">Cargando…</p>
              ) : cambios.length === 0 ? (
                <p className="text-sm text-cream/55">Sin cambios registrados.</p>
              ) : (
                <div className="space-y-2">
                  {cambios.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line/70 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-cream">
                          {c.tipo_cambio === "estado"
                            ? "Cambio de estado"
                            : c.tipo_cambio === "reprogramacion"
                              ? "Reprogramación"
                              : "Cancelación"}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] tabular-nums text-cream/55">
                          {new Date(c.creado_en).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeColor(c.estado)}`}
                      >
                        {etiquetaEstado(c.estado)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className={claseSeccion}>Historial de citas</h3>
            <div className="mt-3">
              {cargando ? (
                <p className="text-sm text-cream/55">Cargando historial…</p>
              ) : historial.length === 0 ? (
                <p className="text-sm text-cream/55">Sin citas anteriores.</p>
              ) : (
                <div className="space-y-2">
                  {historial.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line/70 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-cream">
                          {h.servicios?.nombre ?? "Sin servicio"}
                        </p>
                        <p className="mt-0.5 text-[13px] text-cream/55">
                          {formatearFechaLarga(h.fecha)} ·{" "}
                          <span className="font-mono text-xs tabular-nums">
                            {formatearHora12h(h.hora)}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeColor(h.estado)}`}
                      >
                        {etiquetaEstado(h.estado)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
