import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reserva tu cita",
  description: "Reserva tu cita en la barbería en segundos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
