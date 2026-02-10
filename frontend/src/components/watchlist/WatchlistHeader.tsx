import { RefreshCw, Settings, FileText } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

type WatchlistHeaderProps = {
  editMode: boolean;
  onToggleEdit: () => void;
  onRefresh: () => void;
  onDailySummary: () => void;
};

export default function WatchlistHeader({
  editMode,
  onToggleEdit,
  onRefresh,
  onDailySummary,
}: WatchlistHeaderProps) {
  return (
    <PageHeader
      title="Watchlist"
      subtitle="Live overview of tracked assets"
      actions={
        <>
          <button
            className="flex items-center gap-1.5 rounded border border-brodus-border px-2.5 py-1.5 text-xs text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
            onClick={onToggleEdit}
            type="button"
          >
            <Settings size={14} />
            {editMode ? "Done" : "Edit"}
          </button>
          <button
            className="flex items-center gap-1.5 rounded border border-brodus-border px-2.5 py-1.5 text-xs text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            className="flex items-center gap-1.5 rounded border border-brodus-border bg-brodus-surface px-3 py-1.5 text-xs text-brodus-text transition-colors hover:bg-brodus-hover"
            onClick={onDailySummary}
            type="button"
          >
            <FileText size={14} />
            24h Summary
          </button>
        </>
      }
    />
  );
}
