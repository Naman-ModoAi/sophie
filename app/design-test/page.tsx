// Temporary page to verify new design system tokens
// DELETE THIS FILE after design verification

export default function DesignTestPage() {
  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl font-serif font-bold text-text-primary">
          Design System Verification
        </h1>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Brand Colors</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-brand-blue rounded-md"></div>
              <p className="text-sm text-text-secondary">brand-blue</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-brand-blue-light rounded-md"></div>
              <p className="text-sm text-text-secondary">blue-light</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-brand-blue-soft rounded-md"></div>
              <p className="text-sm text-text-secondary">blue-soft</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-brand-indigo rounded-md"></div>
              <p className="text-sm text-text-secondary">indigo</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-brand-violet rounded-md"></div>
              <p className="text-sm text-text-secondary">violet</p>
            </div>
          </div>

          <h2 className="text-2xl font-serif text-text-primary mt-8">Semantic Colors</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-semantic-teal rounded-md"></div>
              <p className="text-sm text-text-secondary">teal</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-semantic-red rounded-md"></div>
              <p className="text-sm text-text-secondary">red</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-semantic-peach rounded-md"></div>
              <p className="text-sm text-text-secondary">peach</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-semantic-pink rounded-md"></div>
              <p className="text-sm text-text-secondary">pink</p>
            </div>
          </div>

          <h2 className="text-2xl font-serif text-text-primary mt-8">Background Colors</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-bg rounded-md border border-text-primary/10"></div>
              <p className="text-sm text-text-secondary">bg-default</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-bg-warm rounded-md"></div>
              <p className="text-sm text-text-secondary">bg-warm</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-bg-cool rounded-md"></div>
              <p className="text-sm text-text-secondary">bg-cool</p>
            </div>
          </div>

          <h2 className="text-2xl font-serif text-text-primary mt-8">Dark Colors</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-dark-base rounded-md"></div>
              <p className="text-sm text-text-secondary">dark-base</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-dark-mid rounded-md"></div>
              <p className="text-sm text-text-secondary">dark-mid</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-dark-cool rounded-md"></div>
              <p className="text-sm text-text-secondary">dark-cool</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-dark-warm rounded-md"></div>
              <p className="text-sm text-text-secondary">dark-warm</p>
            </div>
          </div>
        </section>

        {/* Gradients */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Gradients</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-32 bg-gradient-hero rounded-md"></div>
              <p className="text-sm text-text-secondary">gradient-hero</p>
            </div>
            <div className="space-y-2">
              <div className="h-32 bg-gradient-accent rounded-md"></div>
              <p className="text-sm text-text-secondary">gradient-accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-32 bg-gradient-dark rounded-md"></div>
              <p className="text-sm text-text-secondary">gradient-dark</p>
            </div>
            <div className="space-y-2">
              <div className="h-32 bg-gradient-cta rounded-md"></div>
              <p className="text-sm text-text-secondary">gradient-cta</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Typography</h2>
          <div className="space-y-4 bg-surface p-6 rounded-lg">
            <div>
              <h1 className="text-6xl font-serif font-normal text-text-primary tracking-tight">
                Hero Headline
              </h1>
              <p className="text-sm text-text-muted mt-2">6xl, font-serif, tracking-tight</p>
            </div>
            <div>
              <h2 className="text-4xl font-serif font-normal text-text-primary tracking-tight">
                Section Headline
              </h2>
              <p className="text-sm text-text-muted mt-2">4xl, font-serif, tracking-tight</p>
            </div>
            <div>
              <h3 className="text-xl font-serif font-normal text-text-primary">
                Card Headline
              </h3>
              <p className="text-sm text-text-muted mt-2">xl, font-serif</p>
            </div>
            <div>
              <p className="text-base font-sans text-text-primary">
                Body text using Sora sans-serif font family
              </p>
              <p className="text-sm text-text-muted mt-2">base, font-sans</p>
            </div>
            <div>
              <p className="text-sm font-sans text-text-secondary">
                Secondary text using Sora
              </p>
              <p className="text-sm text-text-muted mt-2">sm, text-text-secondary</p>
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-label text-text-secondary">
                Section Label
              </p>
              <p className="text-sm text-text-muted mt-2">xs, uppercase, tracking-label</p>
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Shadows</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-32 bg-surface rounded-lg shadow-soft flex items-center justify-center">
              <p className="text-sm text-text-secondary">shadow-soft</p>
            </div>
            <div className="h-32 bg-surface rounded-lg shadow-glass flex items-center justify-center">
              <p className="text-sm text-text-secondary">shadow-glass</p>
            </div>
            <div className="h-32 bg-surface rounded-lg shadow-cta flex items-center justify-center">
              <p className="text-sm text-text-secondary">shadow-cta</p>
            </div>
            <div className="h-32 bg-surface rounded-lg shadow-cta-hover flex items-center justify-center">
              <p className="text-sm text-text-secondary">shadow-cta-hover</p>
            </div>
          </div>
        </section>

        {/* Glassmorphism */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Glassmorphism</h2>
          <div className="bg-gradient-hero p-8 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-nav p-6 rounded-nav">
                <p className="text-sm text-text-primary font-medium">glass-nav</p>
                <p className="text-xs text-text-secondary mt-2">For navigation bars</p>
              </div>
              <div className="glass-card p-6 rounded-lg">
                <p className="text-sm text-text-primary font-medium">glass-card</p>
                <p className="text-xs text-text-secondary mt-2">For card surfaces</p>
              </div>
              <div className="glass-badge p-6 rounded-full">
                <p className="text-sm text-text-primary font-medium">glass-badge</p>
                <p className="text-xs text-text-secondary mt-2">For badges/pills</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Buttons</h2>
          <div className="flex gap-4">
            <button className="bg-gradient-accent text-white text-base font-semibold px-9 py-4 rounded-md shadow-cta hover:translate-y-[-2px] hover:shadow-cta-hover transition-all duration-300">
              Primary Button
            </button>
            <button className="bg-white/65 backdrop-blur-[12px] text-text-secondary text-sm px-6 py-3 rounded-md border border-white/60 hover:border-brand-blue/20 hover:text-brand-blue hover:bg-white/80 transition-all">
              Secondary Button
            </button>
          </div>
        </section>

        {/* Text Gradient */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Text Gradient</h2>
          <h1 className="text-6xl font-serif font-bold text-gradient">
            Gradient Text Effect
          </h1>
        </section>

        {/* Animations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-text-primary">Animations</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-brand-blue/20 rounded-lg flex items-center justify-center animate-float">
              <p className="text-sm text-text-primary font-medium">animate-float</p>
            </div>
            <div className="h-32 bg-semantic-teal/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-semantic-teal rounded-full animate-pulse-dot"></div>
            </div>
            <div className="h-32 bg-semantic-pink/20 rounded-lg flex items-center justify-center animate-fade-up">
              <p className="text-sm text-text-primary font-medium">animate-fade-up</p>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-text-primary/10">
          <p className="text-sm text-text-muted">
            ✅ Design system loaded successfully. Delete this page after verification.
          </p>
        </div>
      </div>
    </div>
  );
}
