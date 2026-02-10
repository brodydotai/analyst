"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";

type ReportLink = {
  fileName: string;
  label: string;
};

type ReportListProps = {
  reports: ReportLink[];
  selectedFileName: string | null;
  loading: boolean;
};

export default function ReportList({
  reports,
  selectedFileName,
  loading,
}: ReportListProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? reports.filter((report) =>
        report.label.toLowerCase().includes(filter.toLowerCase())
      )
    : reports;

  return (
    <div className="rounded-lg border border-brodus-border bg-brodus-panel p-3">
      <h2 className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
        Reports
      </h2>
      <div className="relative mt-2">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brodus-muted"
        />
        <input
          className="w-full rounded border border-brodus-border bg-brodus-background py-1.5 pl-8 pr-3 text-xs text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
          placeholder="Filter reports..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>
      <div className="mt-2 space-y-0.5 text-sm">
        {loading ? (
          <p className="py-2 text-xs text-brodus-muted">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-2 text-xs text-brodus-muted">
            {filter ? "No matches." : "No reports found."}
          </p>
        ) : (
          filtered.map((report) => {
            const isActive = selectedFileName === report.fileName;
            return (
              <Link
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "bg-brodus-surface text-brodus-text"
                    : "text-brodus-muted hover:bg-brodus-hover hover:text-brodus-text"
                }`}
                href={`/reports?report=${encodeURIComponent(report.fileName)}`}
                key={report.fileName}
                prefetch={false}
              >
                <FileText size={13} className="flex-shrink-0" />
                <span className="truncate">{report.label}</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
