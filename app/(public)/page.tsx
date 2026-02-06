import { Metadata } from 'next'
import { Navigation } from '@/components/landing/Navigation'
import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { WhatYouGet } from '@/components/landing/WhatYouGet'
import { WhoItsFor } from '@/components/landing/WhoItsFor'
import { WhySophie } from '@/components/landing/WhySophie'
import { PricingSection } from '@/components/landing/PricingSection'
import { SecurityTrust } from '@/components/landing/SecurityTrust'
import { ContactForm } from '@/components/landing/ContactForm'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Sophie - Never walk into a call cold',
  description: 'Instant meeting briefs from your calendar. AI-powered research on attendees and companies delivered before every call. Be call ready, before every call.',
  openGraph: {
    title: 'Sophie - Never walk into a call cold',
    description: 'Instant meeting briefs from your calendar. AI-powered research on attendees and companies delivered before every call.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <ProblemSection />
        <HowItWorks />
        <WhatYouGet />
        <WhoItsFor />
        <WhySophie />
        <PricingSection />
        <SecurityTrust />
        <ContactForm />
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
