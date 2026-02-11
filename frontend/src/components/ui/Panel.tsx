import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, actions, children, className }: PanelProps) {
  const classes = ["rounded-lg border border-brodus-border bg-brodus-panel", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <div className="flex items-center justify-between border-b border-brodus-border px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brodus-muted">
          {title}
        </h2>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
