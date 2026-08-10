"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

/** A small "i" icon that reveals a short explainer on click/tap — not a
 * hover-only tooltip, since the audience for these explanations is
 * routinely on mobile web where hover doesn't exist. Closes on outside
 * click or Escape. */
export function InfoTip({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="More information"
        aria-expanded={open}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:text-[#2BB5A0] focus:outline-none focus:ring-2 focus:ring-[#2BB5A0]/40 transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {text}
        </span>
      )}
    </span>
  );
}
