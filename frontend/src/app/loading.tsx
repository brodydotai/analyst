export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="h-8 w-64 animate-pulse rounded bg-brodus-panel" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="h-12 w-full animate-pulse rounded bg-brodus-panel"
            key={`row-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
