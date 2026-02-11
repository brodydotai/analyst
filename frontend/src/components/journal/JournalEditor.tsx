"use client";

import { useState } from "react";
import { X } from "lucide-react";

type JournalFormData = {
  title: string;
  content: string;
  tags: string;
};

type JournalEditorProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JournalFormData) => void;
};

const defaultForm: JournalFormData = {
  title: "",
  content: "",
  tags: "",
};

export default function JournalEditor({
  open,
  onClose,
  onSubmit,
}: JournalEditorProps) {
  const [form, setForm] = useState<JournalFormData>(defaultForm);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    onSubmit(form);
    setForm(defaultForm);
    onClose();
  };

  const update = (field: keyof JournalFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-2xl rounded-lg border border-brodus-border bg-brodus-panel shadow-xl">
        <div className="flex items-center justify-between border-b border-brodus-border px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brodus-muted">
            New Journal Entry
          </h2>
          <button
            className="rounded p-1 text-brodus-muted transition-colors hover:bg-brodus-hover hover:text-brodus-text"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              Title
            </label>
            <input
              className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
              placeholder="Market observations for today..."
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              Content (markdown)
            </label>
            <textarea
              className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-2 font-mono text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
              rows={10}
              placeholder="Write your thoughts... Markdown is supported."
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-brodus-muted">
              Tags (comma-separated)
            </label>
            <input
              className="mt-1 w-full rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent"
              placeholder="macro, tech, earnings"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
            />
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
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export type { JournalFormData };
