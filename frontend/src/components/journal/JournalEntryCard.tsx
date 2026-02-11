import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Tag } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { JournalEntry } from "@/types/journal";

type JournalEntryCardProps = {
  entry: JournalEntry;
};

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const preview = entry.content.split("\n").slice(0, 3).join("\n");

  return (
    <div className="rounded-lg border border-brodus-border bg-brodus-background/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-brodus-text">{entry.title}</h3>
        <div className="flex items-center gap-1 text-2xs text-brodus-muted">
          <Calendar size={12} />
          {formatDate(entry.entry_date)}
        </div>
      </div>
      {entry.tags.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded bg-brodus-surface px-1.5 py-0.5 text-2xs text-brodus-muted"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <article className="mt-3 space-y-2 text-xs leading-relaxed text-brodus-text/90">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p>{children}</p>,
            strong: ({ children }) => (
              <strong className="font-semibold text-brodus-text">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4">{children}</ol>
            ),
            a: ({ children, href }) => (
              <a
                className="text-brodus-accent underline"
                href={href}
                rel="noreferrer"
                target="_blank"
              >
                {children}
              </a>
            ),
          }}
        >
          {preview}
        </ReactMarkdown>
      </article>
    </div>
  );
}
