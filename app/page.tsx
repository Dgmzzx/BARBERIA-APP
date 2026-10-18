import type { Metadata } from "next";
import PaginaReserva, {
  obtenerNegocioConHorarios,
} from "@/components/PaginaReserva";

export const dynamic = "force-dynamic";

const SLUG = "barberiawady";

export async function generateMetadata(): Promise<Metadata> {
  const negocio = await obtenerNegocioConHorarios(SLUG);

  if (!negocio) return {};

  return {
    title: `${negocio.nombre} — Reserva tu cita`,
    description: negocio.direccion
      ? `Reserva tu cita en ${negocio.nombre}, ${negocio.direccion}.`
      : `Reserva tu cita en ${negocio.nombre}.`,
  };
}

export default function PaginaInicio() {
  return <PaginaReserva slug={SLUG} />;
}
