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
