"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import DashboardLayout from "@/components/DashboardLayout"
import { DashboardSkeleton } from "@/components/ui/auth-loading"
import type { User } from "firebase/auth"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/auth/login")
        return
      }

      // Verify user exists in users collection (not admin)
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        // Check if they're an admin trying to access user dashboard
        const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid))
        if (adminDoc.exists()) {
          router.replace("/admin-dashboard")
          return
        }
        // No profile found, send to login
        router.replace("/auth/login")
        return
      }

      setUser(firebaseUser)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [router])

  if (authLoading) {
    return <DashboardSkeleton type="user" />
  }

  if (!user) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}