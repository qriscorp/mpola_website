"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoids a hydration mismatch: next-themes doesn't know the stored
  // preference until after mount, so the trigger defaults to the
  // System/Monitor icon (a safe default either way) until then.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const TriggerIcon = (mounted && OPTIONS.find((o) => o.value === theme)?.icon) || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none"
      >
        <TriggerIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className="gap-2"
          >
            <opt.icon className="h-4 w-4" />
            {opt.label}
            {theme === opt.value && <Check className="ml-auto h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
