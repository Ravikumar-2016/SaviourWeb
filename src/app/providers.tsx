"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import { AltitudePlacesProvider } from "@/lib/stores/altitude-context-simple"
import { AuthProvider } from "@/lib/auth-context"

type ProvidersProps = {
  children: React.ReactNode
  session: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <AltitudePlacesProvider>{children}</AltitudePlacesProvider>
      </AuthProvider>
    </SessionProvider>
  )
}

