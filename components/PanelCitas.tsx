"use client";

import { useState, useEffect } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import {
  formatearHora12h,
  formatearFechaLarga,
  telefonoInternacional,
  mensajeWhatsApp,
  urlWhatsApp,
  badgeColor,
  etiquetaEstado,
  type TipoMensajeCita,
} from "@/lib/helpers";
import type { Horario } from "@/lib/types";
import { useEventosSSE } from "@/lib/hooks/useEventosSSE";
import NotificacionToast from "./NotificacionToast";
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

const claseAccionPrimaria =
  "rounded-lg bg-brass px-3 py-2 text-xs font-semibold text-ink transition-[filter,transform] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60";

const claseAccion =
  "rounded-lg border border-line px-3 py-2 text-xs text-cream/70 transition-colors hover:border-cream/25 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40";

const claseAccionPeligro =
  "rounded-lg border border-line px-3 py-2 text-xs text-cream/70 transition-colors hover:border-red-400/40 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40";

const claseIcono =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-line text-cream/55 transition-colors hover:border-cream/25 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40";

export default function PanelCitas({
  negocioId,
  negocioNombre,
  citasIniciales,
  horarios,
}: {
  negocioId: string;
  negocioNombre: string;
  citasIniciales: CitaConServicio[];
  horarios: Horario[];
}) {
  const [citas, setCitas] = useState(citasIniciales);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaConServicio | null>(null);
  const [citaReprogramar, setCitaReprogramar] = useState<CitaConServicio | null>(null);
  const [citaCancelar, setCitaCancelar] = useState<CitaConServicio | null>(null);
  const [eventoSSE, setEventoSSE] = useState<any>(null);

  const ultimoEvento = useEventosSSE(negocioId);

  useEffect(() => {
    if (!ultimoEvento || ultimoEvento.type === "connected") return;

    if (ultimoEvento.type === "cita") {
      const { event, new: nuevo, old: viejo } = ultimoEvento.data;

      if (event === "INSERT" && nuevo) {
        const nuevaCita: CitaConServicio = {
          id: nuevo.id,
          negocio_id: nuevo.negocio_id,
          nombre_cliente: nuevo.nombre_cliente,
          telefono_cliente: nuevo.telefono_cliente,
          correo_cliente: nuevo.correo_cliente ?? null,
          notas_cliente: nuevo.notas_cliente ?? null,
          motivo_cancelacion: nuevo.motivo_cancelacion ?? null,
          fecha: nuevo.fecha,
          hora: nuevo.hora,
          estado: nuevo.estado,
          servicios: nuevo.servicios ?? null,
        };
        setCitas((prev) => [nuevaCita, ...prev]);
      } else if (event === "UPDATE" && nuevo) {
        setCitas((prev) =>
          prev.map((c) =>
            c.id === nuevo.id
              ? { ...c, ...nuevo, servicios: nuevo.servicios ?? c.servicios }
              : c
          )
        );
      } else if (event === "DELETE" && viejo) {
        setCitas((prev) => prev.filter((c) => c.id !== viejo.id));
      }
    }

    setEventoSSE(ultimoEvento);
  }, [ultimoEvento]);

  async function actualizarEstado(id: string, estado: string): Promise<boolean> {
    const supabase = crearClienteSupabase();
    const { error } = await supabase.from("citas").update({ estado }).eq("id", id);

    if (error) {
      alert("No se pudo actualizar la cita. Intenta de nuevo.");
      return false;
    }
    const { error: histError } = await supabase.from("citas_historial").insert({
      cita_id: id,
      estado,
      tipo_cambio: "estado",
    });
    if (histError) console.error("Error al registrar historial:", histError);
    setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado } : c)));
    return true;
  }

  function abrirVentanaWhatsApp(): Window | null {
    return window.open("", "_blank");
  }

  function avisarPorWhatsApp(
    ventana: Window | null,
    cita: CitaConServicio,
    tipo: TipoMensajeCita,
    fecha = cita.fecha,
    hora = cita.hora,
  ) {
    if (!cita.telefono_cliente) {
      ventana?.close();
      return;
    }

    const mensaje = mensajeWhatsApp(tipo, {
      nombre: cita.nombre_cliente,
      negocio: negocioNombre,
      servicio: cita.servicios?.nombre ?? null,
      fecha,
      hora,
    });
    const url = urlWhatsApp(cita.telefono_cliente, mensaje);

    if (ventana) {
      ventana.location.href = url;
      return;
    }

    if (!window.open(url, "_blank")) {
      alert(
        "El navegador bloqueó la ventana de WhatsApp. Permite las ventanas emergentes para avisar al cliente.",
      );
    }
  }

  async function confirmarCita(cita: CitaConServicio) {
    const ventana = cita.telefono_cliente ? abrirVentanaWhatsApp() : null;
    const ok = await actualizarEstado(cita.id, "confirmada");
    if (!ok) {
      ventana?.close();
      return;
    }
    avisarPorWhatsApp(ventana, cita, "confirmada");
  }

  function abrirWhatsApp(telefono: string) {
    const normalizado = telefonoInternacional(telefono);
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
    const citaActual = citas.find((c) => c.id === id);
    const ventana = citaActual?.telefono_cliente ? abrirVentanaWhatsApp() : null;
    const supabase = crearClienteSupabase();
    const { error } = await supabase
      .from("citas")
      .update({ fecha, hora })
      .eq("id", id);

    if (error) {
      ventana?.close();
      alert("No se pudo reprogramar la cita. Intenta de nuevo.");
      return;
    }
    const { error: histError } = await supabase.from("citas_historial").insert({
      cita_id: id,
      estado: citaActual?.estado || "pendiente",
      tipo_cambio: "reprogramacion",
    });
    if (histError) console.error("Error al registrar historial:", histError);
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, fecha, hora } : c))
    );
    setCitaReprogramar(null);
    if (citaActual) {
      avisarPorWhatsApp(ventana, citaActual, "reprogramada", fecha, hora);
    } else {
      ventana?.close();
    }
    alert("Cita reprogramada correctamente.");
  }

  async function confirmarCancelacion(id: string, motivo: string) {
    const estado = motivo === "No asistió" ? "no_asistio" : "cancelada";
    const citaActual = citas.find((c) => c.id === id);
    const ventana =
      estado === "cancelada" && citaActual?.telefono_cliente
        ? abrirVentanaWhatsApp()
        : null;
    const supabase = crearClienteSupabase();
    const { error } = await supabase
      .from("citas")
      .update({ estado, motivo_cancelacion: motivo })
      .eq("id", id);

    if (error) {
      ventana?.close();
      alert("No se pudo cancelar la cita. Intenta de nuevo.");
      return;
    }
    const { error: histError } = await supabase.from("citas_historial").insert({
      cita_id: id,
      estado,
      tipo_cambio: "cancelacion",
    });
    if (histError) console.error("Error al registrar historial:", histError);
    setCitas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, estado, motivo_cancelacion: motivo } : c
      )
    );
    setCitaCancelar(null);
    if (estado === "cancelada") {
      if (citaActual) avisarPorWhatsApp(ventana, citaActual, "cancelada");
      else ventana?.close();
    }
    alert("Cita cancelada correctamente.");
  }

  if (citas.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
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
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="m9 16 2 2 4-4" />
          </svg>
        </span>
        <p className="mt-4 font-display text-lg text-cream">
          No hay citas por ahora
        </p>
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-cream/55">
          Cuando un cliente reserve, la cita aparecerá aquí al instante.
        </p>
        <NotificacionToast evento={eventoSSE} />
      </div>
    );
  }

  const grupos: [string, CitaConServicio[]][] = [];
  for (const cita of citas) {
    const grupo = grupos.find(([fecha]) => fecha === cita.fecha);
    if (grupo) grupo[1].push(cita);
    else grupos.push([cita.fecha, [cita]]);
  }

  return (
    <div className="space-y-8">
      {grupos.map(([fecha, delDia]) => (
        <section key={fecha}>
          {grupos.length > 1 && (
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-sm font-medium text-cream/80">
                {formatearFechaLarga(fecha)}
              </h3>
              <span className="font-mono text-[11px] tabular-nums text-cream/55">
                {delDia.length === 1 ? "1 cita" : `${delDia.length} citas`}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-line/70" />
            </div>
          )}

          <div className="space-y-2.5">
            {delDia.map((cita) => {
              const [horaTexto, periodo] = formatearHora12h(cita.hora).split(" ");
              return (
                <article
                  key={cita.id}
                  className="rounded-2xl border border-line bg-surface/50 p-4 transition-colors hover:border-cream/15 sm:px-5"
                >
                  <div className="flex gap-4">
                    <div className="w-14 shrink-0 pt-0.5 text-right">
                      <p className="font-mono text-[15px] leading-none tabular-nums text-brass">
                        {horaTexto}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-cream/55">
                        {periodo}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium text-cream">
                            {cita.nombre_cliente}
                          </p>
                          <p className="mt-0.5 truncate text-[13px] text-cream/55">
                            {cita.servicios?.nombre ?? "Sin servicio"}
                            <span className="text-cream/30"> · </span>
                            <span className="font-mono text-xs tabular-nums">
                              {cita.telefono_cliente}
                            </span>
                          </p>
                          {cita.motivo_cancelacion && (
                            <p className="mt-1 text-xs text-red-300/90">
                              Motivo: {cita.motivo_cancelacion}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeColor(cita.estado)}`}
                        >
                          {etiquetaEstado(cita.estado)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {cita.estado === "pendiente" && (
                          <>
                            <button
                              onClick={() => confirmarCita(cita)}
                              className={claseAccionPrimaria}
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setCitaReprogramar(cita)}
                              className={claseAccion}
                            >
                              Reprogramar
                            </button>
                            <button
                              onClick={() => setCitaCancelar(cita)}
                              className={claseAccionPeligro}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {cita.estado === "confirmada" && (
                          <>
                            <button
                              onClick={() => actualizarEstado(cita.id, "en_proceso")}
                              className={claseAccionPrimaria}
                            >
                              En proceso
                            </button>
                            <button
                              onClick={() => setCitaReprogramar(cita)}
                              className={claseAccion}
                            >
                              Reprogramar
                            </button>
                            <button
                              onClick={() => setCitaCancelar(cita)}
                              className={claseAccionPeligro}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {cita.estado === "en_proceso" && (
                          <>
                            <button
                              onClick={() => actualizarEstado(cita.id, "completada")}
                              className={claseAccionPrimaria}
                            >
                              Completar
                            </button>
                            <button
                              onClick={() => setCitaCancelar(cita)}
                              className={claseAccionPeligro}
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        <div className="ml-auto flex items-center gap-1.5">
                          <button
                            onClick={() => setCitaSeleccionada(cita)}
                            className={claseIcono}
                            aria-label={`Ver ficha de ${cita.nombre_cliente}`}
                            title="Ver detalles del cliente"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </button>
                          {cita.telefono_cliente && (
                            <button
                              onClick={() => abrirWhatsApp(cita.telefono_cliente)}
                              className={`${claseIcono} hover:border-green-400/40 hover:text-green-400`}
                              aria-label={`Escribir por WhatsApp a ${cita.nombre_cliente}`}
                              title="Contactar por WhatsApp"
                            >
                              <svg
                                width="16"
                                height="16"
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
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
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

      <NotificacionToast evento={eventoSSE} />
    </div>
  );
}
