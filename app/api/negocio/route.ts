import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Falta ?slug=" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("negocios")
    .select("*, horarios(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, horarios } = body;

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

  if (horarios) {
    const { error: delError } = await supabase
      .from("horarios")
      .delete()
      .eq("negocio_id", id);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    if (horarios.length > 0) {
      const { error: insError } = await supabase.from("horarios").insert(
        horarios.map((h: any) => ({
          negocio_id: id,
          dia_semana: h.dia_semana,
          apertura: h.apertura,
          cierre: h.cierre,
          orden: h.orden,
        }))
      );

      if (insError) {
        return NextResponse.json({ error: insError.message }, { status: 500 });
      }
    }
  }

  const { data, error } = await supabase
    .from("negocios")
    .select("*, horarios(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
