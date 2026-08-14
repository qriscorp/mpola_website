"use client";

import { useCallback, useRef, useState } from "react";
import { PromptModal } from "@/components/prompt-modal";

interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  confirmLabel?: string;
}

/** Drop-in replacement for window.prompt() — resolves to the entered
 * string, or null if cancelled — backed by a real shadcn Dialog instead
 * of the browser's own prompt() chrome. */
export function usePrompt() {
  const [open, setOpen] = useState(false);
  const optionsRef = useRef<PromptOptions>({ title: "" });
  const resolveRef = useRef<((value: string | null) => void) | null>(null);

  const prompt = useCallback((opts: PromptOptions): Promise<string | null> => {
    optionsRef.current = opts;
    setOpen(true);
    return new Promise<string | null>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleSubmit = useCallback((value: string) => {
    setOpen(false);
    resolveRef.current?.(value);
    resolveRef.current = null;
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      resolveRef.current?.(null);
      resolveRef.current = null;
    }
  }, []);

  const PromptDialog = (
    <PromptModal
      open={open}
      onOpenChange={handleOpenChange}
      title={optionsRef.current.title}
      description={optionsRef.current.description}
      placeholder={optionsRef.current.placeholder}
      required={optionsRef.current.required}
      confirmLabel={optionsRef.current.confirmLabel}
      onSubmit={handleSubmit}
    />
  );

  return { prompt, PromptDialog };
}
