import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatearFechaLarga(fecha: string): string {
  const texto = format(
    new Date(`${fecha}T12:00:00`),
    "EEEE d 'de' MMMM",
    { locale: es },
  );
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearHora12h(hora: string): string {
  const [hStr, m] = hora.split(":");
  const h = parseInt(hStr, 10);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${periodo}`;
}

export function descomponerHora(h24: string): { h12: number; min: string; periodo: "AM" | "PM" } {
  const [hStr, m] = h24.split(":");
  const h = parseInt(hStr, 10);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { h12, min: m, periodo: periodo as "AM" | "PM" };
}

export function parsearHora12h(texto: string): string | null {
  const limpio = texto.trim().toUpperCase();
  const match = limpio.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const min = match[2];
  const periodo = match[3] as "AM" | "PM";

  if (h < 1 || h > 12) return null;
  if (periodo === "PM" && h !== 12) h += 12;
  if (periodo === "AM" && h === 12) h = 0;

  return `${String(h).padStart(2, "0")}:${min}`;
}

import type { Horario } from "./types";

export function obtenerRangosDelDia(
  horarios: Horario[],
  diaSemana: number,
): { apertura: string; cierre: string }[] {
  return horarios
    .filter((h) => h.dia_semana === diaSemana)
    .sort((a, b) => a.orden - b.orden)
    .map((h) => ({ apertura: h.apertura, cierre: h.cierre }));
}

export function componerHora(h12: number, min: string, periodo: "AM" | "PM"): string {
  let h24 = h12;
  if (periodo === "PM" && h12 !== 12) h24 = h12 + 12;
  if (periodo === "AM" && h12 === 12) h24 = 0;
  return `${String(h24).padStart(2, "0")}:${min}`;
}

export function normalizarTelefono(telefono: string): string {
  return telefono.replace(/[\s\-\(\)\+]/g, "");
}

export function sanearTelefonoInput(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  const sinLada = digitos.length === 11 && digitos.startsWith("1")
    ? digitos.slice(1)
    : digitos;
  return sinLada.slice(0, 10);
}

export function telefonoInternacional(telefono: string): string {
  const normalizado = normalizarTelefono(telefono);
  return normalizado.length === 10 ? `1${normalizado}` : normalizado;
}

export type TipoMensajeCita = "confirmada" | "reprogramada" | "cancelada";

export function mensajeWhatsApp(
  tipo: TipoMensajeCita,
  datos: {
    nombre: string;
    negocio: string;
    servicio: string | null;
    fecha: string;
    hora: string;
  },
): string {
  const servicio = datos.servicio ? ` de ${datos.servicio}` : "";
  const fechaLarga = formatearFechaLarga(datos.fecha);
  const fecha = fechaLarga.charAt(0).toLowerCase() + fechaLarga.slice(1);
  const hora = formatearHora12h(datos.hora);
  const saludo = `¡Hola ${datos.nombre}! Te escribimos de ${datos.negocio}.`;

  switch (tipo) {
    case "confirmada":
      return `${saludo} Tu cita${servicio} fue confirmada para el ${fecha} a las ${hora}. ¡Te esperamos!`;
    case "reprogramada":
      return `${saludo} Tu cita${servicio} fue reprogramada para el ${fecha} a las ${hora}.`;
    case "cancelada":
      return `${saludo} Lamentamos informarte que tu cita${servicio} del ${fecha} a las ${hora} fue cancelada.`;
  }
}

export function urlWhatsApp(telefono: string, mensaje: string): string {
  return `https://wa.me/${telefonoInternacional(telefono)}?text=${encodeURIComponent(mensaje)}`;
}

export function validarTelefono(telefono: string): boolean {
  const normalizado = normalizarTelefono(telefono);
  return /^\d{10}$/.test(normalizado);
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function badgeColor(estado: string): string {
  switch (estado) {
    case "pendiente":
      return "border-brass/40 bg-brass/10 text-brass";
    case "confirmada":
      return "border-cream/25 bg-white/[0.06] text-cream";
    case "en_proceso":
      return "border-brass bg-brass text-ink";
    case "completada":
      return "border-line text-cream/55";
    case "cancelada":
      return "border-red-400/30 bg-red-400/10 text-red-300";
    case "no_asistio":
      return "border-line text-cream/55";
    default:
      return "border-line text-cream/60";
  }
}

export function etiquetaEstado(estado: string): string {
  const etiquetas: Record<string, string> = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    en_proceso: "En proceso",
    completada: "Completada",
    cancelada: "Cancelada",
    no_asistio: "No asistió",
  };
  return etiquetas[estado] ?? estado;
}
