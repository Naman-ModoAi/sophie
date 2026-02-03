export function ProblemSection() {
  return (
    <section className="py-16 md:py-24 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-8 text-center">
          Right before an important call, you're probably:
        </h2>

        {/* Pain Points */}
        <div className="space-y-4 mb-12">
          <div className="flex items-start gap-4 p-6 rounded-lg bg-background border border-text/10">
            <span className="text-2xl">🔍</span>
            <p className="text-lg text-text/80">
              Googling the company last minute
            </p>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-lg bg-background border border-text/10">
            <span className="text-2xl">💻</span>
            <p className="text-lg text-text/80">
              Skimming LinkedIn while joining Zoom
            </p>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-lg bg-background border border-text/10">
            <span className="text-2xl">🤔</span>
            <p className="text-lg text-text/80">
              Trying to remember who's who and why this meeting exists
            </p>
          </div>
        </div>

        {/* Callout */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-2xl text-text/90 mb-2">
            That's not preparation.
          </p>
          <p className="text-xl md:text-2xl font-bold text-text mb-2">
            That's winging it.
          </p>
          <p className="text-lg text-text/70">
            And clients notice.
          </p>
        </div>

        {/* Key Message */}
        <div className="bg-accent/5 border-l-4 border-accent p-6 rounded-r-lg">
          <p className="text-base md:text-lg text-text/80 mb-4">
            Your calendar tells you <span className="font-semibold italic">when</span> the meeting is.
          </p>
          <p className="text-base md:text-lg text-text/80">
            It doesn't help you understand what actually matters for the conversation.
          </p>
        </div>

        <p className="text-center text-lg text-accent font-medium mt-8 italic">
          MeetReady fills that gap — automatically.
        </p>
      </div>
    </section>
  );
}
