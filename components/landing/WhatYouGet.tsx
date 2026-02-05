export function WhatYouGet() {
  const benefits = [
    {
      title: 'Know the company',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      features: [
        'What they do',
        "What's happening now",
        'Why this meeting matters',
      ],
    },
    {
      title: 'Know the people',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      features: [
        "Who's in the room",
        'Their roles and relevance',
        "Who's driving the conversation",
      ],
    },
    {
      title: 'Know how to lead the call',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      features: [
        'Talking points that move things forward',
        'Smart questions that show preparation',
        'Sales or relationship cues',
      ],
    },
  ];

  return (
    <section className="py-[100px] px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
            Every meeting gets a clear prep brief.
          </h2>
        </div>

        {/* Benefit Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-background-secondary border border-text-primary/10 rounded-xl p-8 hover:translate-y-[-4px] hover:shadow-soft transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-6 text-brand-blue">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-sans font-semibold text-text-primary mb-4">
                {benefit.title}
              </h3>

              {/* Features List */}
              <ul className="space-y-3">
                {benefit.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-text-secondary text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <p className="text-center text-lg text-text-secondary font-serif italic">
          Not long documents. Not fluff. Just signal.
        </p>
      </div>
    </section>
  );
}
