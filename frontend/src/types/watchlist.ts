export type WatchlistLinks = {
  tradingview?: string;
  edgar?: string;
};

export type WatchlistMetrics = {
  price?: number;
  pe_ratio?: number;
  ev_ebitda?: number;
  ps?: number;
  pb?: number;
  change_1d?: number;
  change_1w?: number;
  change_1m?: number;
  change_3m?: number;
  change_ytd?: number;
  change_1y?: number;
  market_cap?: number;
  high_52w?: number;
  low_52w?: number;
};

export type WatchlistItem = {
  id: string;
  ticker: string;
  name: string;
  category_id: string | null;
  sort_order: number;
  metadata: Record<string, string | number | boolean | null> | null;
  created_at?: string;
  updated_at?: string;
  metrics?: WatchlistMetrics;
  links?: WatchlistLinks;
};

export type WatchlistCategory = {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type WatchlistCategoryWithItems = WatchlistCategory & {
  items: WatchlistItem[];
};

export type WatchlistResponse = {
  categories?: WatchlistCategoryWithItems[];
  items?: WatchlistItem[];
};
