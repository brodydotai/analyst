"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import ReportModal from "@/components/ReportModal";
import WatchlistHeader from "@/components/watchlist/WatchlistHeader";
import AddAssetForm from "@/components/watchlist/AddAssetForm";
import CategorySection from "@/components/watchlist/CategorySection";
import { fetchJson } from "@/lib/api";
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
  const [categories, setCategories] = useState<WatchlistCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);
  const [reportState, setReportState] = useState<ReportState>(defaultReportState);
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
        "/api/watchlist"
      );
      const normalized = normalizeWatchlist(response);
      setCategories(normalized);
      setExpanded((current) => {
        if (normalized.length === 0) return current;
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
        loadError instanceof Error ? loadError.message : "Failed to load watchlist.";
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
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      await fetchJson<WatchlistCategory>("/api/watchlist/categories", {
        method: "POST",
        body: { name: newCategoryName.trim() },
      });
      setNewCategoryName("");
      await loadWatchlist();
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Failed to create category.";
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
      await fetchJson<WatchlistItem>("/api/watchlist", {
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
        createError instanceof Error ? createError.message : "Failed to add asset.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this asset from the watchlist?")) return;
    setSaving(true);
    try {
      await fetchJson(`/api/watchlist/${itemId}`, { method: "DELETE" });
      await loadWatchlist();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Failed to delete asset.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveItem = async (item: WatchlistItem, direction: "up" | "down") => {
    const category = categories.find((entry) => entry.id === item.category_id);
    if (!category) return;
    const index = category.items.findIndex((entry) => entry.id === item.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= category.items.length) return;
    const swapped = category.items[swapIndex];
    setSaving(true);
    try {
      await fetchJson("/api/watchlist/reorder", {
        method: "PUT",
        body: {
          items: [
            { id: item.id, sort_order: swapped.sort_order },
            { id: swapped.id, sort_order: item.sort_order },
          ],
        },
      });
      await loadWatchlist();
    } catch (reorderError) {
      const message =
        reorderError instanceof Error ? reorderError.message : "Failed to reorder.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveCategory = async (item: WatchlistItem, categoryId: string) => {
    setSaving(true);
    try {
      await fetchJson(`/api/watchlist/${item.id}`, {
        method: "PUT",
        body: { category_id: categoryId },
      });
      await loadWatchlist();
    } catch (moveError) {
      const message =
        moveError instanceof Error ? moveError.message : "Failed to move asset.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const openReport = async (ticker: string) => {
    setReportState({ open: true, title: `${ticker} Report`, content: null, loading: true, error: null });
    try {
      const response = await fetchJson<AssetReportResponse>(
        "/api/reports/asset",
        { method: "POST", body: { ticker } }
      );
      setReportState({ open: true, title: `${ticker} Report`, content: response.report, loading: false, error: null });
    } catch (reportError) {
      const message =
        reportError instanceof Error ? reportError.message : "Failed to generate report.";
      setReportState({ open: true, title: `${ticker} Report`, content: null, loading: false, error: message });
    }
  };

  const openDailyBriefing = async () => {
    setReportState({ open: true, title: "24h Summary", content: null, loading: true, error: null });
    try {
      const response = await fetchJson<DailyReportResponse>(
        "/api/reports/daily",
        { method: "POST" }
      );
      setReportState({ open: true, title: "24h Summary", content: response.report, loading: false, error: null });
    } catch (reportError) {
      const message =
        reportError instanceof Error ? reportError.message : "Failed to generate summary.";
      setReportState({ open: true, title: "24h Summary", content: null, loading: false, error: message });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <WatchlistHeader
        editMode={editMode}
        onToggleEdit={() => setEditMode((c) => !c)}
        onRefresh={() => void loadWatchlist()}
        onDailySummary={() => void openDailyBriefing()}
      />

      {error ? <ErrorBanner message={error} onRetry={loadWatchlist} /> : null}

      <AddAssetForm
        newTicker={newTicker}
        newName={newName}
        newCategoryId={newCategoryId}
        newCategoryName={newCategoryName}
        categories={categoryOptions}
        saving={saving}
        onTickerChange={setNewTicker}
        onNameChange={setNewName}
        onCategoryIdChange={setNewCategoryId}
        onCategoryNameChange={setNewCategoryName}
        onAddAsset={() => void handleAddAsset()}
        onAddCategory={() => void handleAddCategory()}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-9 w-full animate-pulse rounded bg-brodus-panel"
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
        <div className="space-y-4">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              expanded={expanded[category.id] ?? category.items.length > 0}
              editMode={editMode}
              saving={saving}
              allCategories={categoryOptions}
              onToggleExpand={() =>
                setExpanded((current) => ({
                  ...current,
                  [category.id]: !(current[category.id] ?? category.items.length > 0),
                }))
              }
              onOpenReport={(ticker) => void openReport(ticker)}
              onMoveItem={(item, dir) => void handleMoveItem(item, dir)}
              onMoveCategory={(item, catId) => void handleMoveCategory(item, catId)}
              onDeleteItem={(id) => void handleDeleteItem(id)}
            />
          ))}
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
        <footer className="text-xs text-brodus-muted">
          {allItems.length} assets across {categories.length} categories
        </footer>
      ) : null}
    </div>
  );
}
