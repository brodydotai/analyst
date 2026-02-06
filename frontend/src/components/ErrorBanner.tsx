type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {onRetry ? (
          <button
            className="rounded-md border border-red-400/60 px-3 py-1 text-xs uppercase tracking-wide text-red-200 hover:bg-red-500/20"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
