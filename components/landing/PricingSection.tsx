import Link from 'next/link';

export function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: 0,
      features: [
        '20 credits every month',
        'Core meeting briefs',
        'Standard models',
        'Community support',
      ],
      cta: {
        text: 'Get Started Free',
        href: '/api/auth/login',
      },
      isPopular: false,
    },
    {
      name: 'Pro',
      price: 25,
      annualPrice: 20,
      features: [
        '200 credits every month',
        'Advanced models for deeper insights',
        'Priority support',
        'Priority access to new features',
      ],
      cta: {
        text: 'Upgrade to Pro',
        href: '/api/auth/login',
      },
      isPopular: true,
      badge: 'Most Popular',
    },
  ];

  return (
    <section id="pricing" className="py-[100px] px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
            Start free. Upgrade when it sticks.
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-surface border rounded-xl p-8 hover:translate-y-[-4px] transition-all duration-300 ${
                plan.isPopular
                  ? 'border-brand-blue shadow-cta scale-105'
                  : 'border-text-primary/10 hover:shadow-soft'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-accent text-white px-4 py-1 rounded-full text-sm font-sans font-semibold shadow-soft">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-serif font-bold text-text-primary mb-2">
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-text-secondary text-sm mb-6">
                {plan.name === 'Free'
                  ? 'Perfect to try MeetReady and build the habit.'
                  : 'For people who live in meetings.'}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-bold text-text-primary">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-text-secondary">/ month</span>
                  )}
                </div>
                {plan.annualPrice && (
                  <p className="text-sm text-text-secondary mt-1">
                    ${plan.annualPrice}/mo billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href={plan.cta.href}
                className={`block w-full text-center py-3 rounded-lg font-sans font-semibold transition-all duration-300 ${
                  plan.isPopular
                    ? 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-cta hover:shadow-cta-hover'
                    : 'bg-text-primary/5 text-text-primary border border-text-primary/20 hover:bg-text-primary/10 hover:shadow-soft'
                }`}
              >
                {plan.cta.text}
              </a>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <p className="text-center text-text-secondary font-serif italic">
          Most users upgrade after their first week.
        </p>
      </div>
    </section>
  );
}
