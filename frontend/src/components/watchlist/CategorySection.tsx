import { ChevronDown, ChevronRight } from "lucide-react";
import type { WatchlistCategoryWithItems, WatchlistCategory, WatchlistItem } from "@/types/watchlist";
import WatchlistRow from "./WatchlistRow";

type CategorySectionProps = {
  category: WatchlistCategoryWithItems;
  expanded: boolean;
  editMode: boolean;
  saving: boolean;
  allCategories: WatchlistCategory[];
  onToggleExpand: () => void;
  onOpenReport: (ticker: string) => void;
  onMoveItem: (item: WatchlistItem, direction: "up" | "down") => void;
  onMoveCategory: (item: WatchlistItem, categoryId: string) => void;
  onDeleteItem: (itemId: string) => void;
};

export default function CategorySection({
  category,
  expanded,
  editMode,
  saving,
  allCategories,
  onToggleExpand,
  onOpenReport,
  onMoveItem,
  onMoveCategory,
  onDeleteItem,
}: CategorySectionProps) {
  return (
    <section className="rounded-lg border border-brodus-border bg-brodus-panel">
      <button
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-brodus-hover/30"
        onClick={onToggleExpand}
        type="button"
      >
        {expanded ? (
          <ChevronDown size={14} className="text-brodus-muted" />
        ) : (
          <ChevronRight size={14} className="text-brodus-muted" />
        )}
        <h3 className="text-sm font-semibold">{category.name}</h3>
        <span className="text-2xs text-brodus-muted">
          {category.items.length}
        </span>
      </button>

      {expanded ? (
        <div>
          <div className="grid grid-cols-[90px_1.2fr_90px_70px_90px_65px_65px_65px_110px] gap-2 border-b border-brodus-border bg-brodus-background/30 px-3 py-1 text-2xs uppercase tracking-wider text-brodus-muted">
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
          {category.items.length === 0 ? (
            <p className="px-4 py-3 text-xs text-brodus-muted">
              No assets in this category.
            </p>
          ) : (
            category.items.map((item) => (
              <WatchlistRow
                key={item.id}
                item={item}
                editMode={editMode}
                saving={saving}
                categories={allCategories}
                onOpenReport={onOpenReport}
                onMoveItem={onMoveItem}
                onMoveCategory={onMoveCategory}
                onDeleteItem={onDeleteItem}
              />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
