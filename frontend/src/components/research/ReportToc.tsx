type TocEntry = {
  level: number;
  text: string;
  id: string;
};

type ReportTocProps = {
  entries: TocEntry[];
};

export default function ReportToc({ entries }: ReportTocProps) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border border-brodus-border bg-brodus-panel p-3">
      <h2 className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
        Contents
      </h2>
      <nav className="mt-2 space-y-1">
        {entries.map((entry) => (
          <a
            className={`block truncate text-xs text-brodus-muted transition-colors hover:text-brodus-text ${
              entry.level === 2 ? "ml-3" : entry.level === 3 ? "ml-6" : ""
            }`}
            href={`#${entry.id}`}
            key={`${entry.id}-${entry.level}`}
          >
            {entry.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
