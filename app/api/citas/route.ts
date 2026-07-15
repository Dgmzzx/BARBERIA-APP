import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();
  const { negocio_id, servicio_id, nombre_cliente, telefono_cliente, fecha, hora } = body;

  if (!negocio_id || !servicio_id || !nombre_cliente || !telefono_cliente || !fecha || !hora) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data: cita, error: errorInsert } = await supabaseAdmin
    .from("citas")
    .insert({ negocio_id, servicio_id, nombre_cliente, telefono_cliente, fecha, hora })
    .select()
    .single();

  if (errorInsert) {
    if (errorInsert.code === "23505") {
      return NextResponse.json(
        { error: "Ese horario ya fue reservado. Elige otro." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "No se pudo guardar la cita" }, { status: 500 });
  }

  const { data: negocio } = await supabaseAdmin
    .from("negocios")
    .select("nombre, correo_notificaciones")
    .eq("id", negocio_id)
    .single();

  const { data: servicio } = await supabaseAdmin
    .from("servicios")
    .select("nombre")
    .eq("id", servicio_id)
    .single();

  if (negocio?.correo_notificaciones && process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: "Reservas <onboarding@resend.dev>",
        to: negocio.correo_notificaciones,
        subject: `Nueva cita: ${nombre_cliente} — ${fecha} ${hora}`,
        html: `
          <h2>Nueva cita reservada</h2>
          <p><strong>Cliente:</strong> ${nombre_cliente}</p>
          <p><strong>Teléfono:</strong> ${telefono_cliente}</p>
          <p><strong>Servicio:</strong> ${servicio?.nombre ?? ""}</p>
          <p><strong>Fecha:</strong> ${fecha} a las ${hora}</p>
          <p><strong>Negocio:</strong> ${negocio.nombre}</p>
        `,
      });
    } catch (e) {
      console.error("Error enviando correo de notificación:", e);
    }
  }

  return NextResponse.json({ cita });
}