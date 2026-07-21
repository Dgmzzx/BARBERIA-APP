import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";

export default async function PaginaInicio() {
  const supabase = crearClienteSupabaseServidor();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*, horarios(*)")
    .eq("slug", "barberiawady")
    .eq("activo", true)
    .single();

  if (!negocio) notFound();

  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .eq("negocio_id", negocio.id)
    .eq("activo", true)
    .order("precio");

  return (
    <main className="min-h-screen px-4 sm:px-6 py-12 max-w-lg mx-auto">
      <header className="text-center sm:text-left">
        <h1 className="font-display text-4xl sm:text-5xl leading-tight text-cream">
          {negocio.nombre}
        </h1>
        {negocio.direccion && (
          <p className="font-mono text-xs text-cream/30 mt-3 tracking-wider uppercase">
            {negocio.direccion}
          </p>
        )}
      </header>

      <div className="flex items-center gap-3 my-10 text-line/40" role="separator">
        <span className="flex-1 h-px bg-current" />
        <span className="font-mono text-[10px] select-none" aria-hidden="true">◆</span>
        <span className="flex-1 h-px bg-current" />
      </div>

      <BookingForm negocio={negocio} servicios={servicios ?? []} horarios={negocio.horarios ?? []} />

      <footer className="mt-16 text-center font-mono text-[11px] text-cream/15 tracking-wider">
        {negocio.telefono && (
          <p className="mb-1">{negocio.telefono}</p>
        )}
      </footer>
    </main>
  );
}
