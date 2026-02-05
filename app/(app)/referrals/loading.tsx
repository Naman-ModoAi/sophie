export default function ReferralsLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-9 w-32 bg-text/10 rounded mb-2" />
      <div className="h-5 w-64 bg-text/5 rounded mb-8" />

      <div className="bg-surface rounded-lg border border-text/10 p-6">
        <div className="space-y-4">
          <div className="h-5 w-48 bg-text/10 rounded" />
          <div className="h-4 w-72 bg-text/5 rounded" />
          <div className="h-10 w-full bg-text/5 rounded" />
          <div className="h-10 w-32 bg-text/5 rounded" />
        </div>
      </div>
    </div>
  );
}
