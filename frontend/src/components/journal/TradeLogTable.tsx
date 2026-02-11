import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatPnl, formatPercent, formatDate } from "@/lib/format";
import type { TradeEntry } from "@/types/journal";
import Panel from "@/components/ui/Panel";
import PillToggle from "@/components/ui/PillToggle";

type TradeFilter = "all" | "open" | "closed";

type TradeLogTableProps = {
  trades: TradeEntry[];
  filter: TradeFilter;
  onFilterChange: (filter: TradeFilter) => void;
  onAddTrade: () => void;
  isLoading: boolean;
};

const sideLabel = (side: TradeEntry["side"]): string => {
  const labels: Record<TradeEntry["side"], string> = {
    buy: "BUY",
    sell: "SELL",
    short: "SHORT",
    cover: "COVER",
  };
  return labels[side];
};

const sideColor = (side: TradeEntry["side"]): string => {
  if (side === "buy" || side === "cover") return "text-brodus-green";
  return "text-brodus-red";
};

const statusBadge = (status: TradeEntry["status"]): string => {
  const styles: Record<TradeEntry["status"], string> = {
    open: "bg-brodus-accent/15 text-brodus-accent",
    closed: "bg-brodus-muted/15 text-brodus-muted",
    partial: "bg-brodus-amber/15 text-brodus-amber",
  };
  return styles[status];
};

const filterOptions = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
];

export default function TradeLogTable({
  trades,
  filter,
  onFilterChange,
  onAddTrade,
  isLoading,
}: TradeLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const filteredTrades = trades.filter((trade) => {
    if (filter === "open") return trade.status === "open" || trade.status === "partial";
    if (filter === "closed") return trade.status === "closed";
    return true;
  });

  return (
    <Panel
      title="Trade Log"
      actions={
        <>
          <PillToggle
            options={filterOptions}
            active={filter}
            onChange={(key) => onFilterChange(key as TradeFilter)}
          />
          <button
            className="flex items-center gap-1.5 rounded border border-brodus-border bg-brodus-surface px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-brodus-text transition-colors hover:bg-brodus-hover"
            onClick={onAddTrade}
            type="button"
          >
            <Plus size={14} />
            Add
          </button>
        </>
      }
    >
      {isLoading ? (
        <div className="rounded border border-brodus-border bg-brodus-background/40 p-4 text-sm text-brodus-muted">
          Loading trades...
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="rounded border border-brodus-border bg-brodus-background/40 p-4 text-sm text-brodus-muted">
          No trades match this view yet. Log a trade to start tracking performance.
        </div>
      ) : (
        <div className="divide-y divide-brodus-border">
          <div className="grid grid-cols-[28px_70px_80px_60px_90px_70px_80px_90px_80px] gap-2 bg-brodus-background/30 px-3 py-1.5 text-2xs uppercase tracking-wider text-brodus-muted">
            <span />
            <span>Ticker</span>
            <span>Date</span>
            <span>Side</span>
            <span>Price</span>
            <span>Qty</span>
            <span>Status</span>
            <span>P&amp;L</span>
            <span>P&amp;L %</span>
          </div>
          {filteredTrades.map((trade) => {
            const isExpanded = expandedId === trade.id;
            const pnlClass =
              trade.pnl === null
                ? "text-brodus-muted"
                : trade.pnl >= 0
                  ? "text-brodus-green"
                  : "text-brodus-red";
            const pnlPercentClass =
              trade.pnl_percent === null
                ? "text-brodus-muted"
                : trade.pnl_percent >= 0
                  ? "text-brodus-green"
                  : "text-brodus-red";

            return (
              <div key={trade.id}>
                <button
                  className="grid w-full grid-cols-[28px_70px_80px_60px_90px_70px_80px_90px_80px] items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-brodus-hover/50"
                  onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                  type="button"
                >
                  <span className="text-brodus-muted">
                    {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </span>
                  <span className="font-semibold">{trade.ticker}</span>
                  <span className="font-data text-xs text-brodus-muted">
                    {formatDate(trade.trade_date)}
                  </span>
                  <span className={`text-xs font-semibold ${sideColor(trade.side)}`}>
                    {sideLabel(trade.side)}
                  </span>
                  <span className="font-data text-xs">{formatCurrency(trade.price)}</span>
                  <span className="font-data text-xs">{trade.quantity}</span>
                  <span>
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-2xs font-medium uppercase ${statusBadge(trade.status)}`}
                    >
                      {trade.status}
                    </span>
                  </span>
                  <span className={`font-data text-xs ${pnlClass}`}>
                    {formatPnl(trade.pnl ?? undefined)}
                  </span>
                  <span className={`font-data text-xs ${pnlPercentClass}`}>
                    {formatPercent(trade.pnl_percent ?? undefined)}
                  </span>
                </button>
                {isExpanded ? (
                  <div className="bg-brodus-background/40 px-4 py-3 text-xs">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <span className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
                          Thesis
                        </span>
                        <p className="mt-1 text-brodus-text/90">
                          {trade.thesis || "No thesis recorded."}
                        </p>
                      </div>
                      <div>
                        <span className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
                          Notes
                        </span>
                        <p className="mt-1 text-brodus-text/90">
                          {trade.notes || "No notes."}
                        </p>
                      </div>
                    </div>
                    {trade.exit_price !== null ? (
                      <div className="mt-2 flex gap-4 text-brodus-muted">
                        <span>
                          Exit:{" "}
                          <span className="font-data text-brodus-text">
                            {formatCurrency(trade.exit_price)}
                          </span>
                        </span>
                        {trade.exit_date ? (
                          <span>
                            Date:{" "}
                            <span className="font-data text-brodus-text">
                              {formatDate(trade.exit_date)}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
