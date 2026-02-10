import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  subtitle: string;
  icon?: ReactNode;
};

export default function EmptyState({ title, subtitle, icon }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-brodus-border bg-brodus-panel p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brodus-surface text-brodus-muted">
        {icon ?? <Inbox size={20} />}
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-brodus-muted">{subtitle}</p>
    </div>
  );
}
