import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, hora_apertura, hora_cierre, dias_laborales } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Falta el id del negocio." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const actualizar: Record<string, unknown> = {};
  if (hora_apertura) actualizar.hora_apertura = hora_apertura;
  if (hora_cierre) actualizar.hora_cierre = hora_cierre;
  if (dias_laborales) actualizar.dias_laborales = dias_laborales;

  const { data, error } = await supabase
    .from("negocios")
    .update(actualizar)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
