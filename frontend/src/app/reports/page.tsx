"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ReportList from "@/components/research/ReportList";
import ReportToc from "@/components/research/ReportToc";
import ReportViewer from "@/components/research/ReportViewer";

type ReportLink = {
  fileName: string;
  label: string;
};

type TocEntry = {
  level: number;
  text: string;
  id: string;
};

type ReportPayload = {
  reports: ReportLink[];
  selected: ReportLink | null;
  content: string | null;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const buildToc = (content: string): TocEntry[] => {
  const lines = content.split("\n");
  const toc: TocEntry[] = [];
  let inCodeBlock = false;

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;
    const match = /^(#{1,3})\s+(.*)$/.exec(line);
    if (!match) return;
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text);
    toc.push({ level, text, id });
  });

  return toc;
};

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const reportParam = searchParams.get("report") ?? "";
  const [reports, setReports] = useState<ReportLink[]>([]);
  const [selected, setSelected] = useState<ReportLink | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/reports?report=${encodeURIComponent(reportParam)}`
        );
        if (!response.ok) {
          throw new Error("Unable to load reports.");
        }
        const payload = (await response.json()) as ReportPayload;
        setReports(payload.reports);
        setSelected(payload.selected);
        setContent(payload.content);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load reports.";
        setError(message);
        setReports([]);
        setSelected(null);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [reportParam]);

  const toc = useMemo(() => {
    return content ? buildToc(content) : [];
  }, [content]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Research"
        subtitle="Investment reports and analysis"
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-3">
          <ReportList
            reports={reports}
            selectedFileName={selected?.fileName ?? null}
            loading={loading}
          />
          <ReportToc entries={toc} />
        </aside>

        <section>
          {error ? (
            <div className="rounded-lg border border-brodus-danger/40 bg-brodus-danger/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-4 w-full animate-pulse rounded bg-brodus-panel"
                />
              ))}
            </div>
          ) : selected && content ? (
            <ReportViewer content={content} label={selected.label} />
          ) : (
            <div className="rounded-lg border border-brodus-border bg-brodus-panel p-5 text-sm text-brodus-muted">
              No reports found in the research workspace.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
