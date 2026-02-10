import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatPnl, formatPercent, formatDate } from "@/lib/format";
import type { TradeEntry } from "@/types/journal";

type TradeLogTableProps = {
  trades: TradeEntry[];
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

export default function TradeLogTable({ trades }: TradeLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (trades.length === 0) {
    return (
      <div className="rounded-lg border border-brodus-border bg-brodus-panel p-5 text-sm text-brodus-muted">
        No trades logged yet. Click &quot;Add Trade&quot; to record your first position.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-brodus-border bg-brodus-panel">
      <div className="grid grid-cols-[28px_70px_70px_55px_80px_60px_70px_80px_80px] gap-2 border-b border-brodus-border bg-brodus-background/30 px-3 py-1.5 text-2xs uppercase tracking-wider text-brodus-muted">
        <span />
        <span>Ticker</span>
        <span>Date</span>
        <span>Side</span>
        <span>Price</span>
        <span>Qty</span>
        <span>Status</span>
        <span>P&L</span>
        <span>P&L %</span>
      </div>
      {trades.map((trade) => {
        const isExpanded = expandedId === trade.id;
        return (
          <div key={trade.id}>
            <button
              className="grid w-full grid-cols-[28px_70px_70px_55px_80px_60px_70px_80px_80px] items-center gap-2 border-b border-brodus-border px-3 py-1.5 text-left text-sm transition-colors hover:bg-brodus-hover/50"
              onClick={() => setExpandedId(isExpanded ? null : trade.id)}
              type="button"
            >
              <span className="text-brodus-muted">
                {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <span className="font-semibold">{trade.ticker}</span>
              <span className="font-data text-xs text-brodus-muted">
                {formatDate(trade.date)}
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
              <span
                className={`font-data text-xs ${
                  trade.pnl !== undefined && trade.pnl >= 0
                    ? "text-brodus-green"
                    : "text-brodus-red"
                }`}
              >
                {formatPnl(trade.pnl)}
              </span>
              <span
                className={`font-data text-xs ${
                  trade.pnl_percent !== undefined && trade.pnl_percent >= 0
                    ? "text-brodus-green"
                    : "text-brodus-red"
                }`}
              >
                {formatPercent(trade.pnl_percent)}
              </span>
            </button>
            {isExpanded ? (
              <div className="border-b border-brodus-border bg-brodus-background/40 px-4 py-3 text-xs">
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
                {trade.exit_price !== undefined ? (
                  <div className="mt-2 flex gap-4 text-brodus-muted">
                    <span>
                      Exit: <span className="font-data text-brodus-text">{formatCurrency(trade.exit_price)}</span>
                    </span>
                    {trade.exit_date ? (
                      <span>
                        Date: <span className="font-data text-brodus-text">{formatDate(trade.exit_date)}</span>
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
  );
}
