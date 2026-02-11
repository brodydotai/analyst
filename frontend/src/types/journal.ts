export type {
  TradeEntry,
  TradeEntryCreate,
  JournalEntry,
  JournalEntryCreate,
} from "@/schemas/journal";

export type TradeSide = "buy" | "sell" | "short" | "cover";
export type TradeStatus = "open" | "closed" | "partial";
