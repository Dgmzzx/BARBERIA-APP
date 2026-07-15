import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";

export default async function PaginaReserva({
  params,
}: {
  params: { negocio: string };
}) {
  const supabase = crearClienteSupabaseServidor();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", params.negocio)
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
    <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
      <header className="mb-10">
        <p className="text-accent text-sm tracking-widest uppercase mb-2">
          Reserva tu cita
        </p>
        <h1 className="font-display text-3xl">{negocio.nombre}</h1>
      </header>

      <BookingForm negocio={negocio} servicios={servicios ?? []} />
    </main>
  );
}
