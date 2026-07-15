"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabase/client";
import type { Negocio, Servicio } from "@/lib/types";

type Paso = "servicio" | "horario" | "datos" | "confirmado";

export default function BookingForm({
  negocio,
  servicios,
}: {
  negocio: Negocio;
  servicios: Servicio[];
}) {
  const [paso, setPaso] = useState<Paso>("servicio");
  const [servicioElegido, setServicioElegido] = useState<Servicio | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const todasLasHoras = generarHoras(negocio.hora_apertura, negocio.hora_cierre);
  const horasDisponibles = todasLasHoras.filter((h) => !horasOcupadas.includes(h));

  async function alElegirFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setHora("");
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
    if (!servicioElegido || !fecha || !hora || !nombre || !telefono) return;
    setEnviando(true);
    setError("");

    const supabase = crearClienteSupabase();
    const { error: errorInsert } = await supabase.from("citas").insert({
      negocio_id: negocio.id,
      servicio_id: servicioElegido.id,
      nombre_cliente: nombre,
      telefono_cliente: telefono,
      fecha,
      hora,
    });

    setEnviando(false);

    if (errorInsert) {
      setError("No se pudo reservar la cita. Intenta de nuevo.");
      return;
    }
    setPaso("confirmado");
  }

  if (paso === "confirmado") {
    return (
      <div className="border border-line rounded-lg p-6 text-center">
        <p className="text-accent text-sm uppercase tracking-widest mb-2">
          Cita confirmada
        </p>
        <p className="font-display text-2xl mb-4">{nombre}, te esperamos</p>
        <p className="text-cream/80">
          {servicioElegido?.nombre} — {fecha} a las {hora}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Paso 1: servicio */}
      <section>
        <p className="text-sm text-cream/60 mb-3">1. Elige un servicio</p>
        <div className="space-y-2">
          {servicios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setServicioElegido(s);
                setPaso("horario");
              }}
              className={`w-full text-left border rounded-lg p-4 transition ${
                servicioElegido?.id === s.id
                  ? "border-accent bg-accent/10"
                  : "border-line hover:border-cream/30"
              }`}
            >
              <div className="flex justify-between">
                <span>{s.nombre}</span>
                <span className="text-cream/60">${s.precio}</span>
              </div>
              <span className="text-xs text-cream/40">
                {s.duracion_minutos} min
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Paso 2: fecha y hora */}
      {servicioElegido && (
        <section>
          <p className="text-sm text-cream/60 mb-3">2. Elige fecha y hora</p>
          <input
            type="date"
            value={fecha}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => alElegirFecha(e.target.value)}
            className="w-full bg-surface border border-line rounded-lg p-3 mb-3"
          />

          {cargandoHoras && (
            <p className="text-sm text-cream/40">Buscando horarios disponibles...</p>
          )}

          {!cargandoHoras && fecha && horasDisponibles.length === 0 && (
            <p className="text-sm text-cream/40">
              No hay horarios disponibles ese día. Elige otra fecha.
            </p>
          )}

          {!cargandoHoras && horasDisponibles.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {horasDisponibles.map((h) => (
                <button
                  key={h}
                  onClick={() => setHora(h)}
                  className={`text-sm border rounded-lg py-2 ${
                    hora === h
                      ? "border-accent bg-accent/10"
                      : "border-line hover:border-cream/30"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Paso 3: datos del cliente */}
      {servicioElegido && fecha && hora && (
        <section className="space-y-3">
          <p className="text-sm text-cream/60">3. Tus datos</p>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-surface border border-line rounded-lg p-3"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full bg-surface border border-line rounded-lg p-3"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={confirmarCita}
            disabled={!nombre || !telefono || enviando}
            className="w-full bg-accent text-base font-medium rounded-lg py-3 disabled:opacity-40"
          >
            {enviando ? "Reservando..." : "Confirmar cita"}
          </button>
        </section>
      )}
    </div>
  );
}

function generarHoras(apertura: string, cierre: string): string[] {
  const horas: string[] = [];
  let [h, m] = apertura.split(":").map(Number);
  const [hFin, mFin] = cierre.split(":").map(Number);

  while (h < hFin || (h === hFin && m < mFin)) {
    horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }
  return horas;
}
