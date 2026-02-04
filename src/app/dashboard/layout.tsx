"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import DashboardLayout from "@/components/DashboardLayout"
import { DashboardSkeleton } from "@/components/ui/auth-loading"
import type { User } from "firebase/auth"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/auth/login")
        return
      }

      // Verify user exists in users collection
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        // No profile found, still allow access to profile page to create one
        setUser(firebaseUser)
        setAuthLoading(false)
        
        // Redirect to profile page if not already there
        if (pathname !== "/dashboard/profile") {
          router.replace("/dashboard/profile")
        }
        return
      }

      // Check if user has completed profile (has city)
      const userData = userDoc.data()
      if (!userData?.city && pathname !== "/dashboard/profile") {
        // First-time user without city, redirect to profile page
        router.replace("/dashboard/profile")
        setUser(firebaseUser)
        setAuthLoading(false)
        return
      }

      setUser(firebaseUser)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router, pathname])

  if (authLoading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}