export default function Loading() {
  return (
    <main className="animate-pulse">
      <div className="h-[45vh] min-h-[320px] w-full bg-reel-900" />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4 h-6 w-64 rounded-sm bg-reel-800" />
        <div className="mb-2 h-4 w-full rounded-sm bg-reel-800" />
        <div className="h-4 w-3/4 rounded-sm bg-reel-800" />
      </div>
    </main>
  );
}
