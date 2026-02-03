"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth, db } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { Loader2, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import type { User as UserType } from "@/types/user"

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
  const router = useRouter()

  // Google signup
  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError(null)
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Check if user already exists
      const existingUser = await getDoc(doc(db, "users", user.uid))
      if (existingUser.exists()) {
        // User already exists, redirect to dashboard
        router.push("/dashboard")
        return
      }
      
      // Create new user profile
      const userData: UserType = {
        uid: user.uid,
        email: user.email || "",
        fullName: user.displayName || "",
        provider: "google",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
      }
      
      await setDoc(doc(db, "users", user.uid), userData)
      
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/profile")
      }, 1000)
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error.code === "auth/popup-closed-by-user") {
        setError(null)
      } else if (error.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized. Please contact support.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.")
      } else {
        setError(error?.message || "Google signup failed. Please allow popups.")
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  // Email signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Please enter your full name")
      return
    }
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      
      // Create user profile
      const userData: UserType = {
        uid: result.user.uid,
        email,
        fullName: name,
        provider: "email",
        photoURL: "",
        createdAt: new Date().toISOString(),
      }
      
      await setDoc(doc(db, "users", result.user.uid), userData)
      
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/profile")
      }, 1000)
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      let message = "Signup failed. Please try again."
      
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered. Please login instead."
          break
        case "auth/invalid-email":
          message = "Invalid email address."
          break
        case "auth/weak-password":
          message = "Password is too weak. Please use a stronger password."
          break
      }
      
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-4">Please complete your profile...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-8 sm:p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
          {/* Header */}
          <div className="text-center pt-6 pb-3 px-6 sm:px-8">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Join Saviour to help your community</p>
          </div>

          {/* Form Content */}
          <div className="px-6 sm:px-8 pb-6">
            <form className="space-y-4" onSubmit={handleEmailSignup}>
              {/* Name Input */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="John Doe"
                    className="pl-11 h-12 text-base border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={isLoading || googleLoading}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="pl-11 h-12 text-base border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading || googleLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Min. 6 characters"
                    className="pl-11 pr-12 h-12 text-base border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Confirm your password"
                    className="pl-11 h-12 text-base border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isLoading || googleLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Signup Button */}
              <Button
                type="submit"
                className="w-full h-12 sm:h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 mt-2"
                disabled={isLoading || googleLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Google Signup */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={googleLoading || isLoading}
              className="w-full h-12 sm:h-14 text-base font-medium border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24">
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
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50/80 border-t border-gray-100">
            <p className="text-center text-sm sm:text-base text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/auth/login" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Protected by Saviour Security
        </p>
      </div>
    </div>
  )
}
