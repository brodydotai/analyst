"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { TradeSide, TradeStatus } from "@/types/journal";

type TradeFormData = {
  ticker: string;
  side: TradeSide;
  date: string;
  price: string;
  quantity: string;
  thesis: string;
  status: TradeStatus;
  notes: string;
};

type TradeLogFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TradeFormData) => void;
};

const defaultForm: TradeFormData = {
  ticker: "",
  side: "buy",
  date: new Date().toISOString().split("T")[0],
  price: "",
  quantity: "",
  thesis: "",
  status: "open",
  notes: "",
};

export default function TradeLogForm({
  open,
  onClose,
  onSubmit,
}: TradeLogFormProps) {
  const [form, setForm] = useState<TradeFormData>(defaultForm);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.ticker.trim() || !form.price || !form.quantity) return;
    onSubmit(form);
    setForm(defaultForm);
    onClose();
  };

  const update = (field: keyof TradeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-lg rounded-lg border border-brodus-border bg-brodus-panel shadow-xl">
        <div className="flex items-center justify-between border-b border-brodus-border px-5 py-3">
          <h2 className="text-sm font-semibold">New Trade</h2>
          <button
            className="rounded p-1 text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
                Ticker
              </label>
              <input
                className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
                placeholder="AAPL"
                value={form.ticker}
                onChange={(e) => update("ticker", e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
                Date
              </label>
              <input
                className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text focus:border-brodus-accent"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
                Side
              </label>
              <select
                className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text"
                value={form.side}
                onChange={(e) => update("side", e.target.value)}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="short">Short</option>
                <option value="cover">Cover</option>
              </select>
            </div>
            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
                Price
              </label>
              <input
                className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>
            <div>
              <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
                Quantity
              </label>
              <input
                className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
                type="number"
                step="1"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              Thesis
            </label>
            <textarea
              className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
              rows={2}
              placeholder="Why are you making this trade?"
              value={form.thesis}
              onChange={(e) => update("thesis", e.target.value)}
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              Notes
            </label>
            <textarea
              className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
              rows={2}
              placeholder="Additional context..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              Status
            </label>
            <select
              className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="open">Open</option>
              <option value="partial">Partial</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-brodus-border px-5 py-3">
          <button
            className="rounded px-3 py-1.5 text-xs text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded border border-brodus-border bg-brodus-surface px-4 py-1.5 text-xs text-brodus-text transition-colors hover:bg-brodus-hover"
            onClick={handleSubmit}
            type="button"
          >
            Add Trade
          </button>
        </div>
      </div>
    </div>
  );
}

export type { TradeFormData };
