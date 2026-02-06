"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
    if (inCodeBlock) {
      return;
    }
    const match = /^(#{1,3})\s+(.*)$/.exec(line);
    if (!match) {
      return;
    }
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
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Research Reports</h1>
          <p className="text-sm text-atlas-muted">
            Markdown reports from the research workspace.
          </p>
        </div>
        <Link
          className="rounded-md border border-atlas-border px-3 py-2 text-xs uppercase tracking-wide text-atlas-muted hover:bg-atlas-panel"
          href="/"
        >
          Back to Watchlist
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-atlas-border bg-atlas-panel p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-atlas-muted">
              Reports
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              {loading ? (
                <p className="text-atlas-muted">Loading reports...</p>
              ) : reports.length === 0 ? (
                <p className="text-atlas-muted">No reports found.</p>
              ) : (
                reports.map((report) => {
                  const isActive = selected?.fileName === report.fileName;
                  return (
                    <Link
                      className={`block rounded-md px-2 py-1 ${
                        isActive
                          ? "bg-atlas-background text-atlas-text"
                          : "text-atlas-muted hover:bg-atlas-background"
                      }`}
                      href={`/reports?report=${encodeURIComponent(
                        report.fileName
                      )}`}
                      key={report.fileName}
                      prefetch={false}
                    >
                      {report.label}
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {toc.length > 0 ? (
            <div className="rounded-lg border border-atlas-border bg-atlas-panel p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-atlas-muted">
                Contents
              </h2>
              <div className="mt-3 space-y-2 text-xs text-atlas-muted">
                {toc.map((entry) => (
                  <a
                    className={`block hover:text-atlas-text ${
                      entry.level === 2 ? "ml-3" : entry.level === 3 ? "ml-6" : ""
                    }`}
                    href={`#${entry.id}`}
                    key={`${entry.id}-${entry.level}`}
                  >
                    {entry.text}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <section className="rounded-lg border border-atlas-border bg-atlas-panel p-6">
          {error ? (
            <p className="text-sm text-red-300">{error}</p>
          ) : loading ? (
            <p className="text-sm text-atlas-muted">Loading report...</p>
          ) : selected ? (
            <>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-atlas-muted">
                {selected.label}
              </h2>
              <article className="mt-6 space-y-4 text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1
                        className="text-2xl font-semibold"
                        id={slugify(String(children ?? ""))}
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2
                        className="text-xl font-semibold"
                        id={slugify(String(children ?? ""))}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3
                        className="text-lg font-semibold"
                        id={slugify(String(children ?? ""))}
                      >
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6">{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-atlas-border pl-4 text-atlas-muted">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-atlas-background px-1 py-0.5 text-xs text-atlas-text">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
            </>
          ) : (
            <p className="text-sm text-atlas-muted">
              No markdown reports found in `research/reports`.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
