"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { auth, db } from "@/lib/firebase"
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged 
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2, User, Users, Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { AuthLoading } from "@/components/ui/auth-loading"

const USER_ROLES = ["user", "admin"] as const
type UserRole = (typeof USER_ROLES)[number]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("user")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const isGoogleAuthInProgress = useRef(false)
  const hasRedirected = useRef(false)
  const router = useRouter()

  // Check for redirect result (for mobile/browsers that block popups)
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user && !hasRedirected.current) {
          isGoogleAuthInProgress.current = true
          // User signed in via redirect
          const userDoc = await getDoc(doc(db, "users", result.user.uid))
          if (userDoc.exists()) {
            hasRedirected.current = true
            router.replace("/dashboard")
            return
          }
          const adminDoc = await getDoc(doc(db, "admins", result.user.uid))
          if (adminDoc.exists()) {
            hasRedirected.current = true
            router.replace("/admin-dashboard")
            return
          }
          // If no existing account, create a user account
          await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            fullName: result.user.displayName || "",
            city: "",
            photoURL: result.user.photoURL || "",
            role: "user",
            provider: "google",
            createdAt: new Date().toISOString(),
          })
          hasRedirected.current = true
          router.replace("/dashboard")
        }
      } catch (error) {
        console.error("Redirect result error:", error)
        isGoogleAuthInProgress.current = false
      }
    }
    checkRedirectResult()
  }, [router])

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip if Google auth is in progress (let the handler manage the flow)
      if (isGoogleAuthInProgress.current) {
        return
      }
      
      if (firebaseUser && !hasRedirected.current) {
        // Check which collection the user belongs to
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          hasRedirected.current = true
          router.replace("/dashboard")
          return
        }
        const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid))
        if (adminDoc.exists()) {
          hasRedirected.current = true
          router.replace("/admin-dashboard")
          return
        }
      }
      setCheckingAuth(false)
    })
    return () => unsubscribe()
  }, [router])

  // Helper to get collection name by role
  const getCollectionByRole = (role: UserRole) => {
    if (role === "user") return "users"
    return "admins"
  }

  // Helper to get dashboard route by role
  const getDashboardByRole = (role: UserRole) => {
    if (role === "admin") return "/admin-dashboard"
    return "/dashboard"
  }

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.")
      return
    }
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const collectionName = getCollectionByRole(selectedRole)
      const userDoc = await getDoc(doc(db, collectionName, userCredential.user.uid))
      if (!userDoc.exists()) {
        setError(`No ${selectedRole} account found for this email. Please check your role selection.`)
        setLoading(false)
        return
      }
      router.replace(getDashboardByRole(selectedRole))
    } catch (error: unknown) {
      const err = error as { code?: string }
      let message = "Login failed. Please try again."
      if (err.code === "auth/invalid-email") message = "Invalid email address."
      if (err.code === "auth/user-disabled") message = "This account has been disabled."
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
        message = "Invalid email or password."
      if (err.code === "auth/too-many-requests")
        message = "Too many attempts. Please try again later."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Detect if we should use redirect instead of popup
  const isMobileOrSafari = () => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    const isMobile = /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(ua)
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
    return isMobile || isSafari
  }

  // Google login with fallback to redirect
  const handleGoogleLogin = async () => {
    setError(null)
    setGoogleLoading(true)
    isGoogleAuthInProgress.current = true
    
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    try {
      // Use redirect for mobile/Safari, popup for desktop
      if (isMobileOrSafari()) {
        await signInWithRedirect(auth, provider)
        return // Page will redirect
      }
      
      const result = await signInWithPopup(auth, provider)
      const collectionName = getCollectionByRole(selectedRole)
      const userDoc = await getDoc(doc(db, collectionName, result.user.uid))
      
      if (!userDoc.exists()) {
        // If admin role selected but no admin account exists
        if (selectedRole === "admin") {
          setError("No admin account found. Please contact administrator or sign in as user.")
          setGoogleLoading(false)
          isGoogleAuthInProgress.current = false
          return
        }
        // For user role, create account if doesn't exist
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.displayName || "",
          city: "",
          photoURL: result.user.photoURL || "",
          role: "user",
          provider: "google",
          createdAt: new Date().toISOString(),
        })
      }
      
      // Mark as redirected to prevent duplicate redirects
      hasRedirected.current = true
      router.replace(getDashboardByRole(selectedRole))
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      console.error("Google login error:", err.code, err.message)
      
      if (err.code === "auth/popup-closed-by-user") {
        setError(null)
      } else if (err.code === "auth/popup-blocked") {
        // Fallback to redirect if popup is blocked
        try {
          await signInWithRedirect(auth, provider)
          return
        } catch {
          setError("Please allow popups or try again.")
        }
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized. Please contact support.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.")
      } else {
        setError(err.message || "Google login failed. Please try again.")
      }
    } finally {
      setGoogleLoading(false)
      isGoogleAuthInProgress.current = false
    }
  }

  if (checkingAuth) {
    return <AuthLoading message="Checking authentication..." />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your Saviour account</p>
        </CardHeader>
        <CardContent className="mt-4">
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Role Selection */}
            <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-lg">
              {USER_ROLES.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRole === role ? "default" : "ghost"}
                  className={`flex-1 items-center gap-2 transition-all ${
                    selectedRole === role
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role === "user" ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                className="pl-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading || googleLoading}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Password"
                className="pl-10 pr-10 h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative w-full my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-12 border-gray-200 hover:bg-gray-50 font-medium"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col pt-4 pb-6">
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}