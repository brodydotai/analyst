import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import type { WatchlistItem, WatchlistCategory } from "@/types/watchlist";

type EditControlsProps = {
  item: WatchlistItem;
  saving: boolean;
  categories: WatchlistCategory[];
  onMoveItem: (item: WatchlistItem, direction: "up" | "down") => void;
  onMoveCategory: (item: WatchlistItem, categoryId: string) => void;
  onDeleteItem: (itemId: string) => void;
};

export default function EditControls({
  item,
  saving,
  categories,
  onMoveItem,
  onMoveCategory,
  onDeleteItem,
}: EditControlsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-brodus-border bg-brodus-background/50 px-3 py-1.5 text-xs text-brodus-muted">
      <button
        className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-brodus-hover hover:text-brodus-text"
        onClick={() => onMoveItem(item, "up")}
        type="button"
        disabled={saving}
      >
        <ArrowUp size={12} />
        Up
      </button>
      <button
        className="flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-brodus-hover hover:text-brodus-text"
        onClick={() => onMoveItem(item, "down")}
        type="button"
        disabled={saving}
      >
        <ArrowDown size={12} />
        Down
      </button>
      <select
        className="rounded border border-brodus-border bg-brodus-background px-2 py-0.5 text-xs text-brodus-text"
        value={item.category_id ?? ""}
        onChange={(event) => onMoveCategory(item, event.target.value)}
      >
        <option value="">Uncategorized</option>
        {categories.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <button
        className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-brodus-danger transition-colors hover:bg-red-500/10"
        onClick={() => onDeleteItem(item.id)}
        type="button"
        disabled={saving}
      >
        <Trash2 size={12} />
        Delete
      </button>
    </div>
  );
}
