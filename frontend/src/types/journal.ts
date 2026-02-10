export type TradeSide = "buy" | "sell" | "short" | "cover";

export type TradeStatus = "open" | "closed" | "partial";

export type TradeEntry = {
  id: string;
  ticker: string;
  side: TradeSide;
  date: string;
  price: number;
  quantity: number;
  thesis: string;
  status: TradeStatus;
  exit_price?: number;
  exit_date?: string;
  pnl?: number;
  pnl_percent?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  title: string;
  content: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};
