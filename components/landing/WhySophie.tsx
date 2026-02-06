export function WhySophie() {
  const benefits = [
    {
      title: 'No manual prep.',
      description: 'Your briefs are ready before you are.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'No scattered notes or tabs.',
      description: 'Everything in one clean view.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'No awkward moments.',
      description: 'Never ask "So… tell me about your company?"',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-[100px] px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
            Stop winging it.
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-blue">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-sans font-semibold text-text-primary mb-3">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-text-secondary leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <p className="text-center text-xl text-text-secondary font-serif italic">
          Just calmer, sharper conversations.
        </p>
      </div>
    </section>
  );
}
