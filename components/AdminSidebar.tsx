"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";

function IconoResumen({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function IconoCitas({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconoServicios({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 8.12 15.88" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
    </svg>
  );
}

function IconoConfig({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="21" y1="4" x2="14" y2="4" />
      <line x1="10" y1="4" x2="3" y2="4" />
      <line x1="21" y1="12" x2="12" y2="12" />
      <line x1="8" y1="12" x2="3" y2="12" />
      <line x1="21" y1="20" x2="16" y2="20" />
      <line x1="12" y1="20" x2="3" y2="20" />
      <line x1="14" y1="2" x2="14" y2="6" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="16" y1="18" x2="16" y2="22" />
    </svg>
  );
}

const enlaces = [
  { href: "", label: "Resumen", Icono: IconoResumen },
  { href: "/citas", label: "Citas", Icono: IconoCitas },
  { href: "/servicios", label: "Servicios", Icono: IconoServicios },
  { href: "/config", label: "Configuración", Icono: IconoConfig },
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

  const inicial = negocioNombre.trim().charAt(0).toUpperCase() || "A";

  useEffect(() => {
    if (!mobileOpen) return;
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", alPresionarTecla);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alPresionarTecla);
      document.body.style.overflow = overflowPrevio;
    };
  }, [mobileOpen]);

  function activo(href: string) {
    if (href === "") return pathname === basePath;
    return pathname.startsWith(`${basePath}${href}`);
  }

  async function cerrarSesion() {
    const supabase = crearClienteSupabase();
    await supabase.auth.signOut();
    router.push(`/${negocioSlug}/admin/login`);
  }

  const marca = (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brass/25 bg-brass/10 font-display text-base text-brass"
      >
        {inicial}
      </span>
      <span className="truncate font-display text-lg leading-tight text-cream">
        {negocioNombre}
      </span>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-ink/90 px-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          aria-controls="menu-admin"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-cream/70 transition-colors hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {marca}
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="menu-admin"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-200 ease-ui lg:static lg:z-auto lg:w-64 lg:translate-x-0 xl:w-72 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line/60 px-4 py-5">
          {marca}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cream/55 transition-colors hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav
          aria-label="Secciones del panel"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        >
          {enlaces.map(({ href, label, Icono }) => {
            const esActivo = activo(href);
            return (
              <Link
                key={href}
                href={`${basePath}${href}`}
                onClick={() => setMobileOpen(false)}
                aria-current={esActivo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ease-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 ${
                  esActivo
                    ? "bg-brass/10 font-medium text-brass"
                    : "text-cream/65 hover:bg-white/[0.05] hover:text-cream"
                }`}
              >
                <Icono className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-line/60 px-3 py-4">
          <Link
            href={`/${negocioSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/65 transition-colors duration-150 ease-ui hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            Ver página pública
          </Link>
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-cream/65 transition-colors duration-150 ease-ui hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
