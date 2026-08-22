export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-sm bg-reel-800" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-md bg-reel-800" />
        ))}
      </div>
    </main>
  );
}
