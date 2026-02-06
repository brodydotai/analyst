type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-atlas-border bg-atlas-panel p-6 text-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-atlas-muted">{subtitle}</p>
    </div>
  );
}
