import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json();
  const { negocio_id, nombre, precio, duracion_minutos, descripcion } = body;

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
      descripcion:
        typeof descripcion === "string" ? descripcion.trim() || null : null,
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
  const { id, activo, nombre, precio, duracion_minutos, descripcion } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Faltan campos requeridos." },
      { status: 400 }
    );
  }

  const actualizaciones: Record<string, unknown> = {};
  if (activo != null) actualizaciones.activo = !!activo;
  if (nombre !== undefined) {
    if (typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre no puede estar vacío." },
        { status: 400 }
      );
    }
    actualizaciones.nombre = nombre.trim();
  }
  if (precio !== undefined) {
    const p = parseFloat(precio);
    if (!Number.isFinite(p) || p < 0) {
      return NextResponse.json(
        { error: "Precio inválido." },
        { status: 400 }
      );
    }
    actualizaciones.precio = p;
  }
  if (duracion_minutos !== undefined) {
    const d = parseInt(duracion_minutos, 10);
    if (!Number.isFinite(d) || d <= 0) {
      return NextResponse.json(
        { error: "Duración inválida." },
        { status: 400 }
      );
    }
    actualizaciones.duracion_minutos = d;
  }
  if (descripcion !== undefined) {
    actualizaciones.descripcion =
      typeof descripcion === "string" ? descripcion.trim() || null : null;
  }

  if (Object.keys(actualizaciones).length === 0) {
    return NextResponse.json(
      { error: "No hay campos por actualizar." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("servicios")
    .update(actualizaciones)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
