"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X } from "lucide-react";

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
        <div className="flex items-center justify-between border-b border-brodus-border px-5 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            className="rounded p-1 text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4 text-sm leading-relaxed">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className="h-3.5 w-full animate-pulse rounded bg-brodus-background"
                  key={`line-${index}`}
                />
              ))}
            </div>
          ) : null}
          {error ? <p className="text-sm text-brodus-danger">{error}</p> : null}
          {!loading && !error && content ? (
            <article className="space-y-3 text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          ) : null}
          {!loading && !error && !content ? (
            <p className="text-sm text-brodus-muted">No report content yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
