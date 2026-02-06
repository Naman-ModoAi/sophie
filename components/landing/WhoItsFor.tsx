export function WhoItsFor() {
  return (
    <section className="py-[100px] px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-label text-text-secondary mb-8">
            Who it's for
          </p>

          <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
            <div className="flex items-start gap-3 text-left bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-white/60">
              <span className="text-2xl">🎯</span>
              <span className="text-sm text-text-secondary">
                Sales reps & founders running deals
              </span>
            </div>
            <div className="flex items-start gap-3 text-left bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-white/60">
              <span className="text-2xl">💼</span>
              <span className="text-sm text-text-secondary">
                Consultants & partners leading client conversations
              </span>
            </div>
            <div className="flex items-start gap-3 text-left bg-surface/50 backdrop-blur-sm p-4 rounded-lg border border-white/60">
              <span className="text-2xl">⚖️</span>
              <span className="text-sm text-text-secondary">
                Advisors, lawyers & recruiters in high-stakes meetings
              </span>
            </div>
          </div>

          <p className="text-sm text-text-secondary mt-8 italic font-serif">
            If your work depends on conversations, Sophie is for you.
          </p>
        </div>
      </div>
    </section>
  );
}
