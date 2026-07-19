import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json();
  const { negocio_id, nombre, precio, duracion_minutos } = body;

  if (!negocio_id || !nombre || precio == null || !duracion_minutos) {
    return NextResponse.json(
      { error: "Faltan campos requeridos." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("servicios")
    .insert({
      negocio_id,
      nombre,
      precio: parseFloat(precio),
      duracion_minutos: parseInt(duracion_minutos, 10),
      activo: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, activo } = body;

  if (!id || activo == null) {
    return NextResponse.json(
      { error: "Faltan campos requeridos." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("servicios")
    .update({ activo: !!activo })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
