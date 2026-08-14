import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** Client-side PDF table export from the same row-object shape downloadCsv
 * takes — a titled, dated table that auto-paginates. */
export function downloadPdf(
  filename: string,
  title: string,
  rows: Record<string, unknown>[],
): void {
  if (rows.length === 0) return;

  const doc = new jsPDF({ orientation: "landscape" });
  const headers = Object.keys(rows[0]);

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Exported ${new Date().toLocaleString()} — ${rows.length} row${rows.length === 1 ? "" : "s"}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [headers],
    body: rows.map((row) => headers.map((h) => String(row[h] ?? ""))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [27, 43, 58] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(filename);
}
