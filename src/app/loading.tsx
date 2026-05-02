export default function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="text-4xl animate-pulse">📝</div>
        <div className="space-y-2">
          <div className="h-3 w-48 bg-zinc-800 rounded animate-pulse mx-auto" />
          <div className="h-2 w-32 bg-zinc-800/60 rounded animate-pulse mx-auto" />
        </div>
        <div className="text-zinc-500 text-xs">Memuat Authoring Tool...</div>
      </div>
    </div>
  );
}
