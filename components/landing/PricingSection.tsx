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
    <section id="pricing" className="py-16 md:py-24 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Start free. Upgrade when it sticks.
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-surface border rounded-xl p-8 ${
                plan.isPopular
                  ? 'border-accent shadow-lg scale-105'
                  : 'border-text/10'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-surface px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-text mb-2">
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-text/60 text-sm mb-6">
                {plan.name === 'Free'
                  ? 'Perfect to try MeetReady and build the habit.'
                  : 'For people who live in meetings.'}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-text">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-text/60">/ month</span>
                  )}
                </div>
                {plan.annualPrice && (
                  <p className="text-sm text-text/60 mt-1">
                    ${plan.annualPrice}/mo billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-text/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={plan.cta.href}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                  plan.isPopular
                    ? 'bg-accent text-surface hover:bg-accent/90'
                    : 'bg-text/5 text-text border border-text/20 hover:bg-text/10'
                }`}
              >
                {plan.cta.text}
              </Link>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <p className="text-center text-text/60 italic">
          Most users upgrade after their first week.
        </p>
      </div>
    </section>
  );
}
