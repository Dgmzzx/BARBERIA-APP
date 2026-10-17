"use client";

import { useState, useEffect } from "react";

const MOTIVOS = [
  "Cliente canceló",
  "No asistió",
  "Problema interno",
  "Otro",
] as const;

export default function CancelarCitaModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (motivo: string) => void;
  onClose: () => void;
}) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>("");
  const [otroTexto, setOtroTexto] = useState("");

  const motivoValido =
    motivoSeleccionado &&
    (motivoSeleccionado !== "Otro" || otroTexto.trim().length > 0);

  useEffect(() => {
    function alPresionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onClose]);

  function handleConfirmar() {
    if (!motivoValido) return;
    const motivo =
      motivoSeleccionado === "Otro" ? otroTexto.trim() : motivoSeleccionado;
    onConfirm(motivo);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancelar-titulo"
    >
      <div className="fixed inset-0 bg-ink/70" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[85dvh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_32px_80px_-32px_rgba(0,0,0,0.9)] motion-safe:animate-fade-up">
        <header className="flex items-center justify-between gap-3 border-b border-line/60 px-5 py-4">
          <h2
            id="cancelar-titulo"
            className="font-display text-lg text-cream"
          >
            Cancelar cita
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cream/55 transition-colors hover:bg-white/[0.05] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <p className="text-sm text-cream/55">
            Selecciona el motivo de cancelación:
          </p>

          <div className="space-y-2">
            {MOTIVOS.map((motivo) => (
              <label
                key={motivo}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  motivoSeleccionado === motivo
                    ? "border-red-400/50 bg-red-400/10"
                    : "border-line hover:border-cream/25"
                }`}
              >
                <input
                  type="radio"
                  name="motivo"
                  value={motivo}
                  checked={motivoSeleccionado === motivo}
                  onChange={() => setMotivoSeleccionado(motivo)}
                  className="accent-red-400"
                />
                <span className="text-sm text-cream/90">{motivo}</span>
              </label>
            ))}
          </div>

          {motivoSeleccionado === "Otro" && (
            <textarea
              placeholder="Describe el motivo…"
              value={otroTexto}
              onChange={(e) => setOtroTexto(e.target.value)}
              maxLength={300}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-cream caret-brass outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-ui placeholder:text-white/50 focus:border-red-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-red-400/20"
            />
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-line px-4 py-3 text-sm text-cream/70 transition-colors hover:border-cream/25 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40"
            >
              Volver
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!motivoValido}
              className="flex-1 rounded-xl bg-red-400/90 px-4 py-3 text-sm font-semibold text-ink transition-[filter,transform,opacity] duration-150 ease-ui hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Cancelar cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
