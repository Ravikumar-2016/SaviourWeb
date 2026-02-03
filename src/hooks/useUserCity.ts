"use client"

import { useState, useEffect, useCallback } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import type { User } from "@/types/user"

interface UserCityData {
  city: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  fullName: string | null
  email: string | null
  photoURL: string | null
  uid: string | null
}

interface UseUserCityReturn {
  /** User location data from profile */
  userCity: UserCityData
  /** Whether data is still loading */
  loading: boolean
  /** Whether user profile is complete (has city set) */
  isProfileComplete: boolean
  /** Error message if any */
  error: string | null
  /** Refresh user data from Firestore */
  refresh: () => Promise<void>
}

/**
 * Centralized hook for fetching user's city and location from their profile.
 * All location-dependent services should use this hook instead of geolocation.
 * 
 * If user has no city set, redirects to profile page automatically (unless disabled).
 */
export function useUserCity(options?: { redirectIfNoCity?: boolean }): UseUserCityReturn {
  const { redirectIfNoCity = true } = options || {}
  const router = useRouter()
  
  const [userCity, setUserCity] = useState<UserCityData>({
    city: null,
    state: null,
    country: null,
    latitude: null,
    longitude: null,
    fullName: null,
    email: null,
    photoURL: null,
    uid: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = useCallback(async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const data = userDoc.data() as User
        setUserCity({
          city: data.city || null,
          state: data.state || null,
          country: data.country || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          fullName: data.fullName || null,
          email: data.email || null,
          photoURL: data.photoURL || null,
          uid: data.uid || uid,
        })
        
        // Check if profile is incomplete and redirect if needed
        if (redirectIfNoCity && !data.city) {
          router.push("/dashboard/profile")
        }
        
        return data.city ? true : false
      } else {
        setError("User profile not found")
        if (redirectIfNoCity) {
          router.push("/dashboard/profile")
        }
        return false
      }
    } catch (err) {
      console.error("Error fetching user city:", err)
      setError("Failed to load user profile")
      return false
    }
  }, [redirectIfNoCity, router])

  const refresh = useCallback(async () => {
    const user = auth.currentUser
    if (user) {
      setLoading(true)
      await fetchUserData(user.uid)
      setLoading(false)
    }
  }, [fetchUserData])

  useEffect(() => {
    let isMounted = true
    
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!isMounted) return
      
      if (!firebaseUser) {
        router.push("/auth/login")
        return
      }
      
      setLoading(true)
      await fetchUserData(firebaseUser.uid)
      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [fetchUserData, router])

  const isProfileComplete = !!(userCity.city && userCity.latitude && userCity.longitude)

  return {
    userCity,
    loading,
    isProfileComplete,
    error,
    refresh,
  }
}

/**
 * Get coordinates from user's profile city.
 * Returns null if not available.
 */
export function getUserCoordinates(userCity: UserCityData): { latitude: number; longitude: number } | null {
  if (userCity.latitude && userCity.longitude) {
    return {
      latitude: userCity.latitude,
      longitude: userCity.longitude,
    }
  }
  return null
}
