import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-lg border border-brodus-danger/40 bg-brodus-danger/10 px-4 py-2.5 text-sm text-red-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="flex-shrink-0 text-brodus-danger" />
          <span>{message}</span>
        </div>
        {onRetry ? (
          <button
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
