"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PwaInstallBanner } from "./pwa-install-banner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <PwaInstallBanner />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-card)",
                color: "var(--color-card-foreground)",
                border: "1px solid var(--color-border)",
              },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
