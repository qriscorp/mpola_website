"use client";

import { useCallback, useRef, useState } from "react";
import { ConfirmModal } from "@/components/confirm-modal";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

/** Drop-in replacement for the native window.confirm() — same
 * "await, then branch" ergonomics, but renders the real ConfirmModal
 * (shadcn Dialog) instead of the browser's own confirm() chrome.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   if (!(await confirm({ title: "...", description: "...", destructive: true }))) return;
 *   ...
 *   return <>{ConfirmDialog}{...rest of the page}</>;
 */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  const optionsRef = useRef<ConfirmOptions>({ title: "", description: "" });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    optionsRef.current = opts;
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      resolveRef.current?.(false);
      resolveRef.current = null;
    }
  }, []);

  const ConfirmDialog = (
    <ConfirmModal
      open={open}
      onOpenChange={handleOpenChange}
      title={optionsRef.current.title}
      description={optionsRef.current.description}
      confirmLabel={optionsRef.current.confirmLabel ?? "Confirm"}
      onConfirm={handleConfirm}
      destructive={optionsRef.current.destructive}
    />
  );

  return { confirm, ConfirmDialog };
}
