import { obtenerNegocio, crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AdminConfigForm from "@/components/AdminConfigForm";

export default async function PaginaConfig({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();
  const negocio = await obtenerNegocio(params.negocio);
  if (!negocio) notFound();

  const { data: bloqueos } = await supabase
    .from("bloqueos")
    .select("id, fecha, motivo")
    .eq("negocio_id", negocio.id)
    .order("fecha", { ascending: false });

  return (
    <AdminConfigForm
      negocio={negocio}
      bloqueosIniciales={bloqueos ?? []}
    />
  );
}
