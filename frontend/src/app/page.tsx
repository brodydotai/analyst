"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import ReportModal from "@/components/ReportModal";
import { fetchJson } from "@/lib/api";
import {
  formatCurrency,
  formatMultiple,
  formatPercent,
} from "@/lib/format";
import type {
  WatchlistCategory,
  WatchlistCategoryWithItems,
  WatchlistItem,
  WatchlistResponse,
} from "@/types/watchlist";
import type { AssetReportResponse, DailyReportResponse } from "@/types/reports";

type ReportState = {
  open: boolean;
  title: string;
  content: string | null;
  loading: boolean;
  error: string | null;
};

const defaultReportState: ReportState = {
  open: false,
  title: "",
  content: null,
  loading: false,
  error: null,
};

const valueColor = (value?: number) => {
  if (value === null || value === undefined) {
    return "text-atlas-muted";
  }
  return value >= 0 ? "text-atlas-green" : "text-atlas-red";
};

const normalizeWatchlist = (
  response: WatchlistResponse
): WatchlistCategoryWithItems[] => {
  if (response.categories && response.categories.length > 0) {
    return response.categories;
  }

  if (!response.items || response.items.length === 0) {
    return [];
  }

  return [
    {
      id: "uncategorized",
      name: "Uncategorized",
      sort_order: 0,
      items: response.items,
    },
  ];
};

