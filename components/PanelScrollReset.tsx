"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PanelScrollReset({ targetId }: { targetId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    document.getElementById(targetId)?.scrollTo({ top: 0 });
  }, [pathname, targetId]);

  return null;
}
