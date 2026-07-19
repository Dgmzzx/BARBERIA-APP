import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PanelCitas from "@/components/PanelCitas";

export default async function PaginaCitas({
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
    .order("fecha", { ascending: false })
    .order("hora", { ascending: true });

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl">Citas</h1>
        <p className="text-sm text-cream/40 mt-1">
          {citas?.length ?? 0} registro
          {(citas?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>
      <PanelCitas citasIniciales={citas ?? []} />
    </div>
  );
}
