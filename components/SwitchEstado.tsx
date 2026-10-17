"use client";

export default function SwitchEstado({
  activo,
  onToggle,
  etiqueta,
}: {
  activo: boolean;
  onToggle: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={onToggle}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-150 ease-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 ${
        activo ? "bg-brass" : "bg-line"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-cream shadow-sm transition-transform duration-150 ease-ui ${
          activo ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
