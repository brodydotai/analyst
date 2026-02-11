import { z } from "zod";

export const tradeSideSchema = z.enum(["buy", "sell", "short", "cover"]);
export const tradeStatusSchema = z.enum(["open", "closed", "partial"]);

export const tradeEntryCreateSchema = z.object({
  ticker: z.string().min(1),
  side: tradeSideSchema,
  trade_date: z.string(),
  price: z.number(),
  quantity: z.number(),
  thesis: z.string().default(""),
  status: tradeStatusSchema.default("open"),
  exit_price: z.number().nullable().default(null),
  exit_date: z.string().nullable().default(null),
  pnl: z.number().nullable().default(null),
  pnl_percent: z.number().nullable().default(null),
  notes: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
});

export const tradeEntrySchema = tradeEntryCreateSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const journalEntryCreateSchema = z.object({
  entry_date: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export const journalEntrySchema = journalEntryCreateSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TradeEntryCreate = z.infer<typeof tradeEntryCreateSchema>;
export type TradeEntry = z.infer<typeof tradeEntrySchema>;
export type JournalEntryCreate = z.infer<typeof journalEntryCreateSchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
