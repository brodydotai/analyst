export type AssetReportResponse = {
  ticker: string;
  report: string;
  generated_at?: string;
};

export type DailyReportResponse = {
  report: string;
  generated_at?: string;
};
