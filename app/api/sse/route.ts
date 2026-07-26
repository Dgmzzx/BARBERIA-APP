import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const negocioId = searchParams.get("negocio_id");

  if (!negocioId) {
    return new Response("Missing negocio_id", { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      const canal = supabase
        .channel(`sse-citas-${negocioId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "citas",
            filter: `negocio_id=eq.${negocioId}`,
          },
          async (payload) => {
            try {
              if (payload.eventType === "UPDATE") {
                const oldData = payload.old as Record<string, any>;
                const newData = payload.new as Record<string, any>;
                const soloNotificado =
                  oldData &&
                  newData &&
                  Object.keys(newData).every(
                    (k) =>
                      k === "notificado_recordatorio" ||
                      (oldData[k] === newData[k])
                  );
                if (soloNotificado) return;
              }

              let newRow = payload.new;

              if (payload.eventType === "INSERT" && newRow) {
                const { data: servicio } = await supabase
                  .from("servicios")
                  .select("nombre")
                  .eq("id", (newRow as any).servicio_id)
                  .single();
                newRow = { ...(newRow as any), servicios: servicio ?? null };
              }

              const data = JSON.stringify({
                event: payload.eventType,
                new: newRow,
                old: payload.old,
              });
              controller.enqueue(
                encoder.encode(`event: cita\ndata: ${data}\n\n`)
              );
            } catch (err) {
              console.error("Error procesando evento Realtime:", err);
            }
          }
        )
        .subscribe();

      const intervalo = setInterval(async () => {
        try {
          const ahora = new Date();
          const hoy = ahora.toISOString().split("T")[0];
          const minActual = ahora.getHours() * 60 + ahora.getMinutes();
          const minDesde = minActual + 25;
          const minHasta = minActual + 35;

          const hDesde = String(Math.floor(minDesde / 60) % 24).padStart(2, "0");
          const mDesde = String(minDesde % 60).padStart(2, "0");
          const hHasta = String(Math.floor(minHasta / 60) % 24).padStart(2, "0");
          const mHasta = String(minHasta % 60).padStart(2, "0");

          const { data: proximas } = await supabase
            .from("citas")
            .select("id, nombre_cliente, hora, servicios!inner(nombre)")
            .eq("negocio_id", negocioId)
            .eq("fecha", hoy)
            .gte("hora", `${hDesde}:${mDesde}`)
            .lte("hora", `${hHasta}:${mHasta}`)
            .in("estado", ["pendiente", "confirmada"])
            .eq("notificado_recordatorio", false)
            .limit(10);

          if (proximas && proximas.length > 0) {
            for (const cita of proximas) {
              const data = JSON.stringify({
                event: "recordatorio",
                id: cita.id,
                cliente: cita.nombre_cliente,
                servicio: (cita as any).servicios?.nombre,
                hora: cita.hora,
              });
              controller.enqueue(
                encoder.encode(`event: recordatorio\ndata: ${data}\n\n`)
              );
            }

            await supabase
              .from("citas")
              .update({ notificado_recordatorio: true })
              .in(
                "id",
                proximas.map((c) => c.id)
              );
          }
        } catch (err) {
          console.error("Error en recordatorio SSE:", err);
        }
      }, 60000);

      req.signal.addEventListener("abort", () => {
        clearInterval(intervalo);
        supabase.removeChannel(canal);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
