import ExcelJS from "exceljs";

/** Client-side .xlsx generation from the same row-object shape downloadCsv
 * takes — one sheet, header row bolded and auto-sized. */
export async function downloadExcel(
  filename: string,
  sheetName: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  if (rows.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  const headers = Object.keys(rows[0]);
  sheet.columns = headers.map((h) => ({
    header: h,
    key: h,
    width: Math.min(Math.max(h.length + 4, 14), 40),
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(rows);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
