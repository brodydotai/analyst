"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something broke.</h1>
      <p className="text-sm text-brodus-muted">
        An unexpected error occurred. You can try again.
      </p>
      <button
        className="rounded-md border border-brodus-border px-4 py-2 text-sm hover:bg-brodus-panel"
        onClick={() => reset()}
        type="button"
      >
        Retry
      </button>
    </div>
  );
}
