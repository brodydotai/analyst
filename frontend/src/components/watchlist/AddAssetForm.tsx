import { Plus, FolderPlus } from "lucide-react";
import type { WatchlistCategory } from "@/types/watchlist";

type AddAssetFormProps = {
  newTicker: string;
  newName: string;
  newCategoryId: string | null;
  newCategoryName: string;
  categories: WatchlistCategory[];
  saving: boolean;
  onTickerChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onCategoryIdChange: (value: string | null) => void;
  onCategoryNameChange: (value: string) => void;
  onAddAsset: () => void;
  onAddCategory: () => void;
};

export default function AddAssetForm({
  newTicker,
  newName,
  newCategoryId,
  newCategoryName,
  categories,
  saving,
  onTickerChange,
  onNameChange,
  onCategoryIdChange,
  onCategoryNameChange,
  onAddAsset,
  onAddCategory,
}: AddAssetFormProps) {
  return (
    <div className="rounded-lg border border-brodus-border bg-brodus-panel p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-brodus-muted">
        Add Asset
      </h2>
      <div className="mt-3 grid gap-2 md:grid-cols-[100px_1fr_180px_auto]">
        <input
          className="rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
          placeholder="Ticker"
          value={newTicker}
          onChange={(event) => onTickerChange(event.target.value)}
        />
        <input
          className="rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
          placeholder="Company name"
          value={newName}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <select
          className="rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text"
          value={newCategoryId ?? ""}
          onChange={(event) =>
            onCategoryIdChange(event.target.value || null)
          }
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          className="flex items-center gap-1.5 rounded border border-brodus-border bg-brodus-surface px-3 py-1.5 text-xs text-brodus-text transition-colors hover:bg-brodus-hover"
          onClick={onAddAsset}
          type="button"
          disabled={saving}
        >
          <Plus size={14} />
          {saving ? "..." : "Add"}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          className="rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
          placeholder="New category"
          value={newCategoryName}
          onChange={(event) => onCategoryNameChange(event.target.value)}
        />
        <button
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
          onClick={onAddCategory}
          type="button"
          disabled={saving}
        >
          <FolderPlus size={14} />
          {saving ? "..." : "Add Category"}
        </button>
      </div>
    </div>
  );
}
