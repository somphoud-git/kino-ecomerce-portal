/**
 * Utility functions for handling user emails
 */

/**
 * Generate a random email for users who register without providing one
 * Format: phone_{phoneNumber}_{timestamp}@kino-temp.com
 * 
 * @param phoneNumber - The user's phone number
 * @returns A unique temporary email address
 */
export const generateRandomEmail = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\s/g, '') // Remove spaces
  const timestamp = Date.now()
  return `phone_${cleanPhone}_${timestamp}@kino-temp.com`
}

/**
 * Check if an email is a randomly generated temporary email
 * 
 * @param email - The email to check
 * @returns true if the email is a temporary generated one
 */
export const isRandomEmail = (email: string): boolean => {
  return email.includes('@kino-temp.com') && email.startsWith('phone_')
}

/**
 * Get a user-friendly email display
 * If the email is a random one, return a message indicating user registered with phone
 * 
 * @param email - The email to display
 * @returns A user-friendly email string
 */
export const getDisplayEmail = (email: string): string => {
  if (isRandomEmail(email)) {
    return '(ລົງທະບຽນດ້ວຍເບີໂທ)'
  }
  return email
}

/**
 * Validate email format (optional field)
 * Returns true if email is empty or valid
 * 
 * @param email - The email to validate
 * @returns true if valid or empty
 */
export const validateOptionalEmail = (email: string | undefined): boolean => {
  if (!email || email.trim() === '') {
    return true // Empty is valid (optional)
  }
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
