export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-56 bg-text/10 rounded" />
        <div className="h-4 w-72 bg-text/5 rounded mt-2" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-lg border border-text/10 p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-text/10 rounded" />
                <div className="h-4 w-32 bg-text/5 rounded" />
              </div>
              <div className="h-6 w-16 bg-text/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
