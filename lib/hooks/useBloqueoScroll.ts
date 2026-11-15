"use client";

import { useEffect } from "react";

export function useBloqueoScroll(activo = true) {
  useEffect(() => {
    if (!activo) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [activo]);
}
