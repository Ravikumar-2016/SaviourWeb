"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import type { User } from "@/types/user"

interface AuthContextType {
  user: FirebaseUser | null
  profile: User | null
  loading: boolean
  initialized: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isProfileComplete: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          uid: firebaseUser.uid,
          email: data.email || firebaseUser.email || "",
          fullName: data.fullName || firebaseUser.displayName || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          latitude: data.latitude,
          longitude: data.longitude,
          provider: data.provider || "email",
          photoURL: data.photoURL || firebaseUser.photoURL || "",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
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

  // Check if profile has required fields (city is mandatory)
  const isProfileComplete = !!(profile?.city && profile?.fullName)

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
    <AuthContext.Provider value={{ user, profile, loading, initialized, signOut, refreshProfile, isProfileComplete }}>
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
  const { user, profile, loading, initialized, isProfileComplete } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return

    if (!user) {
      router.replace("/auth/login")
      return
    }
  }, [user, profile, loading, initialized, router, isProfileComplete])

  return { user, profile, loading, initialized, isAuthorized: !!user, isProfileComplete }
}
