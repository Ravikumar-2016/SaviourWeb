"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import AdminDashboardLayout from "@/components/AdminDashboardLayout"
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

      // Verify user exists in admins collection
      const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid))
      if (!adminDoc.exists()) {
        // Check if they're a regular user trying to access admin dashboard
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          router.replace("/dashboard")
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
    return <DashboardSkeleton type="admin" />
  }

  if (!user) {
    return null
  }

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>
}