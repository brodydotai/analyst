"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ReportModalProps = {
  open: boolean;
  title: string;
  content: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export default function ReportModal({
  open,
  title,
  content,
  loading,
  error,
  onClose,
}: ReportModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10">
      <div className="max-h-full w-full max-w-4xl overflow-hidden rounded-lg border border-brodus-border bg-brodus-panel shadow-xl">
        <div className="flex items-center justify-between border-b border-brodus-border px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="rounded-md border border-brodus-border px-3 py-1 text-xs uppercase tracking-wide text-brodus-muted hover:bg-brodus-background"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 text-sm leading-relaxed">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className="h-4 w-full animate-pulse rounded bg-brodus-background"
                  key={`line-${index}`}
                />
              ))}
            </div>
          ) : null}
          {error ? <p className="text-red-400">{error}</p> : null}
          {!loading && !error && content ? (
            <article className="space-y-4 text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          ) : null}
          {!loading && !error && !content ? (
            <p className="text-brodus-muted">No report content yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
