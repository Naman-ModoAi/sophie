export function Testimonials() {
  const testimonials = [
    {
      quote: "Saved me 20–30 minutes before every call. I used to have 6 tabs open — now I just check my brief.",
      initials: "JR",
      name: "Jake R.",
      role: "Account Executive",
    },
    {
      quote: "Clients keep saying 'you really did your homework.' I didn't — Sophie did.",
      initials: "SP",
      name: "Sarah P.",
      role: "Management Consultant",
    },
    {
      quote: "Game changer for back-to-back days. I walk into every meeting knowing exactly what to focus on.",
      initials: "MK",
      name: "Michael K.",
      role: "Founder & CEO",
    },
  ];

  return (
    <section className="py-[100px] px-6">
      <div className="max-w-6xl mx-auto">
        {/* Context Line */}
        <p className="text-center text-text-secondary mb-12 max-w-3xl mx-auto">
          Used by sales reps, consultants, and advisors who spend their day in back-to-back meetings. Early access users onboarding now.
        </p>

        {/* Testimonial Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-surface border border-text-primary/10 rounded-xl p-8 hover:translate-y-[-4px] hover:shadow-soft transition-all duration-300"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-brand-blue/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-text-primary/80 leading-relaxed font-serif italic">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Initials Avatar */}
                <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                  <span className="text-brand-blue font-sans font-semibold text-sm">
                    {testimonial.initials}
                  </span>
                </div>

                {/* Name and Role */}
                <div>
                  <div className="font-sans font-semibold text-text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
