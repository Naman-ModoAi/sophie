import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Sophie',
  description: 'Terms of Service for Sophie - Review the terms and conditions governing your use of our meeting preparation service.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-text/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-xl font-bold text-text hover:text-accent transition-colors">
            Sophie
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-text mb-4">Terms of Service</h1>
        <p className="text-text/60 mb-8">Last Updated: February 4, 2026</p>

        <div className="prose prose-slate max-w-none">
          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">1. Acceptance of Terms</h2>
            <p className="text-text/80 mb-4">
              Welcome to Sophie. By accessing or using our service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use Sophie.
            </p>
            <p className="text-text/80 mb-4">
              These Terms constitute a legally binding agreement between you and Sophie. Your use of the service, including any features, content, or functionality, signifies your acceptance of these Terms and our Privacy Policy, which is incorporated herein by reference.
            </p>
            <p className="text-text/80">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of Sophie after changes are posted constitutes your acceptance of the modified Terms.
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">2. Service Description</h2>
            <p className="text-text/80 mb-4">
              Sophie is a meeting preparation service that integrates with Google Calendar to automatically research meeting attendees and generate personalized preparation notes. Our service includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Automatic synchronization with your Google Calendar</li>
              <li>AI-powered research on external meeting attendees and their companies</li>
              <li>Generation of personalized meeting preparation notes</li>
              <li>Automated email delivery of prep notes before scheduled meetings</li>
              <li>Credit-based usage system for managing research capacity</li>
              <li>Subscription management and billing through Stripe</li>
            </ul>
            <p className="text-text/80 mb-4">
              Sophie uses artificial intelligence (Google Gemini AI) to research publicly available information and generate meeting briefs. The quality and accuracy of research may vary based on the availability of public information about meeting attendees.
            </p>
            <p className="text-text/80">
              We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice, for any reason.
            </p>
          </section>

          {/* User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-semibold text-text mb-3">3.1 Account Creation</h3>
            <p className="text-text/80 mb-4">
              To use Sophie, you must create an account by authenticating with your Google account using Google OAuth. By creating an account, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>You are at least 18 years of age</li>
              <li>All information you provide is accurate, current, and complete</li>
              <li>You have the authority to grant us access to your Google Calendar</li>
              <li>You will maintain the security of your account credentials</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">3.2 Account Security</h3>
            <p className="text-text/80 mb-4">
              You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Immediately notify us of any unauthorized use of your account</li>
              <li>Not share your account credentials with any third party</li>
              <li>Ensure that your Google account remains secure</li>
              <li>Accept responsibility for all activities conducted through your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">3.3 Account Termination</h3>
            <p className="text-text/80 mb-4">
              We reserve the right to suspend or terminate your account at any time, with or without cause or notice, if we believe you have violated these Terms or engaged in conduct that we deem inappropriate or harmful to the service or other users.
            </p>
          </section>

          {/* Credits & Payment */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">4. Credits and Payment</h2>

            <h3 className="text-xl font-semibold text-text mb-3">4.1 Credit System</h3>
            <p className="text-text/80 mb-4">
              Sophie operates on a credit-based system where 1 credit equals $0.01 USD. Credits are consumed when researching meeting attendees, with costs based on actual API usage including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>AI model token usage (input, output, cached, and thinking tokens)</li>
              <li>Search query costs (Gemini 3.x) or grounding costs (Gemini 2.x)</li>
              <li>Typical cost per person researched: approximately 1-2 credits</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">4.2 Subscription Plans</h3>
            <p className="text-text/80 mb-4">
              Sophie offers two subscription tiers:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Free Plan:</strong> 10 credits per month with no credit rollover. Sufficient for approximately 5-10 meeting attendees researched per month.</li>
              <li><strong>Pro Plan:</strong> 1,000 credits per month with credit rollover enabled. Sufficient for approximately 500-1,000 meeting attendees researched per month. Billed monthly via Stripe.</li>
            </ul>
            <p className="text-text/80 mb-4">
              We reserve the right to modify pricing, credit allocations, and plan features at any time. Changes will be communicated via email and will take effect at the start of your next billing period.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">4.3 Payment Terms</h3>
            <p className="text-text/80 mb-4">
              All payments are processed securely through Stripe. By subscribing to a paid plan, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Provide accurate and complete payment information</li>
              <li>Authorize us to charge your payment method on a recurring basis</li>
              <li>Update your payment information if it changes</li>
              <li>Pay all applicable fees and taxes</li>
            </ul>
            <p className="text-text/80 mb-4">
              <strong>No Refunds:</strong> All payments are non-refundable. If you cancel your subscription, you will retain access to paid features until the end of your current billing period, but no refund will be issued for unused time or credits.
            </p>
          </section>

          {/* Subscription Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">5. Subscription Terms</h2>

            <h3 className="text-xl font-semibold text-text mb-3">5.1 Auto-Renewal</h3>
            <p className="text-text/80 mb-4">
              Paid subscriptions automatically renew at the end of each billing period unless you cancel before the renewal date. You will be charged the then-current subscription fee for your plan.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">5.2 Cancellation</h3>
            <p className="text-text/80 mb-4">
              You may cancel your subscription at any time through your account settings or the Stripe Customer Portal. Cancellation will take effect at the end of your current billing period. You will not be charged for subsequent periods after cancellation.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">5.3 Credit Rollover</h3>
            <p className="text-text/80 mb-4">
              Credit rollover policies vary by plan:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Free Plan:</strong> Unused credits do not roll over to the next month. Credits reset to 10 at the start of each monthly period.</li>
              <li><strong>Pro Plan:</strong> Unused credits roll over to subsequent months as long as your subscription remains active. Rolled-over credits are forfeited upon subscription cancellation or downgrade.</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">5.4 Plan Changes</h3>
            <p className="text-text/80 mb-4">
              You may upgrade or downgrade your subscription plan at any time. Upgrades take effect immediately, and you will be charged a prorated amount for the remainder of your billing period. Downgrades take effect at the start of your next billing period.
            </p>
          </section>

          {/* User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">6. User Content and Data</h2>

            <h3 className="text-xl font-semibold text-text mb-3">6.1 Calendar Data</h3>
            <p className="text-text/80 mb-4">
              By granting Sophie access to your Google Calendar, you authorize us to access, process, and store your calendar data, including meeting titles, descriptions, attendee lists, and scheduling information, solely for the purpose of providing our services.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">6.2 Licenses Granted to Us</h3>
            <p className="text-text/80 mb-4">
              You grant Sophie a non-exclusive, worldwide, royalty-free license to access, use, process, and store your calendar data and related information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Providing and improving our meeting preparation services</li>
              <li>Generating AI-powered research and meeting briefs</li>
              <li>Sending you automated meeting preparation emails</li>
              <li>Analyzing usage patterns to improve service quality</li>
              <li>Complying with legal obligations and enforcing our Terms</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">6.3 Data Ownership</h3>
            <p className="text-text/80 mb-4">
              You retain all ownership rights to your calendar data. We do not claim ownership of your data, and you may revoke our access at any time through your Google Account settings.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">6.4 Third-Party Data</h3>
            <p className="text-text/80 mb-4">
              Sophie researches publicly available information about meeting attendees and their companies. By using our service, you acknowledge that this research may include information obtained from third-party sources and that we are not responsible for the accuracy, completeness, or legality of such information.
            </p>
          </section>

          {/* Prohibited Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">7. Prohibited Use</h2>
            <p className="text-text/80 mb-4">
              You agree not to use Sophie for any unlawful or prohibited purpose. Specifically, you agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Use the service to harass, stalk, or harm others</li>
              <li>Attempt to gain unauthorized access to our systems or other user accounts</li>
              <li>Use automated tools (bots, scrapers) to access the service without permission</li>
              <li>Reverse engineer, decompile, or disassemble any part of the service</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Upload malicious code, viruses, or harmful software</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Collect or store personal data about other users without consent</li>
              <li>Use the service for competitive analysis or to build competing products</li>
              <li>Resell, redistribute, or sublicense access to the service</li>
              <li>Remove or alter any copyright, trademark, or proprietary notices</li>
            </ul>
            <p className="text-text/80">
              Violation of these restrictions may result in immediate termination of your account and legal action.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">8. Third-Party Services</h2>
            <p className="text-text/80 mb-4">
              Sophie integrates with and relies on third-party services to provide our functionality:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Google Calendar API:</strong> For calendar synchronization and meeting data access</li>
              <li><strong>Google OAuth:</strong> For authentication and authorization</li>
              <li><strong>Google Gemini AI:</strong> For AI-powered research and content generation</li>
              <li><strong>Stripe:</strong> For payment processing and subscription management</li>
              <li><strong>Supabase:</strong> For database hosting and authentication services</li>
            </ul>
            <p className="text-text/80 mb-4">
              Your use of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the availability, functionality, or actions of these third-party services. Any disputes with third-party services should be resolved directly with the provider.
            </p>
            <p className="text-text/80">
              If a third-party service becomes unavailable or changes its terms in a way that affects Sophie, we may need to modify or discontinue features that rely on that service.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">9. Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-text mb-3">9.1 Our Ownership</h3>
            <p className="text-text/80 mb-4">
              Sophie and all of its original content, features, functionality, design, software, trademarks, logos, and branding are owned by Sophie and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">9.2 Limited License</h3>
            <p className="text-text/80 mb-4">
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use Sophie for your personal or internal business use, subject to these Terms. This license does not include any right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Modify, copy, or create derivative works of the service</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Sell, rent, lease, or sublicense access to the service</li>
              <li>Use our trademarks or branding without permission</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">9.3 Feedback</h3>
            <p className="text-text/80 mb-4">
              If you provide feedback, suggestions, or ideas about Sophie, you grant us an unrestricted, perpetual, royalty-free right to use, modify, and incorporate such feedback into our service without compensation or attribution to you.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-text/80 mb-4">
              MEETREADY IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
              <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR VIRUS-FREE</li>
              <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT OR RESEARCH</li>
              <li>WARRANTIES THAT DEFECTS WILL BE CORRECTED</li>
            </ul>
            <p className="text-text/80 mb-4">
              YOU ACKNOWLEDGE THAT:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>AI-generated research may contain inaccuracies or outdated information</li>
              <li>You are responsible for verifying information before relying on it</li>
              <li>Third-party service outages may affect Sophie's availability</li>
              <li>We do not guarantee specific results from using the service</li>
            </ul>
            <p className="text-text/80">
              YOUR USE OF MEETREADY IS AT YOUR SOLE RISK. NO ADVICE OR INFORMATION OBTAINED FROM US OR THROUGH THE SERVICE WILL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">11. Limitation of Liability</h2>
            <p className="text-text/80 mb-4">
              TO THE FULLEST EXTENT PERMITTED BY LAW, MEETREADY AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>LOSS OF PROFITS, REVENUE, DATA, OR USE</li>
              <li>LOSS OF OR DAMAGE TO BUSINESS REPUTATION</li>
              <li>COST OF SUBSTITUTE SERVICES</li>
              <li>DAMAGES ARISING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA</li>
              <li>DAMAGES ARISING FROM RELIANCE ON AI-GENERATED CONTENT OR RESEARCH</li>
              <li>DAMAGES ARISING FROM THIRD-PARTY SERVICES OR INTEGRATIONS</li>
            </ul>
            <p className="text-text/80 mb-4">
              WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="text-text/80 mb-4">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
            <p className="text-text/80">
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">12. Indemnification</h2>
            <p className="text-text/80 mb-4">
              You agree to indemnify, defend, and hold harmless Sophie and its officers, directors, employees, agents, affiliates, successors, and assigns from and against any and all losses, damages, liabilities, deficiencies, claims, actions, judgments, settlements, interest, awards, penalties, fines, costs, or expenses (including reasonable attorneys' fees) arising from or relating to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Your use or misuse of the service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any applicable laws or regulations</li>
              <li>Your violation of any third-party rights, including intellectual property or privacy rights</li>
              <li>Your calendar data or any content you provide to us</li>
              <li>Any dispute between you and a third party arising from your use of the service</li>
            </ul>
            <p className="text-text/80">
              We reserve the right to assume exclusive defense and control of any matter subject to indemnification by you, and you agree to cooperate with our defense of such claims.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">13. Termination</h2>

            <h3 className="text-xl font-semibold text-text mb-3">13.1 Termination by You</h3>
            <p className="text-text/80 mb-4">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Canceling your subscription through account settings or Stripe Customer Portal</li>
              <li>Revoking Sophie's access to your Google Calendar through Google Account settings</li>
              <li>Contacting us to request account deletion</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">13.2 Termination by Us</h3>
            <p className="text-text/80 mb-4">
              We reserve the right to suspend or terminate your access to Sophie at any time, with or without cause, with or without notice, effective immediately. Reasons for termination may include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Failure to pay subscription fees</li>
              <li>Extended periods of account inactivity</li>
              <li>Requests from law enforcement or government agencies</li>
              <li>Unexpected technical or security issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">13.3 Effect of Termination</h3>
            <p className="text-text/80 mb-4">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Your access to the service will cease immediately</li>
              <li>All licenses granted to you under these Terms will terminate</li>
              <li>You will not be entitled to any refund of fees paid</li>
              <li>Unused credits will be forfeited</li>
              <li>We may delete your account data in accordance with our data retention policy</li>
            </ul>
            <p className="text-text/80">
              Provisions of these Terms that by their nature should survive termination shall survive, including but not limited to: ownership provisions, warranty disclaimers, indemnification, and limitations of liability.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">14. Changes to Terms</h2>
            <p className="text-text/80 mb-4">
              We reserve the right to modify these Terms at any time. When we make changes, we will:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Update the "Last Updated" date at the top of this page</li>
              <li>Notify you by email or through a prominent notice in the service</li>
              <li>Provide a reasonable period (at least 30 days for material changes) before changes take effect</li>
            </ul>
            <p className="text-text/80 mb-4">
              Material changes may include modifications to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li>Pricing, credit allocation, or subscription plans</li>
              <li>Payment terms or refund policies</li>
              <li>Data usage or privacy practices</li>
              <li>Liability limitations or dispute resolution procedures</li>
            </ul>
            <p className="text-text/80 mb-4">
              Your continued use of Sophie after changes take effect constitutes your acceptance of the modified Terms. If you do not agree with the changes, you must cancel your account and stop using the service before the changes take effect.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">15. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-text mb-3">15.1 Governing Law</h3>
            <p className="text-text/80 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">15.2 Dispute Resolution</h3>
            <p className="text-text/80 mb-4">
              Any dispute, controversy, or claim arising out of or relating to these Terms or the service shall be resolved as follows:
            </p>
            <ul className="list-disc pl-6 mb-4 text-text/80 space-y-2">
              <li><strong>Informal Resolution:</strong> You agree to first contact us to attempt to resolve any dispute informally by emailing support@meetready.app</li>
              <li><strong>Binding Arbitration:</strong> If informal resolution fails within 30 days, the dispute shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules</li>
              <li><strong>Location:</strong> Arbitration will be conducted in Delaware unless both parties agree otherwise</li>
              <li><strong>Costs:</strong> Each party shall bear its own costs, but the arbitrator may award reasonable attorneys' fees to the prevailing party</li>
            </ul>

            <h3 className="text-xl font-semibold text-text mb-3">15.3 Class Action Waiver</h3>
            <p className="text-text/80 mb-4">
              YOU AND MEETREADY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTION.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">15.4 Exceptions</h3>
            <p className="text-text/80 mb-4">
              Notwithstanding the above, either party may seek equitable relief in any court of competent jurisdiction to prevent unauthorized use or abuse of the service or infringement of intellectual property rights.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">16. Contact Information</h2>
            <p className="text-text/80 mb-4">
              If you have any questions, concerns, or feedback about these Terms of Service, please contact us:
            </p>
            <div className="bg-surface p-6 rounded-lg border border-text/10 mb-4">
              <p className="text-text/80 mb-2"><strong>Email:</strong> support@meetready.app</p>
              <p className="text-text/80 mb-2"><strong>Website:</strong> <a href="https://meetready.app" className="text-accent hover:underline">meetready.app</a></p>
              <p className="text-text/80"><strong>Legal Inquiries:</strong> legal@meetready.app</p>
            </div>
            <p className="text-text/80">
              We will make every effort to respond to your inquiry within 5 business days.
            </p>
          </section>

          {/* Additional Provisions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-text mb-4">17. Additional Provisions</h2>

            <h3 className="text-xl font-semibold text-text mb-3">17.1 Entire Agreement</h3>
            <p className="text-text/80 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Sophie regarding your use of the service and supersede all prior agreements and understandings, whether written or oral.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">17.2 Severability</h3>
            <p className="text-text/80 mb-4">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">17.3 Waiver</h3>
            <p className="text-text/80 mb-4">
              No waiver of any term or condition of these Terms shall be deemed a further or continuing waiver of such term or any other term. Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">17.4 Assignment</h3>
            <p className="text-text/80 mb-4">
              You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms to any affiliate or in connection with a merger, acquisition, or sale of assets, with notice to you.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">17.5 Force Majeure</h3>
            <p className="text-text/80 mb-4">
              We shall not be liable for any failure to perform our obligations under these Terms due to circumstances beyond our reasonable control, including acts of God, war, terrorism, pandemic, labor disputes, or failures of third-party services.
            </p>

            <h3 className="text-xl font-semibold text-text mb-3">17.6 Relationship of Parties</h3>
            <p className="text-text/80 mb-4">
              No agency, partnership, joint venture, or employment relationship is created between you and Sophie as a result of these Terms or your use of the service.
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
            © {new Date().getFullYear()} Sophie. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
