export default function SettingsLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-9 w-32 bg-text/10 rounded mb-2" />
      <div className="h-5 w-72 bg-text/5 rounded mb-8" />

      {/* Tabs skeleton */}
      <div className="flex gap-4 border-b border-text/10 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-24 bg-text/5 rounded mb-3" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-6">
        <div className="bg-surface rounded-lg border border-text/10 p-6">
          <div className="h-5 w-36 bg-text/10 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-64 bg-text/5 rounded" />
            <div className="h-4 w-48 bg-text/5 rounded" />
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-text/10 p-6">
          <div className="h-5 w-44 bg-text/10 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-56 bg-text/5 rounded" />
            <div className="h-10 w-36 bg-text/5 rounded mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
