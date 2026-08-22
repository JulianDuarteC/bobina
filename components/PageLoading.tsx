export function PageLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-sm bg-reel-800" />
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-sm bg-reel-800"
          />
        ))}
      </div>
    </main>
  );
}
