"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Table2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadCsv } from "@/lib/csv";
import { downloadExcel } from "@/lib/excel";
import { downloadPdf } from "@/lib/pdf";
import { toast } from "sonner";

interface ExportMenuProps {
  /** Base filename without extension, e.g. "mpola-users". */
  filename: string;
  /** Sheet name (Excel) / heading (PDF) — usually the page title. */
  title: string;
  rows: Record<string, unknown>[];
  className?: string;
}

/** One export button, three formats — replaces the old single "Export CSV"
 * button across admin list pages. Exports whatever rows the page has
 * already fetched (the current page of results, same as before). */
export function ExportMenu({ filename, title, rows, className }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);

  const guard = (fn: () => void | Promise<void>) => async () => {
    if (rows.length === 0) {
      toast.info("Nothing to export.");
      return;
    }
    setExporting(true);
    try {
      await fn();
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={exporting}
        className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 ${className ?? ""}`}
      >
        <Download className="h-4 w-4" />
        {exporting ? "Exporting…" : "Export"}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={guard(() => downloadCsv(`${filename}.csv`, rows))} className="gap-2">
          <Table2 className="h-4 w-4" /> CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={guard(() => downloadExcel(`${filename}.xlsx`, title, rows))} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={guard(() => downloadPdf(`${filename}.pdf`, title, rows))} className="gap-2">
          <FileText className="h-4 w-4" /> PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
