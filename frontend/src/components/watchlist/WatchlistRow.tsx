import { ExternalLink, FileBarChart } from "lucide-react";
import {
  formatCurrency,
  formatMultiple,
  formatPercent,
} from "@/lib/format";
import type { WatchlistItem, WatchlistCategory } from "@/types/watchlist";
import EditControls from "./EditControls";

type WatchlistRowProps = {
  item: WatchlistItem;
  editMode: boolean;
  saving: boolean;
  categories: WatchlistCategory[];
  onOpenReport: (ticker: string) => void;
  onMoveItem: (item: WatchlistItem, direction: "up" | "down") => void;
  onMoveCategory: (item: WatchlistItem, categoryId: string) => void;
  onDeleteItem: (itemId: string) => void;
};

const valueClass = (value?: number): string => {
  if (value === null || value === undefined) {
    return "text-brodus-muted";
  }
  if (value > 0) {
    return "value-positive";
  }
  if (value < 0) {
    return "value-negative";
  }
  return "text-brodus-muted";
};

export default function WatchlistRow({
  item,
  editMode,
  saving,
  categories,
  onOpenReport,
  onMoveItem,
  onMoveCategory,
  onDeleteItem,
}: WatchlistRowProps) {
  return (
    <div className="group">
      <div className="grid grid-cols-[90px_1.2fr_90px_70px_90px_65px_65px_65px_110px] items-center gap-2 border-b border-brodus-border px-3 py-1.5 text-sm transition-colors hover:bg-brodus-hover/50">
        <span className="font-semibold text-brodus-text">{item.ticker}</span>
        <span className="truncate text-brodus-muted">{item.name}</span>
        <span className="font-data">{formatCurrency(item.metrics?.price)}</span>
        <span className="font-data">{formatMultiple(item.metrics?.pe_ratio)}</span>
        <span className="font-data">{formatMultiple(item.metrics?.ev_ebitda)}</span>
        <span className={`font-data ${valueClass(item.metrics?.change_1d)}`}>
          {formatPercent(item.metrics?.change_1d)}
        </span>
        <span className={`font-data ${valueClass(item.metrics?.change_1w)}`}>
          {formatPercent(item.metrics?.change_1w)}
        </span>
        <span className={`font-data ${valueClass(item.metrics?.change_1m)}`}>
          {formatPercent(item.metrics?.change_1m)}
        </span>
        <div className="flex items-center gap-1.5">
          {item.links?.tradingview ? (
            <a
              className="rounded p-1 text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
              href={item.links.tradingview}
              rel="noreferrer"
              target="_blank"
              title="TradingView"
            >
              <ExternalLink size={13} />
            </a>
          ) : null}
          {item.links?.edgar ? (
            <a
              className="rounded p-1 text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
              href={item.links.edgar}
              rel="noreferrer"
              target="_blank"
              title="EDGAR"
            >
              <ExternalLink size={13} />
            </a>
          ) : null}
          <button
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
            onClick={() => onOpenReport(item.ticker)}
            type="button"
          >
            <FileBarChart size={13} />
            Report
          </button>
        </div>
      </div>
      {editMode ? (
        <EditControls
          item={item}
          saving={saving}
          categories={categories}
          onMoveItem={onMoveItem}
          onMoveCategory={onMoveCategory}
          onDeleteItem={onDeleteItem}
        />
      ) : null}
    </div>
  );
}
