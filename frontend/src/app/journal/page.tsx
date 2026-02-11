"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import JournalTabs from "@/components/journal/JournalTabs";
import TradeLogTable from "@/components/journal/TradeLogTable";
import TradeLogForm from "@/components/journal/TradeLogForm";
import JournalEntryCard from "@/components/journal/JournalEntryCard";
import JournalEditor from "@/components/journal/JournalEditor";
import Panel from "@/components/ui/Panel";
import ErrorBanner from "@/components/ErrorBanner";
import { fetchJson } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { JournalTab } from "@/components/journal/JournalTabs";
import type { TradeFormData } from "@/components/journal/TradeLogForm";
import type { JournalFormData } from "@/components/journal/JournalEditor";
import type { TradeEntry, JournalEntry } from "@/types/journal";

type TradeFilter = "all" | "open" | "closed";

export default function JournalPage() {
  const [activeTab, setActiveTab] = useState<JournalTab>("trades");
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [tradeFormOpen, setTradeFormOpen] = useState(false);
  const [journalEditorOpen, setJournalEditorOpen] = useState(false);
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const normalizeTradeEntry = (entry: TradeEntry): TradeEntry => ({
    ...entry,
    price: Number(entry.price),
    quantity: Number(entry.quantity),
    exit_price: entry.exit_price === null ? null : Number(entry.exit_price),
    pnl: entry.pnl === null ? null : Number(entry.pnl),
    pnl_percent: entry.pnl_percent === null ? null : Number(entry.pnl_percent),
  });

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [tradeData, entryData] = await Promise.all([
        fetchJson<TradeEntry[]>("/api/journal/trades"),
        fetchJson<JournalEntry[]>("/api/journal/entries"),
      ]);
      setTrades(tradeData.map(normalizeTradeEntry));
      setJournalEntries(entryData);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load journal data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "closed");
    const openTrades = trades.filter((t) => t.status === "open" || t.status === "partial");
    const totalPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
    const winners = closed.filter((t) => (t.pnl ?? 0) > 0).length;
    const winRate = closed.length > 0 ? (winners / closed.length) * 100 : 0;
    return { totalPnl, winRate, openCount: openTrades.length, closedCount: closed.length };
  }, [trades]);

  const handleAddTrade = async (data: TradeFormData) => {
    const payload = {
      ticker: data.ticker.trim(),
      side: data.side,
      trade_date: data.trade_date,
      price: Number(data.price),
      quantity: Number(data.quantity),
      thesis: data.thesis,
      status: data.status,
      notes: data.notes || null,
      tags: [],
    };
    try {
      const created = await fetchJson<TradeEntry>("/api/journal/trades", {
        method: "POST",
        body: payload,
      });
      setTrades((prev) => [normalizeTradeEntry(created), ...prev]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to add trade.");
    }
  };

  const handleAddJournalEntry = async (data: JournalFormData) => {
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    const payload = {
      entry_date: new Date().toISOString().split("T")[0],
      title: data.title,
      content: data.content,
      tags,
    };
    try {
      const created = await fetchJson<JournalEntry>("/api/journal/entries", {
        method: "POST",
        body: payload,
      });
      setJournalEntries((prev) => [created, ...prev]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to add journal entry.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Journal"
        subtitle="Trade log and daily observations"
      />

      {loadError ? <ErrorBanner message={loadError} onRetry={loadData} /> : null}

      <JournalTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tradeCount={trades.length}
        journalCount={journalEntries.length}
      />

      {activeTab === "trades" ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Panel title="Total P&amp;L">
              <div
                className={`font-data text-lg font-semibold ${
                  stats.totalPnl >= 0
                    ? "text-brodus-green value-positive"
                    : "text-brodus-red value-negative"
                }`}
              >
                {formatCurrency(stats.totalPnl)}
              </div>
            </Panel>
            <Panel title="Win Rate">
              <div className="font-data text-lg font-semibold text-brodus-text">
                {formatPercent(stats.winRate)}
              </div>
            </Panel>
            <Panel title="Open">
              <div className="font-data text-lg font-semibold text-brodus-accent">
                {stats.openCount}
              </div>
            </Panel>
            <Panel title="Closed">
              <div className="font-data text-lg font-semibold text-brodus-muted">
                {stats.closedCount}
              </div>
            </Panel>
          </div>
          <TradeLogTable
            trades={trades}
            filter={tradeFilter}
            onFilterChange={setTradeFilter}
            onAddTrade={() => setTradeFormOpen(true)}
            isLoading={isLoading}
          />
        </>
      ) : (
        <Panel
          title="Journal Entries"
          actions={
            <button
              className="flex items-center gap-1.5 rounded border border-brodus-border bg-brodus-surface px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-brodus-text transition-colors hover:bg-brodus-hover"
              onClick={() => setJournalEditorOpen(true)}
              type="button"
            >
              <Plus size={14} />
              New Entry
            </button>
          }
        >
          {isLoading ? (
            <div className="text-sm text-brodus-muted">Loading journal entries...</div>
          ) : journalEntries.length === 0 ? (
            <div className="rounded border border-brodus-border bg-brodus-background/40 p-4 text-sm text-brodus-muted">
              No journal entries yet. Click &quot;New Entry&quot; to start writing.
            </div>
          ) : (
            <div className="space-y-3">
              {journalEntries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </Panel>
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
