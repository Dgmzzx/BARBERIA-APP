import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Se inicializa Supabase una sola vez afuera porque sus variables
// no suelen causar el error del constructor durante el build.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Manejo seguro del JSON: Si el body viene vacío o malformado,
    // atrapa el error y evita que el servidor explote con un 500 fatal.
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud (JSON) es inválido o está vacío" },
        { status: 400 }
      );
    }

    const { negocio_id, servicio_id, nombre_cliente, telefono_cliente, fecha, hora } = body;

    // 2. Validación estricta: Nos aseguramos de que no vengan campos vacíos o con solo espacios.
    if (
      !negocio_id ||
      !servicio_id ||
      !nombre_cliente?.toString().trim() ||
      !telefono_cliente?.toString().trim() ||
      !fecha ||
      !hora
    ) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para completar la cita" },
        { status: 400 }
      );
    }

    // 3. Inserto de la cita en Supabase
    const { data: cita, error: errorInsert } = await supabaseAdmin
      .from("citas")
      .insert({
        negocio_id,
        servicio_id,
        nombre_cliente: nombre_cliente.toString().trim(),
        telefono_cliente: telefono_cliente.toString().trim(),
        fecha,
        hora,
      })
      .select()
      .single();

    if (errorInsert) {
      console.error("Error insertando cita en Supabase:", errorInsert);

      // Código de error 23505 = violación de restricción única (horario duplicado)
      if (errorInsert.code === "23505") {
        return NextResponse.json(
          { error: "Ese horario ya fue reservado. Por favor elige otro." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "No se pudo guardar la cita en la base de datos" },
        { status: 500 }
      );
    }

    // 4. Búsqueda en paralelo de detalles de negocio y servicio para optimizar la velocidad
    const [negocioRes, servicioRes] = await Promise.all([
      supabaseAdmin
        .from("negocios")
        .select("nombre, correo_notificaciones")
        .eq("id", negocio_id)
        .single(),
      supabaseAdmin
        .from("servicios")
        .select("nombre")
        .eq("id", servicio_id)
        .single(),
    ]);

    const negocio = negocioRes.data;
    const servicio = servicioRes.data;

    // 5. Envío de correo: Inicializamos Resend AQUÍ ADENTRO para evitar el error de Vercel en el Build.
    const resendApiKey = process.env.RESEND_API_KEY;
    if (negocio?.correo_notificaciones && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: "Reservas <onboarding@resend.dev>",
          to: negocio.correo_notificaciones,
          subject: `Nueva cita: ${nombre_cliente} — ${fecha} ${hora}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                📅 Nueva cita reservada
              </h2>
              <p>Tienes una nueva reserva confirmada para <strong>${negocio.nombre}</strong>:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Cliente:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${nombre_cliente}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Teléfono:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><a href="tel:${telefono_cliente}">${telefono_cliente}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Servicio:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${servicio?.nombre ?? "Servicio general"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Fecha y Hora:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${fecha} a las ${hora}</td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #777; margin-top: 30px;">
                Este es un mensaje automático del sistema de reservas.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // No bloqueamos la respuesta principal si falla el correo, 
        // pero sí lo registramos en los logs del servidor para depurar.
        console.error("Error enviando correo de notificación en Resend:", emailError);
      }
    }

    // 6. Retorno exitoso de la cita
    return NextResponse.json({ cita }, { status: 201 });

  } catch (error) {
    // Captura global por si un proceso inesperado falla.
    console.error("Error inesperado en /api/citas:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno al procesar la solicitud" },
      { status: 500 }
    );
  }
}