import fs from "fs/promises";
import path from "path";

type ReportLink = {
  fileName: string;
  label: string;
};

const reportDirectory = path.join(
  process.cwd(),
  "..",
  "research",
  "reports"
);

const buildReportList = async (): Promise<ReportLink[]> => {
  const entries = await fs.readdir(reportDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => ({
      fileName: entry.name,
      label: entry.name.replace(/\.md$/, ""),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requested = searchParams.get("report") ?? "";
    const reports = await buildReportList();
    const selected =
      reports.find((report) => report.fileName === requested) ?? reports[0] ?? null;

    const content = selected
      ? await fs.readFile(path.join(reportDirectory, selected.fileName), "utf-8")
      : null;

    return Response.json({ reports, selected, content }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load reports.";
    return Response.json({ error: message }, { status: 500 });
  }
}
