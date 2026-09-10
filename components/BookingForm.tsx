"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import type { Negocio, Servicio, Horario } from "@/lib/types";
import { formatearHora12h, obtenerRangosDelDia, normalizarTelefono, validarTelefono, validarEmail } from "@/lib/helpers";

type Paso = "servicio" | "horario" | "datos" | "confirmado";

export default function BookingForm({
  negocio,
  servicios,
  horarios: horariosProp,
}: {
  negocio: Negocio;
  servicios: Servicio[];
  horarios: Horario[];
}) {
  const [paso, setPaso] = useState<Paso>("servicio");
  const [servicioElegido, setServicioElegido] = useState<Servicio | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [horasPosibles, setHorasPosibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [fechaInvalida, setFechaInvalida] = useState("");

  const fechaDeHoy = new Date().toISOString().split("T")[0];
  const ahora = new Date();
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
  const horasDisponibles = horasPosibles.filter((h) => {
    if (horasOcupadas.includes(h)) return false;
    if (fecha === fechaDeHoy) {
      const [hh, mm] = h.split(":").map(Number);
      if (hh * 60 + mm <= minutosActuales) return false;
    }
    return true;
  });
  const horarios = horariosProp;

  const fechaObj = fecha ? new Date(fecha + "T12:00:00") : null;
  const fechaFormateada = fechaObj
    ? fechaObj.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const pasosProgreso = [
    { id: 1, label: "Servicio", hecho: !!servicioElegido, actual: !servicioElegido },
    {
      id: 2,
      label: "Fecha y hora",
      hecho: !!fecha && !!hora,
      actual: !!servicioElegido && (!fecha || !hora),
    },
    { id: 3, label: "Tus datos", hecho: false, actual: !!servicioElegido && !!fecha && !!hora },
  ];

  function diaEsLaborable(fechaStr: string): boolean {
    const d = new Date(fechaStr + "T12:00:00");
    const jsDay = d.getDay();
    const diaLocal = jsDay === 0 ? 7 : jsDay;
    return horarios.some((h) => h.dia_semana === diaLocal);
  }

  async function fechaEstaBloqueada(fechaStr: string): Promise<boolean> {
    const supabase = crearClienteSupabase();
    const { data } = await supabase
      .from("bloqueos")
      .select("id")
      .eq("negocio_id", negocio.id)
      .eq("fecha", fechaStr)
      .maybeSingle();
    return !!data;
  }

  async function alElegirFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setHora("");
    setError("");
    setHorasOcupadas([]);
    setFechaInvalida("");

    if (!diaEsLaborable(nuevaFecha)) {
      setFechaInvalida("Ese día no es laborable.");
      return;
    }

    const bloqueada = await fechaEstaBloqueada(nuevaFecha);
    if (bloqueada) {
      setFechaInvalida("Ese día está bloqueado (vacaciones, feriado…).");
      return;
    }

    const d = new Date(nuevaFecha + "T12:00:00");
    const diaLocal = d.getDay() === 0 ? 7 : d.getDay();
    const rangos = obtenerRangosDelDia(horarios, diaLocal);
    setHorasPosibles(rangos.length > 0 ? generarHoras(rangos) : []);

    setCargandoHoras(true);

    const supabase = crearClienteSupabase();
    const { data } = await supabase
      .from("citas")
      .select("hora")
      .eq("negocio_id", negocio.id)
      .eq("fecha", nuevaFecha)
      .neq("estado", "cancelada");

    setHorasOcupadas((data ?? []).map((c) => c.hora.slice(0, 5)));
    setCargandoHoras(false);
  }

  async function confirmarCita() {
    const nombreLimpio = nombre.trim();
    const telefonoNormalizado = normalizarTelefono(telefono);
    const correoLimpio = correo.trim();

    if (!servicioElegido || !fecha || !hora || !nombreLimpio) return;
    if (!telefono) return;

    if (nombreLimpio.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!validarTelefono(telefonoNormalizado)) {
      setError("El teléfono debe tener entre 8 y 15 dígitos.");
      return;
    }
    if (correoLimpio && !validarEmail(correoLimpio)) {
      setError("El correo electrónico no tiene un formato válido.");
      return;
    }

    setEnviando(true);
    setError("");

    const respuesta = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        negocio_id: negocio.id,
        servicio_id: servicioElegido.id,
        nombre_cliente: nombreLimpio,
        telefono_cliente: telefonoNormalizado,
        correo_cliente: correoLimpio || null,
        notas_cliente: notas.trim() || null,
        fecha,
        hora,
      }),
    });

    setEnviando(false);

    if (!respuesta.ok) {
      const data = await respuesta.json().catch(() => null);
      setError(data?.error ?? "No se pudo reservar la cita. Intenta de nuevo.");
      if (respuesta.status === 409) alElegirFecha(fecha);
      return;
    }
    setPaso("confirmado");
  }

  if (paso === "confirmado") {
    return (
      <div className="motion-safe:animate-fade-up">
        <div className="bg-paper text-ink rounded-md overflow-hidden shadow-lg">
          <div className="barber-rule" />
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">
                Ticket de reserva
              </p>
              <div
                className="motion-safe:animate-stamp-in font-display text-sm text-signal border border-signal/60 px-3 py-1 tracking-[0.15em] select-none"
                style={{ transform: "rotate(6deg)" }}
              >
                CONFIRMADO
              </div>
            </div>

            <div className="mb-6">
              <p className="font-display text-2xl sm:text-3xl text-ink leading-tight">
                {servicioElegido?.nombre}
              </p>
              <p className="font-mono text-xs text-ink/40 mt-1.5">
                {servicioElegido?.duracion_minutos} min · ${servicioElegido?.precio}
              </p>
            </div>

            <div className="flex justify-between items-end gap-4 mb-6">
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-ink/30 uppercase tracking-widest mb-1">
                  Fecha
                </p>
                <p className="font-body text-sm sm:text-base text-ink leading-snug">
                  {fechaFormateada}
                </p>
              </div>
              <div className="text-right shrink-0 whitespace-nowrap">
                <p className="font-mono text-[10px] text-ink/30 uppercase tracking-widest mb-1">
                  Hora
                </p>
                <p className="font-mono text-2xl sm:text-3xl text-ink leading-none tracking-tight">
                  {formatearHora12h(hora)}
                </p>
              </div>
            </div>

            <div className="border-t border-dashed border-ink/20 pt-5">
              <p className="font-display text-lg text-ink">
                {nombre}, te esperamos en la silla
              </p>
              <p className="font-mono text-[11px] text-ink/40 mt-2">
                Guárdate esta página como tu ticket de reserva.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface/60 border border-line rounded-2xl overflow-hidden">
      <div className="barber-rule" />
      <div className="p-5 sm:p-8">
        <div
          className="flex items-center gap-2 sm:gap-4 mb-8"
          role="status"
          aria-label={`Paso ${pasosProgreso.findIndex((p) => p.actual) + 1} de 3`}
        >
          {pasosProgreso.map((p, i) => {
            const esUltimo = i === pasosProgreso.length - 1;
            const puntoClase = p.hecho
              ? "bg-brass"
              : p.actual
                ? "bg-signal ring-4 ring-signal/20"
                : "bg-line";
            return (
              <div key={p.id} className={`flex items-center gap-2 ${esUltimo ? "" : "flex-1"}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-200 ${puntoClase}`} />
                <span
                  className={`hidden sm:block font-mono text-[11px] uppercase tracking-[0.12em] whitespace-nowrap ${
                    p.actual ? "text-brass" : p.hecho ? "text-cream/65" : "text-cream/55"
                  }`}
                >
                  {p.label}
                </span>
                {!esUltimo && <span className={`flex-1 h-px ${p.hecho ? "bg-brass/50" : "bg-line"}`} />}
              </div>
            );
          })}
        </div>

        <div className="space-y-10">

      {/* Paso 1: servicio */}
      <section className="motion-safe:animate-fade-up">
        <label className="block font-mono text-[11px] text-brass uppercase tracking-[0.15em]">
          Paso 1 de 3 — Elige tu servicio
        </label>
        <div className="barber-strip mt-4 mb-6" />

        {servicios.length === 0 && (
          <p className="font-mono text-xs text-cream/55">
            No hay servicios disponibles por el momento. Vuelve más tarde.
          </p>
        )}

        <div className="space-y-2">
          {servicios.map((s) => {
            const selected = servicioElegido?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setServicioElegido(s);
                  setPaso("horario");
                }}
                className={`group relative w-full text-left border rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-[0.99]
                  ${selected
                    ? "border-brass/60 bg-brass/[0.08] ring-1 ring-brass/25 shadow-lg shadow-black/20"
                    : "border-line hover:border-brass/40 hover:bg-surface-hover hover:shadow-lg hover:shadow-black/15 hover:-translate-y-0.5"
                  }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 inset-y-0 w-[3px] rounded-l-xl bg-brass transition-opacity duration-200 ${
                    selected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  }`}
                />
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className={`font-display text-lg leading-snug ${selected ? "text-brass" : "text-cream"}`}>
                      {s.nombre}
                    </span>
                    {s.descripcion && (
                      <p className="font-body text-sm text-cream/65 mt-1.5">
                        {s.descripcion}
                      </p>
                    )}
                    <p className="font-mono text-[11px] text-cream/55 tracking-wide mt-2">
                      ≈ {s.duracion_minutos} min
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="font-mono text-base text-brass tabular-nums">
                      ${s.precio}
                    </span>
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-200 ${
                        selected ? "bg-brass border-brass text-ink" : "border-line text-transparent"
                      }`}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Paso 2: fecha y hora */}
      {servicioElegido && (
        <section className="motion-safe:animate-fade-up">
          <label className="block font-mono text-[11px] text-brass uppercase tracking-[0.15em]">
            Paso 2 de 3 — Fecha y hora
          </label>
          <div className="barber-strip mt-4 mb-6" />
          <div className="space-y-4">
            <input
              type="date"
              value={fecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => alElegirFecha(e.target.value)}
className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-base text-cream placeholder:text-muted resize-none
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />

            {error && (
              <p className="font-mono text-xs text-red-400">{error}</p>
            )}

            {cargandoHoras && (
              <p className="font-mono text-xs text-cream/55">Buscando horarios disponibles...</p>
            )}

            {!cargandoHoras && !fechaInvalida && fecha && horasDisponibles.length === 0 && (
              <p className="font-mono text-xs text-cream/55">
                No quedan horarios libres ese día. Prueba con otra fecha.
              </p>
            )}

            {!cargandoHoras && !fechaInvalida && horasDisponibles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {horasDisponibles.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHora(h)}
                    className={`font-mono text-sm border rounded-md py-3 px-2 transition-all duration-150 active:scale-[0.97]
                      ${hora === h
                        ? "bg-brass text-ink border-brass font-medium"
                        : "border-line text-cream/70 hover:border-brass/30 hover:text-cream/90"
                      }`}
                  >
                    {formatearHora12h(h)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Paso 3: datos del cliente */}
      {servicioElegido && fecha && hora && !fechaInvalida && (
        <section className="motion-safe:animate-fade-up">
          <label className="block font-mono text-[11px] text-brass uppercase tracking-[0.15em]">
            Paso 3 de 3 — Tus datos
          </label>
          <div className="barber-strip mt-4 mb-6" />
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tu nombre y apellido"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-base text-cream placeholder:text-muted
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />
            <input
              type="tel"
              placeholder="Tu teléfono / WhatsApp"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-base text-cream placeholder:text-muted
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />
            <input
              type="email"
              placeholder="Correo (opcional, para tu recordatorio)"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-base text-cream placeholder:text-muted
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />
            <textarea
              placeholder="¿Algo que el barbero deba saber? (opcional)"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full bg-surface border border-line rounded-md px-4 py-3
                         font-body text-base text-cream placeholder:text-muted resize-none
                         focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
                         transition-all duration-150"
            />

            {servicioElegido && (
              <div className="bg-paper text-ink rounded-md border border-ink/10 overflow-hidden motion-safe:animate-fade-up">
                <div className="flex justify-between items-center px-4 py-2.5 border-b border-dashed border-ink/25">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                    Tu cita
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                    {negocio.nombre}
                  </span>
                </div>
                <div className="px-4 py-4">
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-display text-lg text-ink leading-snug min-w-0 break-words">
                      {servicioElegido.nombre}
                    </span>
                    <span className="font-mono text-sm text-ink tabular-nums shrink-0">
                      ${servicioElegido.precio}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-ink/25 my-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-1">
                        Fecha
                      </p>
                      <p className="font-body text-sm text-ink leading-snug">{fechaFormateada}</p>
                    </div>
                    <div className="text-right shrink-0 whitespace-nowrap">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mb-1">
                        Hora
                      </p>
                      <p className="font-mono text-sm sm:text-base text-ink">
                        {formatearHora12h(hora)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="font-mono text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={confirmarCita}
              disabled={!nombre.trim() || !telefono || enviando}
              className="w-full bg-signal text-cream text-sm font-semibold tracking-wide
                         rounded-md px-8 py-3.5
                         shadow-lg shadow-signal/20
                         transition-all duration-150
                         hover:bg-signal/90 active:scale-[0.97]
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {enviando ? "Reservando tu cita…" : "Reservar mi cita"}
            </button>
          </div>
        </section>
      )}
        </div>
      </div>
    </div>
  );
}

function generarHoras(rangos: { apertura: string; cierre: string }[]): string[] {
  const horas: string[] = [];
  for (const { apertura, cierre } of rangos) {
    let [h, m] = apertura.split(":").map(Number);
    const [hFin, mFin] = cierre.split(":").map(Number);
    while (h < hFin || (h === hFin && m < mFin)) {
      horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += 30;
      if (m >= 60) { m = 0; h += 1; }
    }
  }
  return horas;
}