export default function WatchlistPage() {
  const [categories, setCategories] = useState<WatchlistCategoryWithItems[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);
  const [reportState, setReportState] = useState<ReportState>(
    defaultReportState
  );
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchJson<WatchlistResponse>(
        "/api/python/watchlist"
      );
      const normalized = normalizeWatchlist(response);
      setCategories(normalized);
      setExpanded((current) => {
        if (normalized.length === 0) {
          return current;
        }
        const next = { ...current };
        normalized.forEach((category) => {
          if (next[category.id] === undefined) {
            next[category.id] = true;
          }
        });
        return next;
      });
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load watchlist.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWatchlist();
  }, [loadWatchlist]);

  const categoryOptions = useMemo<WatchlistCategory[]>(() => {
    return categories.map(({ id, name, sort_order, created_at, updated_at }) => ({
      id,
      name,
      sort_order,
      created_at,
      updated_at,
    }));
  }, [categories]);

  const allItems = useMemo(() => {
    return categories.flatMap((category) => category.items);
  }, [categories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }
    setSaving(true);
    try {
      await fetchJson<WatchlistCategory>("/api/python/watchlist/categories", {
        method: "POST",
        body: { name: newCategoryName.trim() },
      });
      setNewCategoryName("");
      await loadWatchlist();
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create category.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAsset = async () => {
    if (!newTicker.trim()) {
      setError("Ticker is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await fetchJson<WatchlistItem>("/api/python/watchlist", {
        method: "POST",
        body: {
          ticker: newTicker.trim().toUpperCase(),
          name: newName.trim() || newTicker.trim().toUpperCase(),
          category_id: newCategoryId,
        },
      });
      setNewTicker("");
      setNewName("");
      await loadWatchlist();
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to add asset.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this asset from the watchlist?")) {
      return;
    }
    setSaving(true);
    try {
      await fetchJson(`/api/python/watchlist/${itemId}`, {
        method: "DELETE",
      });
      await loadWatchlist();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete asset.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveItem = async (
    item: WatchlistItem,
    direction: "up" | "down"
  ) => {
    const category = categories.find((entry) => entry.id === item.category_id);
    if (!category) {
      return;
    }
    const index = category.items.findIndex((entry) => entry.id === item.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= category.items.length) {
      return;
    }
    const swapped = category.items[swapIndex];
    const updated = [
      { id: item.id, sort_order: swapped.sort_order },
      { id: swapped.id, sort_order: item.sort_order },
    ];
    setSaving(true);
    try {
      await fetchJson("/api/python/watchlist/reorder", {
        method: "PUT",
        body: { items: updated },
      });
      await loadWatchlist();
    } catch (reorderError) {
      const message =
        reorderError instanceof Error
          ? reorderError.message
          : "Failed to reorder assets.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveCategory = async (
    item: WatchlistItem,
    categoryId: string
  ) => {
    setSaving(true);
    try {
      await fetchJson(`/api/python/watchlist/${item.id}`, {
        method: "PUT",
        body: { category_id: categoryId },
      });
      await loadWatchlist();
    } catch (moveError) {
      const message =
        moveError instanceof Error
          ? moveError.message
          : "Failed to move asset.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const openReport = async (ticker: string) => {
    setReportState({
      open: true,
      title: `${ticker} Report`,
      content: null,
      loading: true,
      error: null,
    });
    try {
      const response = await fetchJson<AssetReportResponse>(
        "/api/python/reports/asset",
        {
          method: "POST",
          body: { ticker },
        }
      );
      setReportState({
        open: true,
        title: `${ticker} Report`,
        content: response.report,
        loading: false,
        error: null,
      });
    } catch (reportError) {
      const message =
        reportError instanceof Error
          ? reportError.message
          : "Failed to generate report.";
      setReportState({
        open: true,
        title: `${ticker} Report`,
        content: null,
        loading: false,
        error: message,
      });
    }
  };

  const openDailyBriefing = async () => {
    setReportState({
      open: true,
      title: "24h Summary",
      content: null,
      loading: true,
      error: null,
    });
    try {
      const response = await fetchJson<DailyReportResponse>(
        "/api/python/reports/daily",
        { method: "POST" }
      );
      setReportState({
        open: true,
        title: "24h Summary",
        content: response.report,
        loading: false,
        error: null,
      });
    } catch (reportError) {
      const message =
        reportError instanceof Error
          ? reportError.message
          : "Failed to generate daily summary.";
      setReportState({
        open: true,
        title: "24h Summary",
        content: null,
        loading: false,
        error: message,
      });
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Watchlist</h1>
          <p className="text-sm text-atlas-muted">
            Live overview of your tracked assets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md border border-atlas-border px-3 py-2 text-xs uppercase tracking-wide text-atlas-muted hover:bg-atlas-panel"
            onClick={() => setEditMode((current) => !current)}
            type="button"
          >
            {editMode ? "Done" : "Edit"}
          </button>
          <button
            className="rounded-md border border-atlas-border px-3 py-2 text-xs uppercase tracking-wide text-atlas-muted hover:bg-atlas-panel"
            onClick={() => void loadWatchlist()}
            type="button"
          >
            Refresh
          </button>
          <button
            className="rounded-md border border-atlas-border bg-atlas-panel px-4 py-2 text-xs uppercase tracking-wide text-atlas-text hover:bg-atlas-background"
            onClick={() => void openDailyBriefing()}
            type="button"
          >
            24h Summary
          </button>
        </div>
      </header>

      {error ? <ErrorBanner message={error} onRetry={loadWatchlist} /> : null}

      <section className="rounded-lg border border-atlas-border bg-atlas-panel p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-atlas-muted">
          Add Asset
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_200px_120px]">
          <input
            className="rounded-md border border-atlas-border bg-atlas-background px-3 py-2 text-sm text-atlas-text"
            placeholder="Ticker"
            value={newTicker}
            onChange={(event) => setNewTicker(event.target.value)}
          />
          <input
            className="rounded-md border border-atlas-border bg-atlas-background px-3 py-2 text-sm text-atlas-text"
            placeholder="Company name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
          <select
            className="rounded-md border border-atlas-border bg-atlas-background px-3 py-2 text-sm text-atlas-text"
            value={newCategoryId ?? ""}
            onChange={(event) =>
              setNewCategoryId(event.target.value || null)
            }
          >
            <option value="">Uncategorized</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            className="rounded-md border border-atlas-border bg-atlas-background px-3 py-2 text-xs uppercase tracking-wide text-atlas-text hover:bg-atlas-border"
            onClick={() => void handleAddAsset()}
            type="button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            className="rounded-md border border-atlas-border bg-atlas-background px-3 py-2 text-sm text-atlas-text"
            placeholder="New category"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
          <button
            className="rounded-md border border-atlas-border px-3 py-2 text-xs uppercase tracking-wide text-atlas-muted hover:bg-atlas-background"
            onClick={() => void handleAddCategory()}
            type="button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Category"}
          </button>
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-12 w-full animate-pulse rounded bg-atlas-panel"
            />
          ))}
        </div>
      ) : null}

      {!loading && categories.length === 0 ? (
        <EmptyState
          title="No assets yet."
          subtitle="Add a ticker to start building your watchlist."
        />
      ) : null}

      {!loading && categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map((category) => {
            const isExpanded =
              expanded[category.id] ?? category.items.length > 0;
            return (
              <section
                key={category.id}
                className="rounded-lg border border-atlas-border bg-atlas-panel"
              >
                <div className="flex items-center justify-between border-b border-atlas-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-md border border-atlas-border px-2 py-1 text-xs uppercase tracking-wide text-atlas-muted hover:bg-atlas-background"
                      onClick={() =>
                        setExpanded((current) => ({
                          ...current,
                          [category.id]: !isExpanded,
                        }))
                      }
                      type="button"
                    >
                      {isExpanded ? "Hide" : "Show"}
                    </button>
                    <h3 className="text-base font-semibold">{category.name}</h3>
                    <span className="text-xs text-atlas-muted">
                      {category.items.length} assets
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-[110px_1.3fr_110px_90px_110px_80px_80px_80px_140px] gap-3 border-b border-atlas-border pb-3 text-xs uppercase tracking-wide text-atlas-muted">
                      <span>Ticker</span>
                      <span>Name</span>
                      <span>Price</span>
                      <span>P/E</span>
                      <span>EV/EBITDA</span>
                      <span>1D</span>
                      <span>1W</span>
                      <span>1M</span>
                      <span>Actions</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[110px_1.3fr_110px_90px_110px_80px_80px_80px_140px] items-center gap-3 rounded-md border border-transparent px-2 py-2 text-sm hover:border-atlas-border"
                        >
                          <span className="font-semibold">{item.ticker}</span>
                          <span className="text-atlas-muted">{item.name}</span>
                          <span>{formatCurrency(item.metrics?.price)}</span>
                          <span>{formatMultiple(item.metrics?.pe_ratio)}</span>
                          <span>{formatMultiple(item.metrics?.ev_ebitda)}</span>
                          <span className={valueColor(item.metrics?.change_1d)}>
                            {formatPercent(item.metrics?.change_1d)}
                          </span>
                          <span className={valueColor(item.metrics?.change_1w)}>
                            {formatPercent(item.metrics?.change_1w)}
                          </span>
                          <span className={valueColor(item.metrics?.change_1m)}>
                            {formatPercent(item.metrics?.change_1m)}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {item.links?.tradingview ? (
                              <a
                                className="rounded-md border border-atlas-border px-2 py-1 text-atlas-muted hover:bg-atlas-background"
                                href={item.links.tradingview}
                                rel="noreferrer"
                                target="_blank"
                              >
                                TV
                              </a>
                            ) : null}
                            {item.links?.edgar ? (
                              <a
                                className="rounded-md border border-atlas-border px-2 py-1 text-atlas-muted hover:bg-atlas-background"
                                href={item.links.edgar}
                                rel="noreferrer"
                                target="_blank"
                              >
                                EDGAR
                              </a>
                            ) : null}
                            <button
                              className="rounded-md border border-atlas-border px-2 py-1 text-atlas-muted hover:bg-atlas-background"
                              onClick={() => void openReport(item.ticker)}
                              type="button"
                            >
                              Report
                            </button>
                          </div>
                          {editMode ? (
                            <div className="col-span-full mt-2 flex flex-wrap items-center gap-2 text-xs text-atlas-muted">
                              <button
                                className="rounded-md border border-atlas-border px-2 py-1 hover:bg-atlas-background"
                                onClick={() => void handleMoveItem(item, "up")}
                                type="button"
                                disabled={saving}
                              >
                                Move Up
                              </button>
                              <button
                                className="rounded-md border border-atlas-border px-2 py-1 hover:bg-atlas-background"
                                onClick={() =>
                                  void handleMoveItem(item, "down")
                                }
                                type="button"
                                disabled={saving}
                              >
                                Move Down
                              </button>
                              <select
                                className="rounded-md border border-atlas-border bg-atlas-background px-2 py-1 text-xs text-atlas-text"
                                value={item.category_id ?? ""}
                                onChange={(event) =>
                                  void handleMoveCategory(
                                    item,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">Uncategorized</option>
                                {categoryOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="rounded-md border border-red-500/50 px-2 py-1 text-red-300 hover:bg-red-500/10"
                                onClick={() => void handleDeleteItem(item.id)}
                                type="button"
                                disabled={saving}
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                      {category.items.length === 0 ? (
                        <p className="text-sm text-atlas-muted">
                          No assets in this category.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : null}

      <ReportModal
        open={reportState.open}
        title={reportState.title}
        content={reportState.content}
        loading={reportState.loading}
        error={reportState.error}
        onClose={() => setReportState(defaultReportState)}
      />

      {!loading && categories.length > 0 ? (
        <footer className="text-xs text-atlas-muted">
          {allItems.length} assets tracked across {categories.length} categories.
        </footer>
      ) : null}
    </div>
  );
}
