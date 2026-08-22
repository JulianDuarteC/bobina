export default function Loading() {
  return (
    <main className="animate-pulse">
      <div className="h-40 w-full bg-reel-800 sm:h-56" />
      <div className="mx-auto max-w-4xl px-6">
        <div className="-mt-12 h-24 w-24 rounded-full border-4 border-reel-950 bg-reel-700 sm:h-32 sm:w-32" />
        <div className="mt-4 h-6 w-40 rounded-sm bg-reel-800" />
      </div>
    </main>
  );
}
