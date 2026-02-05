export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Connect your calendar',
      description: 'Securely connect your Google Calendar in seconds.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: 2,
      title: 'MeetReady does the homework',
      description: 'We pull together context on the company, attendees, and situation around each meeting.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      number: 3,
      title: 'You show up ready',
      description: 'A short, skimmable brief — before every call.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-[100px] px-6 scroll-mt-20 bg-bg-warm">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-label text-text-secondary mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-serif font-normal text-text-primary tracking-tight">
            Simple. Automatic. Ready.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Step Card */}
              <div className="bg-surface border border-text-primary/10 rounded-lg p-8 h-full hover:translate-y-[-4px] hover:shadow-soft transition-all duration-300">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-accent text-white rounded-full flex items-center justify-center text-xl font-bold shadow-cta">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-brand-blue/10 to-brand-violet/5 rounded-lg flex items-center justify-center mb-6 mt-4 text-brand-blue">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-serif font-normal text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <p className="text-center text-text-secondary mt-16 italic font-serif text-lg">
          No prep. No tabs. No scrambling.
        </p>
      </div>
    </section>
  );
}
