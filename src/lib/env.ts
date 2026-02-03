/**
 * Environment variable validation and utilities
 * Run this check at app startup to catch missing variables early
 */

type EnvVarConfig = {
  name: string
  required: boolean
  serverOnly: boolean
}

const ENV_VARS: EnvVarConfig[] = [
  // Server-side only (secure)
  { name: 'GEMINI_API_KEY', required: false, serverOnly: true },
  { name: 'WEATHER_API_KEY', required: false, serverOnly: true },
  { name: 'OPENWEATHERMAP_API_KEY', required: false, serverOnly: true },
  { name: 'NEXTAUTH_SECRET', required: true, serverOnly: true },
  { name: 'JWT_SECRET', required: true, serverOnly: true },
  { name: 'SMTP_HOST', required: false, serverOnly: true },
  { name: 'SMTP_PORT', required: false, serverOnly: true },
  { name: 'SMTP_USER', required: false, serverOnly: true },
  { name: 'SMTP_PASSWORD', required: false, serverOnly: true },
  
  // Client-side (Firebase is required)
  { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', required: true, serverOnly: false },
  { name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', required: true, serverOnly: false },
  { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', required: true, serverOnly: false },
]

/**
 * Validates that all required environment variables are set
 * Call this in your app initialization (e.g., instrumentation.ts or API routes)
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  
  for (const config of ENV_VARS) {
    if (config.required && !process.env[config.name]) {
      missing.push(config.name)
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Get a required environment variable, throwing if not set
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    // In production, don't expose which variable is missing
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Server configuration error')
    }
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Get an optional environment variable with a default
 */
export function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Safe console.log that only logs in development
 */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV]', ...args)
  }
}

/**
 * Safe console.error that sanitizes sensitive data in production
 */
export function safeError(message: string, error?: unknown): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, log generic message without sensitive details
    console.error(message)
  } else {
    // In development, log full error
    console.error(message, error)
  }
}
