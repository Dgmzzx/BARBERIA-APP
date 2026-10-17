"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";

const claseCampo =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[15px] text-cream caret-brass outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-ui placeholder:text-white/50 focus:border-brass/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-brass/20";

const claseEtiqueta =
  "block text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55";

export default function LoginForm({
  negocioSlug,
  negocioNombre,
}: {
  negocioSlug: string;
  negocioNombre: string | null;
}) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const inicial = negocioNombre?.trim().charAt(0).toUpperCase();

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;

    setError("");
    setEnviando(true);

    const supabase = crearClienteSupabase();
    const { error: errorAuth } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });

    if (errorAuth) {
      setEnviando(false);
      setError(
        "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.",
      );
      return;
    }

    router.push(`/${negocioSlug}/admin/panel`);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center">
        {inicial && (
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brass/25 bg-brass/10 font-display text-2xl text-brass"
          >
            {inicial}
          </span>
        )}
        <h1 className="mt-5 font-display text-[28px] leading-tight text-cream">
          {negocioNombre ?? "Panel de administración"}
        </h1>
        {negocioNombre && (
          <p className="mt-1.5 text-sm text-cream/55">Panel de administración</p>
        )}
      </div>

      <form
        onSubmit={iniciarSesion}
        className="mt-8 space-y-5 rounded-2xl border border-line bg-surface/70 p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] motion-safe:animate-fade-up sm:p-7"
      >
        <div>
          <label htmlFor="correo" className={claseEtiqueta}>
            Correo
          </label>
          <input
            id="correo"
            type="email"
            required
            autoFocus
            autoComplete="email"
            placeholder="tu@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className={`mt-2 ${claseCampo}`}
          />
        </div>

        <div>
          <label htmlFor="clave" className={claseEtiqueta}>
            Contraseña
          </label>
          <div className="relative mt-2">
            <input
              id="clave"
              type={mostrarClave ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className={`${claseCampo} pr-12`}
            />
            <button
              type="button"
              onClick={() => setMostrarClave((v) => !v)}
              aria-label={mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-cream/55 transition-colors hover:text-cream/80 focus-visible:text-cream focus-visible:outline-none"
            >
              {mostrarClave ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.45 0 8.3 2.9 9.94 6.65a1 1 0 0 1 0 .7 12.6 12.6 0 0 1-1.86 2.9" />
                  <path d="M6.61 6.61A13.5 13.5 0 0 0 2.06 11.65a1 1 0 0 0 0 .7C3.7 16.1 7.55 19 12 19c1.83 0 3.53-.49 5.02-1.35" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.7 7.9 7.55 5 12 5s8.3 2.9 9.94 6.65a1 1 0 0 1 0 .7C20.3 16.1 16.45 19 12 19s-8.3-2.9-9.94-6.65Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-[13px] leading-relaxed text-red-200"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brass px-6 py-3.5 text-[15px] font-semibold text-ink shadow-lg shadow-brass/25 transition-[filter,transform,opacity] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {enviando && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
            />
          )}
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href={`/${negocioSlug}`}
          className="text-[13px] text-cream/55 underline-offset-4 transition-colors hover:text-brass hover:underline"
        >
          Volver a la página de reservas
        </Link>
      </p>
    </div>
  );
}
