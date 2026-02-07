import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Sophi',
  description: 'Privacy Policy for Sophi - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-text/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-xl font-bold text-text hover:text-accent transition-colors">
            Sophi
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-text mb-4">Privacy Policy</h1>
        <p className="text-text/60 mb-8">Last Updated: February 4, 2026</p>

        <div className="prose prose-slate max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">1. Introduction</h2>
            <p className="text-text/80 mb-4">
              At Sophi, we respect your privacy and are committed to protecting the personal information that you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our meeting preparation service.
            </p>
            <p className="text-text/80">
              By accessing or using Sophi, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-text mb-3">2.1 Information You Provide</h3>
            <p className="text-text/80 mb-4">When you use Sophi, we collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Account information (name, email address, profile photo) through Google OAuth authentication</li>
              <li>Google Calendar data including meeting details, attendee information, and scheduling data</li>
              <li>Payment information processed through Stripe (we do not store your credit card details)</li>
              <li>Communication records when you contact us via email or other channels</li>
              <li>Feedback, preferences, and settings you configure within the service</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">2.2 Information Collected Automatically</h3>
            <p className="text-text/80 mb-4">When you access and use Sophi, we automatically collect certain information, including:</p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Usage data: pages visited, features used, time spent on the platform, and interaction patterns</li>
              <li>Device information: IP address, browser type and version, operating system, device identifiers</li>
              <li>Log data: access times, error logs, and performance metrics</li>
              <li>Cookies and similar tracking technologies for authentication, preferences, and analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">2.3 Information from Third Parties</h3>
            <p className="text-text/80 mb-4">We collect information from third-party sources to provide our meeting preparation services:</p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Google Calendar API: meeting schedules, attendee lists, and event details</li>
              <li>Publicly available information about meeting attendees and their companies through AI-powered research</li>
              <li>Professional networking platforms and business databases (LinkedIn, company websites, news sources)</li>
              <li>Payment processing information from Stripe</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">3. How We Use Your Information</h2>
            <p className="text-text/80 mb-4">We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Service Delivery:</strong> To provide, operate, and maintain Sophi's meeting preparation features</li>
              <li><strong>AI Research:</strong> To research meeting attendees and companies and generate personalized meeting briefs</li>
              <li><strong>Email Delivery:</strong> To send you automated meeting preparation notes before your scheduled calls</li>
              <li><strong>Account Management:</strong> To manage your account, subscription, and credit balance</li>
              <li><strong>Payment Processing:</strong> To process payments, manage subscriptions, and handle billing through Stripe</li>
              <li><strong>Communication:</strong> To send you service-related notifications, updates, and respond to your inquiries</li>
              <li><strong>Personalization:</strong> To customize your experience and improve service relevance</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve our service</li>
              <li><strong>Security:</strong> To protect against fraud, unauthorized access, and ensure platform security</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
              <li><strong>Product Development:</strong> To develop new features and improve existing functionality</li>
            </ul>
          </section>

          {/* How We Share Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">4. How We Share Your Information</h2>
            <p className="text-text/80 mb-4">We may share your information in the following circumstances:</p>

            <h3 className="text-xl font-semibold text-text mb-3">4.1 Service Providers</h3>
            <p className="text-text/80 mb-4">We share information with third-party service providers who perform services on our behalf:</p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Google:</strong> For authentication and calendar access (Google OAuth, Google Calendar API)</li>
              <li><strong>Supabase:</strong> For database hosting and authentication services</li>
              <li><strong>Google AI (Gemini):</strong> For AI-powered research and content generation</li>
              <li><strong>Stripe:</strong> For payment processing and subscription management</li>
              <li><strong>Email Service Providers:</strong> For delivering meeting preparation notes</li>
              <li><strong>Hosting and Infrastructure Providers:</strong> For cloud hosting and content delivery</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">4.2 Business Transfers</h3>
            <p className="text-text/80 mb-4">
              If Sophi is involved in a merger, acquisition, asset sale, or bankruptcy, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your personal information.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">4.3 Legal Requirements</h3>
            <p className="text-text/80 mb-4">We may disclose your information if required to do so by law or in response to valid requests by public authorities, including to:</p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Comply with legal processes, court orders, or government requests</li>
              <li>Enforce our Terms of Service and other agreements</li>
              <li>Protect the rights, property, or safety of Sophi, our users, or others</li>
              <li>Investigate and prevent fraud, security issues, or technical problems</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">4.4 With Your Consent</h3>
            <p className="text-text/80 mb-4">
              We may share your information for any other purpose with your explicit consent.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">5. Data Security</h2>
            <p className="text-text/80 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Encryption of data in transit using SSL/TLS protocols</li>
              <li>Encryption of sensitive data at rest in our databases</li>
              <li>Row Level Security (RLS) policies to ensure users can only access their own data</li>
              <li>Secure OAuth 2.0 authentication flows through Google and Supabase</li>
              <li>Regular security assessments and monitoring</li>
              <li>Access controls and authentication requirements for system access</li>
            </ul>
            <p className="text-text/80 mb-4">
              However, please note that no method of electronic transmission or storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">6. Data Retention</h2>
            <p className="text-text/80 mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Specifically:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after account closure</li>
              <li><strong>Meeting Data:</strong> Retained for the duration of your subscription and for a limited period afterward</li>
              <li><strong>Transaction Records:</strong> Retained for tax and accounting purposes as required by law</li>
              <li><strong>Usage Logs:</strong> Typically retained for up to 90 days for security and debugging purposes</li>
            </ul>
            <p className="text-text/80 mb-4">
              When we no longer need your information, we will securely delete or anonymize it in accordance with our data retention policies.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">7. Your Rights and Choices</h2>
            <p className="text-text/80 mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
              <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where we rely on consent</li>
            </ul>
            <p className="text-text/80 mb-4">
              To exercise any of these rights, please contact us at the information provided in Section 12. We will respond to your request within one month of receipt, though this period may be extended by two additional months where necessary.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">7.1 Google Calendar Access</h3>
            <p className="text-text/80 mb-4">
              You can revoke Sophi's access to your Google Calendar at any time through your Google Account settings at <a href="https://myaccount.google.com/permissions" className="text-accent hover:underline">myaccount.google.com/permissions</a>. Note that revoking access will prevent Sophi from syncing your calendar and providing meeting preparation services.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">7.2 Email Preferences</h3>
            <p className="text-text/80 mb-4">
              You can manage your email notification preferences in your account settings, including adjusting the timing of when you receive meeting preparation notes.
            </p>
          </section>

          {/* Cookies and Tracking Technologies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-text/80 mb-4">
              Sophi uses cookies and similar tracking technologies to enhance your experience, maintain your session, and analyze usage patterns. The types of cookies we use include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication, security, and basic functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how users interact with our service</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            </ul>
            <p className="text-text/80 mb-4">
              You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of Sophi.
            </p>
          </section>

          {/* Third-Party Links and Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">9. Third-Party Links and Services</h2>
            <p className="text-text/80 mb-4">
              Our service may contain links to third-party websites, services, or applications that are not owned or controlled by Sophi. This Privacy Policy does not apply to these third-party services. We encourage you to review the privacy policies of any third-party services before providing them with your personal information.
            </p>
            <p className="text-text/80 mb-4">
              In particular, we integrate with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Google:</strong> Subject to Google's Privacy Policy and Terms of Service</li>
              <li><strong>Stripe:</strong> Subject to Stripe's Privacy Policy and Terms of Service</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">10. Children's Privacy</h2>
            <p className="text-text/80 mb-4">
              Sophi is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us immediately. If we discover that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">11. International Data Transfers</h2>
            <p className="text-text/80 mb-4">
              Sophi is based in the United States, and your information may be transferred to, stored, and processed in the United States and other countries where our service providers operate. These countries may have data protection laws that differ from those in your country of residence.
            </p>
            <p className="text-text/80 mb-4">
              By using Sophi, you consent to the transfer of your information to the United States and other countries. We implement appropriate safeguards to protect your personal information in accordance with this Privacy Policy, regardless of where it is processed.
            </p>
          </section>

          {/* Changes to This Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-text/80 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the "Last Updated" date at the top of this policy.
            </p>
            <p className="text-text/80 mb-4">
              If we make material changes to this Privacy Policy, we will notify you by email or through a prominent notice on our service prior to the changes taking effect. We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and protect your information.
            </p>
            <p className="text-text/80 mb-4">
              Your continued use of Sophi after any changes to this Privacy Policy constitutes your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">13. Contact Us</h2>
            <p className="text-text/80 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-surface p-6 rounded-lg border border-text/10 mb-4">
              <p className="text-text/80 mb-2"><strong>Email:</strong> privacy@sophihq.com</p>
              <p className="text-text/80"><strong>Website:</strong> <a href="https://sophihq.com" className="text-accent hover:underline">sophihq.com</a></p>
            </div>
            <p className="text-text/80">
              We will make every effort to respond to your inquiry within one month of receipt.
            </p>
          </section>

          {/* Additional Information for Specific Regions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">14. Additional Information for Specific Regions</h2>

            <h3 className="text-xl font-semibold text-text mb-3">14.1 California Residents (CCPA)</h3>
            <p className="text-text/80 mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information held by us</li>
              <li>Right to opt-out of the sale of personal information (note: we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising your CCPA rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">14.2 European Union Residents (GDPR)</h3>
            <p className="text-text/80 mb-4">
              If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Right to access, correct, or delete your personal data</li>
              <li>Right to restrict or object to processing</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent at any time</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-text/80 mb-4">
              Our legal bases for processing your personal information include: (a) your consent, (b) performance of a contract, (c) compliance with legal obligations, and (d) our legitimate business interests.
            </p>
          </section>
        </div>

        {/* Back to Home Link */}
        <div className="mt-12 pt-8 border-t border-text/10">
          <Link href="/" className="text-accent hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-surface border-t border-text/10 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-sm text-text/60 text-center">
            © {new Date().getFullYear()} Sophi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
