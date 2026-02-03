"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export interface UserProfile {
  uid: string
  email: string | null
  fullName: string
  city?: string
  photoURL?: string
  provider?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<UserProfile | null> => {
    try {
      // Get user from users collection
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: data.fullName || firebaseUser.displayName || "User",
          city: data.city || "",
          photoURL: data.photoURL || firebaseUser.photoURL || "",
          provider: data.provider || "email",
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await fetchUserProfile(user)
      setProfile(newProfile)
    }
  }, [user, fetchUserProfile])

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      
      if (firebaseUser) {
        setUser(firebaseUser)
        const userProfile = await fetchUserProfile(firebaseUser)
        setProfile(userProfile)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [fetchUserProfile])

  return (
    <AuthContext.Provider value={{ user, profile, loading, initialized, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, profile, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return

    if (!user) {
      router.replace("/auth/login")
      return
    }
  }, [user, profile, loading, initialized, router])

  return { user, profile, loading, initialized, isAuthorized: !!user }
}
