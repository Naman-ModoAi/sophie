'use server'

// Contact form server action
export async function submitContactForm(formData: FormData) {
  const email = formData.get('email')

  // Basic validation
  if (!email || typeof email !== 'string') {
    return {
      success: false,
      error: 'Email is required'
    }
  }

  // Email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Invalid email address'
    }
  }

  // TODO: Send email to support/sales team
  // For now, just log the submission
  console.log('Contact form submission:', email)

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    success: true,
    message: "Thanks! We'll be in touch soon."
  }
}
