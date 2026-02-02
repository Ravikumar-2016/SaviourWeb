"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { auth, db } from "@/lib/firebase"
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged 
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { Loader2, User, Mail, Lock, MapPin, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import { AuthLoading } from "@/components/ui/auth-loading"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)
  const isGoogleAuthInProgress = useRef(false)
  const hasRedirected = useRef(false)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip if Google auth is in progress (let the handler manage the flow)
      if (isGoogleAuthInProgress.current) {
        return
      }
      
      if (firebaseUser && !hasRedirected.current) {
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

  // Check for redirect result (for mobile/browsers that block popups)
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user && !hasRedirected.current) {
          isGoogleAuthInProgress.current = true
          
          // Check if user already exists
          const existingUser = await getDoc(doc(db, "users", result.user.uid))
          if (existingUser.exists()) {
            hasRedirected.current = true
            router.replace("/dashboard")
            return
          }
          
          // Check if user exists as admin
          const existingAdmin = await getDoc(doc(db, "admins", result.user.uid))
          if (existingAdmin.exists()) {
            hasRedirected.current = true
            router.replace("/admin-dashboard")
            return
          }
          
          // Create new user account
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
          setSuccess(true)
          hasRedirected.current = true
          setTimeout(() => router.replace("/dashboard"), 1000)
        }
      } catch (error) {
        console.error("Redirect result error:", error)
        isGoogleAuthInProgress.current = false
      }
    }
    checkRedirectResult()
  }, [router])

  // Password validation
  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return "Password must be at least 6 characters"
    return null
  }

  // Detect if we should use redirect instead of popup
  const isMobileOrSafari = () => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    const isMobile = /iphone|ipad|ipod|android|webos|blackberry|windows phone/i.test(ua)
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
    return isMobile || isSafari
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError(null)
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
      const user = result.user
      
      // Check if user already exists in users collection
      const existingUser = await getDoc(doc(db, "users", user.uid))
      if (existingUser.exists()) {
        hasRedirected.current = true
        router.replace("/dashboard")
        return
      }
      
      // Check if user exists as admin
      const existingAdmin = await getDoc(doc(db, "admins", user.uid))
      if (existingAdmin.exists()) {
        hasRedirected.current = true
        router.replace("/admin-dashboard")
        return
      }

      // Create new user account
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || "",
        city: "",
        photoURL: user.photoURL || "",
        role: "user",
        provider: "google",
        createdAt: new Date().toISOString(),
      })
      
      setSuccess(true)
      hasRedirected.current = true
      setTimeout(() => router.replace("/dashboard"), 1000)
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      console.error("Google signup error:", err.code, err.message)
      
      if (err.code === "auth/popup-closed-by-user") {
        setError(null)
      } else if (err.code === "auth/popup-blocked") {
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
        setError(err?.message || "Google signup failed. Please try again.")
      }
    } finally {
      setGoogleLoading(false)
      isGoogleAuthInProgress.current = false
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validations
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }
    if (!city.trim()) {
      setError("Please enter your city")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      return
    }

    setIsLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email,
        fullName: name,
        city,
        photoURL: "",
        role: "user",
        provider: "email",
        createdAt: new Date().toISOString(),
      })
      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      let message = "Signup failed. Please try again."
      if (err.code === "auth/email-already-in-use") message = "This email is already registered. Please login instead."
      else if (err.code === "auth/invalid-email") message = "Invalid email address."
      else if (err.code === "auth/weak-password") message = "Password is too weak. Please use a stronger password."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return <AuthLoading message="Please wait..." />
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-4">Redirecting you to the dashboard...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
        </Card>
      </div>
    )
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
            Create Account
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Join Saviour to help your community</p>
        </CardHeader>
        <CardContent className="mt-4">
          <form className="space-y-4" onSubmit={handleEmailSignup}>
            {/* Name Input */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="John Doe"
                  className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isLoading || googleLoading}
                />
              </div>
            </div>

            {/* City Input */}
            <div className="space-y-1">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  required
                  placeholder="Your city"
                  className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  disabled={isLoading || googleLoading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading || googleLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 6 characters"
                  className="pl-10 pr-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Confirm your password"
                  className="pl-10 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={isLoading || googleLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Signup Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium"
              disabled={isLoading || googleLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
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

          {/* Google Signup */}
          <Button
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={googleLoading || isLoading}
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
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}