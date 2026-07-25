"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";

const enlaces = [
  { href: "", label: "Dashboard" },
  { href: "/citas", label: "Citas" },
  { href: "/servicios", label: "Servicios" },
  { href: "/config", label: "Configuración" },
];

export default function AdminSidebar({
  negocioSlug,
  negocioNombre,
}: {
  negocioSlug: string;
  negocioNombre: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = `/${negocioSlug}/admin/panel`;
  const [mobileOpen, setMobileOpen] = useState(false);

  function activo(href: string) {
    if (href === "") return pathname === basePath;
    return pathname.startsWith(`${basePath}${href}`);
  }

  async function cerrarSesion() {
    const supabase = crearClienteSupabase();
    await supabase.auth.signOut();
    router.push(`/${negocioSlug}/admin/login`);
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-surface border border-line rounded-lg p-2.5 text-cream/60 hover:text-cream transition-colors"
        aria-label="Abrir menú"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-60 bg-surface border-r border-line flex flex-col
          transition-transform duration-200
          lg:static lg:translate-x-0 lg:min-h-screen lg:shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-line/50 lg:justify-start">
          <div>
            <h1 className="font-display text-xl">{negocioNombre}</h1>
            <p className="text-[10px] text-cream/30 uppercase tracking-[0.2em] mt-1.5">
              Administración
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-cream/40 hover:text-cream transition-colors"
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {enlaces.map(({ href, label }) => {
            const esActivo = activo(href);
            return (
              <Link
                key={href}
                href={`${basePath}${href}`}
                onClick={() => setMobileOpen(false)}
                className={`block relative px-4 py-2.5 text-sm rounded-md transition-colors ${
                  esActivo
                    ? "bg-signal/10 text-signal font-medium"
                    : "text-cream/50 hover:text-cream hover:bg-ink/40"
                }`}
              >
                {esActivo && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-signal rounded-full" />
                )}
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-4 border-t border-line/50">
          <button
            onClick={cerrarSesion}
            className="w-full text-left px-4 py-2.5 text-sm text-cream/30 hover:text-cream/60 hover:bg-ink/40 rounded-md transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
