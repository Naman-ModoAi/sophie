export function SecurityTrust() {
  const trustIndicators = [
    'Read-only calendar access',
    'No emails sent on your behalf',
    'Data used only to prepare your meetings',
  ];

  return (
    <section className="py-[100px] px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
            You stay in control.
          </h2>
        </div>

        {/* Trust Indicators */}
        <div className="grid gap-6 md:grid-cols-3">
          {trustIndicators.map((indicator, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-background-secondary rounded-lg border border-text-primary/10 hover:translate-y-[-4px] hover:shadow-soft transition-all duration-300"
            >
              {/* Checkmark Icon */}
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-brand-blue"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Text */}
              <p className="text-text-primary/80 font-sans font-medium">
                {indicator}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
