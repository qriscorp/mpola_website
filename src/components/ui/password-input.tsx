"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

/** A password (or PIN) input with a show/hide toggle — wraps the base
 * Input so every password field in the app gets the same eye icon instead
 * of each screen reinventing (or forgetting) it. */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(function PasswordInput({ className, ...props }, ref) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        className={cn("pr-9", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
