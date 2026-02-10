"use client";

import { useState, useMemo } from "react";
import { Plus, TrendingUp, TrendingDown, Target } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import JournalTabs from "@/components/journal/JournalTabs";
import TradeLogTable from "@/components/journal/TradeLogTable";
import TradeLogForm from "@/components/journal/TradeLogForm";
import JournalEntryCard from "@/components/journal/JournalEntryCard";
import JournalEditor from "@/components/journal/JournalEditor";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { JournalTab } from "@/components/journal/JournalTabs";
import type { TradeFormData } from "@/components/journal/TradeLogForm";
import type { JournalFormData } from "@/components/journal/JournalEditor";
import type { TradeEntry, JournalEntry } from "@/types/journal";

export default function JournalPage() {
  const [activeTab, setActiveTab] = useState<JournalTab>("trades");
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [tradeFormOpen, setTradeFormOpen] = useState(false);
  const [journalEditorOpen, setJournalEditorOpen] = useState(false);

  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "closed");
    const openTrades = trades.filter((t) => t.status === "open" || t.status === "partial");
    const totalPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
    const winners = closed.filter((t) => (t.pnl ?? 0) > 0).length;
    const winRate = closed.length > 0 ? (winners / closed.length) * 100 : 0;
    return { totalPnl, winRate, openCount: openTrades.length, closedCount: closed.length };
  }, [trades]);

  const handleAddTrade = (data: TradeFormData) => {
    const newTrade: TradeEntry = {
      id: crypto.randomUUID(),
      ticker: data.ticker,
      side: data.side,
      date: data.date,
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity, 10),
      thesis: data.thesis,
      status: data.status,
      notes: data.notes || undefined,
      created_at: new Date().toISOString(),
    };
    setTrades((prev) => [newTrade, ...prev]);
  };

  const handleAddJournalEntry = (data: JournalFormData) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title: data.title,
      content: data.content,
      tags: data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      created_at: new Date().toISOString(),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Journal"
        subtitle="Trade log and daily observations"
        actions={
          activeTab === "trades" ? (
            <button
              className="flex items-center gap-1.5 rounded border border-brodus-border bg-brodus-surface px-3 py-1.5 text-xs text-brodus-text transition-colors hover:bg-brodus-hover"
              onClick={() => setTradeFormOpen(true)}
              type="button"
            >
              <Plus size={14} />
              Add Trade
            </button>
          ) : (
            <button
              className="flex items-center gap-1.5 rounded border border-brodus-border bg-brodus-surface px-3 py-1.5 text-xs text-brodus-text transition-colors hover:bg-brodus-hover"
              onClick={() => setJournalEditorOpen(true)}
              type="button"
            >
              <Plus size={14} />
              New Entry
            </button>
          )
        }
      />

      {activeTab === "trades" && trades.length > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-brodus-border bg-brodus-panel p-3">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              <TrendingUp size={12} />
              Total P&L
            </div>
            <div
              className={`mt-1 font-data text-lg font-semibold ${
                stats.totalPnl >= 0 ? "text-brodus-green" : "text-brodus-red"
              }`}
            >
              {formatCurrency(stats.totalPnl)}
            </div>
          </div>
          <div className="rounded-lg border border-brodus-border bg-brodus-panel p-3">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              <Target size={12} />
              Win Rate
            </div>
            <div className="mt-1 font-data text-lg font-semibold text-brodus-text">
              {formatPercent(stats.winRate)}
            </div>
          </div>
          <div className="rounded-lg border border-brodus-border bg-brodus-panel p-3">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              <TrendingUp size={12} />
              Open
            </div>
            <div className="mt-1 font-data text-lg font-semibold text-brodus-accent">
              {stats.openCount}
            </div>
          </div>
          <div className="rounded-lg border border-brodus-border bg-brodus-panel p-3">
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              <TrendingDown size={12} />
              Closed
            </div>
            <div className="mt-1 font-data text-lg font-semibold text-brodus-muted">
              {stats.closedCount}
            </div>
          </div>
        </div>
      ) : null}

      <JournalTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tradeCount={trades.length}
        journalCount={journalEntries.length}
      />

      {activeTab === "trades" ? (
        <TradeLogTable trades={trades} />
      ) : (
        <div className="space-y-3">
          {journalEntries.length === 0 ? (
            <div className="rounded-lg border border-brodus-border bg-brodus-panel p-5 text-sm text-brodus-muted">
              No journal entries yet. Click &quot;New Entry&quot; to start writing.
            </div>
          ) : (
            journalEntries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))
          )}
        </div>
      )}

      <TradeLogForm
        open={tradeFormOpen}
        onClose={() => setTradeFormOpen(false)}
        onSubmit={handleAddTrade}
      />
      <JournalEditor
        open={journalEditorOpen}
        onClose={() => setJournalEditorOpen(false)}
        onSubmit={handleAddJournalEntry}
      />
    </div>
  );
}
