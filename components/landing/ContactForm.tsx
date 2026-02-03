'use client'

import { useState } from 'react'
import { submitContactForm } from '@/lib/actions/contact'

export function ContactForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const result = await submitContactForm(formData)

    if (result.success) {
      setStatus('success')
      setMessage(result.message || '')
      setEmail('') // Clear the form
    } else {
      setStatus('error')
      setMessage(result.error || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section id="contact" className="py-16 md:py-24 px-6 bg-surface scroll-mt-20">
      <div className="max-w-2xl mx-auto text-center">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
          Get in touch
        </h2>
        <p className="text-text/60 mb-8">
          Have a question or want to learn more? Drop your email and we'll get back to you.
        </p>

        {/* Contact Form */}
        {status === 'success' ? (
          // Success State
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
            <svg className="w-12 h-12 text-accent mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-text font-semibold mb-2">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="text-accent hover:text-accent/80 text-sm underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Email Input */}
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 bg-background border border-text/20 rounded-lg text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="px-6 py-3 bg-accent text-surface font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </div>

            {/* Error Message */}
            {status === 'error' && message && (
              <p className="text-sm text-red-600 text-left">
                {message}
              </p>
            )}

            {/* Privacy Notice */}
            <p className="text-xs text-text/50">
              We'll only use your email to respond. No spam, ever.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
