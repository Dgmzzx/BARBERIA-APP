"use client";

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
    <aside className="w-60 min-h-screen bg-surface border-r border-line flex flex-col shrink-0">
      <div className="px-6 pt-8 pb-6 border-b border-line/50">
        <h1 className="font-display text-xl">{negocioNombre}</h1>
        <p className="text-[10px] text-cream/30 uppercase tracking-[0.2em] mt-1.5">
          Administración
        </p>
      </div>

      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {enlaces.map(({ href, label }) => {
          const esActivo = activo(href);
          return (
            <Link
              key={href}
              href={`${basePath}${href}`}
              className={`block relative px-4 py-2.5 text-sm rounded-md transition-colors ${
                esActivo
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-cream/50 hover:text-cream hover:bg-base/40"
              }`}
            >
              {esActivo && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full" />
              )}
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-4 border-t border-line/50">
        <button
          onClick={cerrarSesion}
          className="w-full text-left px-4 py-2.5 text-sm text-cream/30 hover:text-cream/60 hover:bg-base/40 rounded-md transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
