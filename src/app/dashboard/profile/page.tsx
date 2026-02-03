"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Key, Timer, MapPin, Save, User, HeartPulse, ChevronRight, Loader2 } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { updatePassword } from "firebase/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

type HelpHistoryItem = {
  id: string
  latitude?: number
  longitude?: number
  emergencyType?: string
  createdAt?: { toDate?: () => Date } | string | number
  description?: string
  status?: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<import("firebase/auth").User | null>(null)
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [helpHistory, setHelpHistory] = useState<HelpHistoryItem[]>([])
  const [modal, setModal] = useState<null | "changePassword">(null)
  const [modalValue, setModalValue] = useState("")
  const [modalError, setModalError] = useState<string | null>(null)
  const router = useRouter()

  // Auth state and redirect if not logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/login")
      } else {
        setUser(firebaseUser)
      }
    })
    return () => unsubscribe()
  }, [router])

  // Fetch profile and help history
  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setName(data.fullName || "")
          setContact(data.contact || "")
        } else {
          await setDoc(doc(db, "users", user.uid), {
            fullName: user.displayName || "",
            contact: user.phoneNumber || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
        // Help history
        const q = query(collection(db, "sos_requests"), where("userId", "==", user.uid))
        const snap = await getDocs(q)
        setHelpHistory(
          snap.docs
            .map((d) => ({ ...d.data(), id: d.id } as HelpHistoryItem))
            .sort((a, b) => {
              const aDate = typeof a.createdAt === 'object' && a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt as string | number || 0)
              const bDate = typeof b.createdAt === 'object' && b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt as string | number || 0)
              return bDate.getTime() - aDate.getTime()
            })
        )
      } catch (e) {
        console.error("Error fetching profile:", e)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  // Save profile
  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName: name,
        contact,
        updatedAt: new Date(),
      })
      alert("Profile updated successfully!")
    } catch {
      alert("Failed to update profile. Please try again.")
    }
    setSaving(false)
  }

  // Change password modal
  const handleChangePassword = async () => {
    setModal("changePassword")
    setModalValue("")
    setModalError(null)
  }
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    if (!modalValue || modalValue.length < 6) {
      setModalError("Password must be at least 6 characters.")
      return
    }
    try {
      await updatePassword(auth.currentUser!, modalValue)
      setModal(null)
      alert("Password changed successfully.")
    } catch (e: unknown) {
      const err = e as { message?: string }
      setModalError(err?.message || "Failed to change password.")
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-3xl space-y-6">
          <Skeleton className="h-12 w-1/3 rounded-lg" />
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-indigo-600 dark:bg-indigo-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription className="text-indigo-100">
                  Manage your account settings and emergency history
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-indigo-600 dark:text-indigo-400">
                {user?.email}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Profile Section */}
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarFallback className="bg-indigo-100 text-indigo-800 text-3xl">
                    {name ? name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Number
                  </label>
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Phone number"
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <Button
                onClick={saveProfile}
                disabled={saving}
                className="w-full py-6 text-lg font-bold shadow-lg"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Profile
                  </div>
                )}
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Reset Password Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Account Security
              </h3>

              <Button
                variant="outline"
                className="w-full flex items-center justify-between p-4 h-auto"
                onClick={handleChangePassword}
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <div className="text-left">
                    <div className="font-medium">Reset Password</div>
                    <div className="text-sm text-gray-500">Update your login credentials</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Help History Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-indigo-600" />
                Emergency History
              </h3>

              {helpHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Timer className="w-10 h-10 text-gray-400 mb-3" />
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">No emergency requests yet</h4>
                  <p className="text-sm text-gray-500 max-w-md mt-1">
                    Your past emergency alerts will appear here when you use the SOS feature.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {helpHistory.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{item.emergencyType || "Emergency"}</span>
                              {item.status && (
                                <Badge
                                  variant={
                                    item.status === "active"
                                      ? "destructive"
                                      : item.status === "resolved"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {item.status}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {typeof item.createdAt === 'object' && item.createdAt?.toDate
                                ? item.createdAt.toDate().toLocaleString()
                                : item.createdAt?.toString() || "N/A"}
                            </div>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {item.description}
                          </p>
                        )}
                        {typeof item.latitude === "number" && typeof item.longitude === "number" && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <MapPin className="w-3 h-3" />
                            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Modal */}
      <Dialog open={modal === "changePassword"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your new password (minimum 6 characters)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="New password"
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              autoFocus
            />
            {modalError && <div className="text-red-500 text-sm">{modalError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}