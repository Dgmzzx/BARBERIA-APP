"use client";

import { useState } from "react";

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

  function handleConfirmar() {
    if (!motivoValido) return;
    const motivo =
      motivoSeleccionado === "Otro" ? otroTexto.trim() : motivoSeleccionado;
    onConfirm(motivo);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-midnight-surface-container border border-midnight-outline rounded-lg w-full max-w-sm motion-safe:animate-fade-up">
        <div className="sticky top-0 bg-midnight-surface-container border-b border-midnight-outline/50 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-midnight-on-surface">
            Cancelar cita
          </h2>
          <button
            onClick={onClose}
            className="text-midnight-on-surface-variant/60 hover:text-midnight-on-surface transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-midnight-on-surface-variant">
            Selecciona el motivo de cancelación:
          </p>

          <div className="space-y-2">
            {MOTIVOS.map((motivo) => (
              <label
                key={motivo}
                className={`flex items-center gap-3 border rounded-md px-4 py-3 cursor-pointer transition-colors ${
                  motivoSeleccionado === motivo
                    ? "border-midnight-error/50 bg-midnight-error/10"
                    : "border-midnight-outline/30 hover:border-midnight-outline"
                }`}
              >
                <input
                  type="radio"
                  name="motivo"
                  value={motivo}
                  checked={motivoSeleccionado === motivo}
                  onChange={() => setMotivoSeleccionado(motivo)}
                  className="accent-midnight-error"
                />
                <span className="text-sm text-midnight-on-surface">
                  {motivo}
                </span>
              </label>
            ))}
          </div>

          {motivoSeleccionado === "Otro" && (
            <textarea
              placeholder="Describe el motivo..."
              value={otroTexto}
              onChange={(e) => setOtroTexto(e.target.value)}
              maxLength={300}
              rows={3}
              className="w-full bg-midnight-surface border border-midnight-outline rounded-md px-4 py-3
                         font-body text-sm text-midnight-on-surface placeholder:text-midnight-on-surface-variant/60 resize-none
                         focus:outline-none focus:border-midnight-error/50 focus:ring-1 focus:ring-midnight-error/20
                         transition-all duration-150"
            />
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 text-xs border border-midnight-outline rounded-full px-4 py-2.5 text-midnight-on-surface-variant hover:border-midnight-on-surface-variant/50 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!motivoValido}
              className="flex-1 text-xs bg-midnight-error text-midnight-on-error rounded-full px-4 py-2.5 font-semibold
                         transition-all duration-150 hover:bg-midnight-error/90 active:scale-[0.97]
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Cancelar cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
