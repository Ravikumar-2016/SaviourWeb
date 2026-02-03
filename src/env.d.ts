declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server-side only (secure - not exposed to browser)
      GEMINI_API_KEY: string
      WEATHER_API_KEY: string
      OPENWEATHERMAP_API_KEY: string
      JWT_SECRET: string
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
      BASE_URL: string
      SMTP_HOST: string
      SMTP_PORT: string
      SMTP_USER: string
      SMTP_PASSWORD: string
      SMTP_FROM_EMAIL: string
      SMTP_FROM_NAME: string
      CONTACT_RECIPIENT_EMAIL: string
      
      // Client-side (exposed to browser)
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string
      NEXT_PUBLIC_FIREBASE_API_KEY: string
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
      NEXT_PUBLIC_FIREBASE_APP_ID: string
    }
  }
}

export {}