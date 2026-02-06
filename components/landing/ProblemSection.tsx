export function ProblemSection() {
  return (
    <section className="py-[100px] px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-serif font-normal text-text-primary mb-12 text-center tracking-tight">
          Right before an important call, you're probably:
        </h2>

        {/* Pain Points */}
        <div className="space-y-4 mb-16">
          <div className="flex items-start gap-4 p-6 rounded-lg bg-bg border border-text-primary/10 hover:border-brand-blue/20 hover:shadow-soft transition-all">
            <span className="text-2xl">🔍</span>
            <p className="text-lg text-text-secondary">
              Googling the company last minute
            </p>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-lg bg-bg border border-text-primary/10 hover:border-brand-blue/20 hover:shadow-soft transition-all">
            <span className="text-2xl">💻</span>
            <p className="text-lg text-text-secondary">
              Skimming LinkedIn while joining Zoom
            </p>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-lg bg-bg border border-text-primary/10 hover:border-brand-blue/20 hover:shadow-soft transition-all">
            <span className="text-2xl">🤔</span>
            <p className="text-lg text-text-secondary">
              Trying to remember who's who and why this meeting exists
            </p>
          </div>
        </div>

        {/* Callout */}
        <div className="text-center mb-16">
          <p className="text-xl md:text-2xl text-text-secondary mb-2 font-serif">
            That's not preparation.
          </p>
          <p className="text-xl md:text-2xl font-bold text-text-primary mb-2 font-serif">
            That's winging it.
          </p>
          <p className="text-lg text-text-secondary">
            And clients notice.
          </p>
        </div>

        {/* Key Message */}
        <div className="bg-brand-blue-soft border-l-4 border-brand-blue p-6 rounded-r-lg">
          <p className="text-base md:text-lg text-text-secondary mb-4">
            Your calendar tells you <span className="font-semibold italic">when</span> the meeting is.
          </p>
          <p className="text-base md:text-lg text-text-secondary">
            It doesn't help you understand what actually matters for the conversation.
          </p>
        </div>

        <p className="text-center text-lg text-brand-blue font-medium mt-12 italic font-serif">
          Sophie fills that gap — automatically.
        </p>
      </div>
    </section>
  );
}
