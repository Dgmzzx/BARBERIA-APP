import PaginaReserva from "@/components/PaginaReserva";

export const dynamic = "force-dynamic";

export default function PaginaNegocio({
  params,
}: {
  params: { negocio: string };
}) {
  return <PaginaReserva slug={params.negocio} />;
}
