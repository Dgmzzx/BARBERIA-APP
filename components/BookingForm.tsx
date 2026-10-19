"use client";

import { useEffect, useRef, useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import type { Negocio, Servicio, Horario } from "@/lib/types";
import { formatearHora12h, obtenerRangosDelDia, normalizarTelefono, sanearTelefonoInput, validarTelefono, validarEmail } from "@/lib/helpers";

type Paso = "servicio" | "horario" | "datos" | "confirmado";

const TITULOS_PASO: Record<1 | 2 | 3, string> = {
  1: "Servicio",
  2: "Fecha y hora",
  3: "Tus datos",
};

const claseCampo =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-base text-cream caret-brass outline-none transition-[background-color,border-color,color,box-shadow] duration-200 ease-ui placeholder:text-white/50 focus:border-brass/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-brass/20";

const claseFoco =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60";

const claseBotonPrimario =
  "w-full rounded-xl bg-brass px-6 py-3.5 text-[15px] font-semibold text-ink shadow-lg shadow-brass/25 transition-[filter,transform,opacity,box-shadow] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none";

const claseBotonSecundario =
  "shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-[15px] font-medium text-cream/85 transition-[background-color,border-color,color,transform] duration-150 ease-ui hover:border-white/20 hover:bg-white/[0.07] hover:text-cream active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

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

  const contenedorRef = useRef<HTMLDivElement>(null);
  const tituloPasoRef = useRef<HTMLHeadingElement>(null);
  const tituloConfirmadoRef = useRef<HTMLHeadingElement>(null);
  const pasoAnterior = useRef<Paso>(paso);

  const pasoMostrado: "servicio" | "horario" | "datos" =
    paso === "datos" && servicioElegido && fecha && hora && !fechaInvalida
      ? "datos"
      : paso !== "servicio" && servicioElegido
        ? "horario"
        : "servicio";

  const pasoActual: 1 | 2 | 3 =
    pasoMostrado === "datos" ? 3 : pasoMostrado === "horario" ? 2 : 1;

  useEffect(() => {
    if (pasoAnterior.current === paso) return;
    pasoAnterior.current = paso;

    if (paso === "confirmado") {
      tituloConfirmadoRef.current?.focus();
      return;
    }

    const reducirMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    contenedorRef.current?.scrollIntoView({
      behavior: reducirMovimiento ? "auto" : "smooth",
      block: "start",
    });
    tituloPasoRef.current?.focus({ preventScroll: true });
  }, [paso]);

  const fechaObj = fecha ? new Date(fecha + "T12:00:00") : null;
  const fechaFormateada = fechaObj
    ? fechaObj.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

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
      setError("El teléfono debe tener 10 dígitos.");
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
      const mensaje =
        data?.error ?? "No se pudo reservar la cita. Intenta de nuevo.";
      if (respuesta.status === 409) {
        setPaso("horario");
        await alElegirFecha(fecha);
      }
      setError(mensaje);
      return;
    }
    setPaso("confirmado");
  }

  function reiniciarFormulario() {
    setServicioElegido(null);
    setFecha("");
    setHora("");
    setNombre("");
    setTelefono("");
    setCorreo("");
    setNotas("");
    setError("");
    setEnviando(false);
    setHorasOcupadas([]);
    setHorasPosibles([]);
    setCargandoHoras(false);
    setFechaInvalida("");
    setPaso("servicio");
  }

  if (paso === "confirmado") {
    return (
      <div
        role="status"
        aria-label="Reserva confirmada"
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-md motion-safe:animate-fade-up"
      >
        <div className="p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brass/30 bg-brass/15">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brass"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2
            ref={tituloConfirmadoRef}
            tabIndex={-1}
            className="mt-5 text-balance font-display text-2xl leading-tight text-cream outline-none sm:text-3xl"
          >
            {nombre}, te esperamos en la silla
          </h2>

          <div className="mt-7 rounded-2xl bg-white/[0.04] px-4 text-left sm:px-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3.5">
              <span className="pt-0.5 text-[13px] text-white/60">Servicio</span>
              <span className="text-right">
                <span className="block text-[15px] font-medium text-cream">
                  {servicioElegido?.nombre}
                </span>
                <span className="mt-0.5 block text-[13px] text-white/60">
                  ≈ {servicioElegido?.duracion_minutos} min
                </span>
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
              <span className="text-[13px] text-white/60">Fecha</span>
              <span className="text-[15px] text-cream">{fechaFormateada}</span>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
              <span className="text-[13px] text-white/60">Hora</span>
              <span className="text-[15px] font-medium tabular-nums text-cream">
                {formatearHora12h(hora)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3.5">
              <span className="text-[13px] text-white/60">Total</span>
              <span className="text-[15px] font-semibold tabular-nums text-brass">
                ${servicioElegido?.precio}
              </span>
            </div>
          </div>

          <p className="mt-6 text-[13px] text-white/60">
            Guárdate esta página como tu ticket de reserva.
          </p>

          <button
            type="button"
            onClick={reiniciarFormulario}
            className={`mt-5 w-full ${claseBotonSecundario} ${claseFoco}`}
          >
            Reservar otra cita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={contenedorRef}
      className="scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-md sm:scroll-mt-10"
    >
      <div className="p-5 sm:p-7 lg:p-8">
        <div
          className="mb-8 sm:mb-10"
          role="status"
          aria-label={`Paso ${pasoActual} de 3: ${TITULOS_PASO[pasoActual]}`}
        >
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-cream">
              {TITULOS_PASO[pasoActual]}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-white/60">
              Paso {pasoActual} de 3
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              className="h-full origin-left transform-gpu rounded-full bg-brass transition-transform duration-[400ms] ease-ui"
              style={{ transform: `scaleX(${pasoActual / 3})` }}
            />
          </div>
        </div>

        {/* Paso 1: servicio */}
        {pasoMostrado === "servicio" && (
          <section className="motion-safe:animate-fade-up">
            <h2
              ref={tituloPasoRef}
              tabIndex={-1}
              className="text-lg font-semibold tracking-[-0.01em] text-cream outline-none"
            >
              Elige tu servicio
            </h2>

            {servicios.length === 0 && (
              <p className="mt-4 text-sm text-white/60">
                No hay servicios disponibles por el momento. Vuelve más tarde.
              </p>
            )}

            <div className="mt-4 space-y-2.5">
              {servicios.map((s) => {
                const selected = servicioElegido?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setServicioElegido(s)}
                    className={`group w-full rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ease-ui active:scale-[0.98] sm:p-5 ${claseFoco} ${
                      selected
                        ? "border-brass/60 bg-brass/[0.12] shadow-lg shadow-black/25"
                        : "border-white/10 bg-white/[0.04] hover:border-brass/40 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span
                          className={`block text-[17px] font-medium leading-snug tracking-[-0.01em] ${
                            selected ? "text-cream" : "text-cream/90"
                          }`}
                        >
                          {s.nombre}
                        </span>
                        {s.descripcion && (
                          <p className="mt-1 text-sm leading-relaxed text-white/60">
                            {s.descripcion}
                          </p>
                        )}
                        <p className="mt-2 text-[13px] text-white/60">
                          ≈ {s.duracion_minutos} min
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2.5">
                        <span className="text-[15px] font-medium tabular-nums text-brass">
                          ${s.precio}
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-200 ease-ui ${
                            selected
                              ? "border-brass bg-brass text-ink"
                              : "border-white/15 text-transparent"
                          }`}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
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

            <button
              type="button"
              onClick={() => setPaso("horario")}
              disabled={!servicioElegido}
              className={`mt-5 ${claseBotonPrimario} ${claseFoco}`}
            >
              Continuar
            </button>
          </section>
        )}

        {/* Paso 2: fecha y hora */}
        {pasoMostrado === "horario" && (
          <section className="motion-safe:animate-fade-up">
            <h2
              ref={tituloPasoRef}
              tabIndex={-1}
              className="text-lg font-semibold tracking-[-0.01em] text-cream outline-none"
            >
              Fecha y hora
            </h2>
            <p className="mt-1.5 text-[13px] text-white/60">
              {servicioElegido?.nombre} · ≈ {servicioElegido?.duracion_minutos} min{" "}
              <button
                type="button"
                onClick={() => setPaso("servicio")}
                className={`rounded font-medium text-brass underline-offset-2 transition-colors duration-150 ease-ui hover:underline ${claseFoco}`}
              >
                Cambiar
              </button>
            </p>
            <div className="mt-4 space-y-4">
              <input
                type="date"
                aria-label="Elige la fecha"
                value={fecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => alElegirFecha(e.target.value)}
                className={claseCampo}
              />

              {error && (
                <p className="text-[13px] font-medium text-red-400">{error}</p>
              )}

              {cargandoHoras && (
                <p className="text-[13px] text-white/60">
                  Buscando horarios disponibles...
                </p>
              )}

              {!cargandoHoras && !fechaInvalida && fecha && horasDisponibles.length === 0 && (
                <p className="text-[13px] text-white/60">
                  No quedan horarios libres ese día. Prueba con otra fecha.
                </p>
              )}

              {!cargandoHoras && !fechaInvalida && horasDisponibles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {horasDisponibles.map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={hora === h}
                      onClick={() => setHora(h)}
                      className={`rounded-xl border px-2 py-3 text-sm font-medium tabular-nums transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-ui active:scale-[0.97] ${claseFoco} ${
                        hora === h
                          ? "border-brass bg-brass text-ink shadow-lg shadow-brass/20"
                          : "border-white/10 bg-white/[0.04] text-cream/85 hover:border-brass/40 hover:bg-white/[0.08] hover:text-cream"
                      }`}
                    >
                      {formatearHora12h(h)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={() => setPaso("servicio")}
                className={`${claseBotonSecundario} ${claseFoco}`}
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setPaso("datos")}
                disabled={!hora || !!fechaInvalida || cargandoHoras}
                className={`${claseBotonPrimario} flex-1 ${claseFoco}`}
              >
                Continuar
              </button>
            </div>
          </section>
        )}

        {/* Paso 3: datos del cliente */}
        {pasoMostrado === "datos" && (
          <section className="motion-safe:animate-fade-up">
            <h2
              ref={tituloPasoRef}
              tabIndex={-1}
              className="text-lg font-semibold tracking-[-0.01em] text-cream outline-none"
            >
              Tus datos
            </h2>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                aria-label="Tu nombre y apellido"
                placeholder="Tu nombre y apellido"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={claseCampo}
              />
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                autoComplete="tel"
                aria-label="Tu teléfono o WhatsApp"
                placeholder="Tu teléfono / WhatsApp (10 dígitos)"
                value={telefono}
                onChange={(e) => setTelefono(sanearTelefonoInput(e.target.value))}
                className={claseCampo}
              />
              <input
                type="email"
                aria-label="Tu correo, opcional"
                placeholder="Correo (opcional, para tu recordatorio)"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={claseCampo}
              />
              <textarea
                aria-label="Notas para el barbero, opcional"
                placeholder="¿Algo que el barbero deba saber? (opcional)"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                maxLength={500}
                rows={3}
                className={`${claseCampo} resize-none`}
              />

              <div className="rounded-2xl bg-white/[0.04] px-4">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3.5">
                  <span className="pt-0.5 text-[13px] text-white/60">Servicio</span>
                  <span className="text-right">
                    <span className="block text-[15px] font-medium text-cream">
                      {servicioElegido?.nombre}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-white/60">
                      ≈ {servicioElegido?.duracion_minutos} min
                    </span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
                  <span className="text-[13px] text-white/60">Fecha</span>
                  <span className="text-[15px] text-cream">{fechaFormateada}</span>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
                  <span className="text-[13px] text-white/60">Hora</span>
                  <span className="text-[15px] font-medium tabular-nums text-cream">
                    {formatearHora12h(hora)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <span className="text-[13px] text-white/60">Total</span>
                  <span className="text-[15px] font-semibold tabular-nums text-brass">
                    ${servicioElegido?.precio}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-[13px] font-medium text-red-400">{error}</p>
              )}

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaso("horario")}
                  disabled={enviando}
                  className={`${claseBotonSecundario} ${claseFoco}`}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={confirmarCita}
                  disabled={!nombre.trim() || telefono.length !== 10 || enviando}
                  className={`${claseBotonPrimario} flex-1 ${claseFoco}`}
                >
                  {enviando ? "Reservando tu cita…" : "Reservar mi cita"}
                </button>
              </div>
            </div>
          </section>
        )}
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
