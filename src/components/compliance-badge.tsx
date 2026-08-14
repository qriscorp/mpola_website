import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

/** Public-facing regulatory/compliance line shown in marketing page
 * footers — pulled from Admin Settings > General > Licence Number so it's
 * never a hardcoded claim. Falls back to a generic (true) compliance
 * statement rather than displaying an unverified licence number/regulator
 * name until an admin actually enters one. */
export async function ComplianceBadge({ className = "" }: { className?: string }) {
  const info = await api.getPlatformInfo().catch(() => null);

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <ShieldCheck className="h-4 w-4 shrink-0" />
      {info?.licence_number || "Operating in compliance with Ugandan lending regulations"}
    </div>
  );
}
