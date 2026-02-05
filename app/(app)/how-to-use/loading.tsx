export default function HowToUseLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
      <div className="mb-12">
        <div className="h-10 w-72 bg-text/10 rounded mb-4" />
        <div className="h-5 w-96 bg-text/5 rounded" />
      </div>

      <div className="space-y-16">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-8 w-64 bg-text/10 rounded mb-4" />
            <div className="h-4 w-full bg-text/5 rounded mb-2" />
            <div className="h-4 w-3/4 bg-text/5 rounded mb-6" />
            <div className="h-48 w-full bg-text/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
