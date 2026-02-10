"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ReportViewerProps = {
  content: string;
  label: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function ReportViewer({ content, label }: ReportViewerProps) {
  return (
    <div className="rounded-lg border border-brodus-border bg-brodus-panel p-5">
      <h2 className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
        {label}
      </h2>
      <article className="mt-4 space-y-3 text-sm leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1
                className="text-xl font-semibold text-brodus-text"
                id={slugify(String(children ?? ""))}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className="mt-6 text-lg font-semibold text-brodus-text"
                id={slugify(String(children ?? ""))}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className="mt-4 text-base font-semibold text-brodus-text"
                id={slugify(String(children ?? ""))}
              >
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-brodus-text/90">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 text-brodus-text/90">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 text-brodus-text/90">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="py-0.5">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-brodus-accent/40 pl-4 text-brodus-muted italic">
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes("language-");
              if (isBlock) {
                return (
                  <code className="block overflow-x-auto rounded bg-brodus-background p-3 text-xs text-brodus-text">
                    {children}
                  </code>
                );
              }
              return (
                <code className="rounded bg-brodus-background px-1.5 py-0.5 text-xs text-brodus-accent">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <pre className="my-2">{children}</pre>,
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-brodus-border bg-brodus-background/50 text-left text-2xs uppercase tracking-wider text-brodus-muted">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-3 py-1.5 font-semibold">{children}</th>
            ),
            td: ({ children }) => (
              <td className="border-b border-brodus-border/50 px-3 py-1.5 text-brodus-text/90">
                {children}
              </td>
            ),
            a: ({ children, href }) => (
              <a
                className="text-brodus-accent underline decoration-brodus-accent/30 hover:decoration-brodus-accent"
                href={href}
                rel="noreferrer"
                target="_blank"
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="my-4 border-brodus-border" />
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-brodus-text">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
