import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PanelCitas from "@/components/PanelCitas";

export default async function PanelAdmin({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", params.negocio)
    .single();

  if (!negocio) notFound();

  const { data: citas } = await supabase
    .from("citas")
    .select("*, servicios(nombre)")
    .eq("negocio_id", negocio.id)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl mb-8">Citas — {negocio.nombre}</h1>
      <PanelCitas citasIniciales={citas ?? []} />
    </main>
  );
}
