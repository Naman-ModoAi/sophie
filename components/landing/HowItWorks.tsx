export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Connect your calendar',
      description: 'Securely connect your Google Calendar in seconds.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: 2,
      title: 'MeetReady does the homework',
      description: 'We pull together context on the company, attendees, and situation around each meeting.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      number: 3,
      title: 'You show up ready',
      description: 'A short, skimmable brief — before every call.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Simple. Automatic. Ready.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Step Card */}
              <div className="bg-surface border border-text/10 rounded-xl p-8 h-full hover:border-accent/30 transition-colors">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent text-surface rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-6 mt-4 text-accent">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-text mb-3">
                  {step.title}
                </h3>
                <p className="text-text/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <p className="text-center text-text/60 mt-12 italic">
          No prep. No tabs. No scrambling.
        </p>
      </div>
    </section>
  );
}
