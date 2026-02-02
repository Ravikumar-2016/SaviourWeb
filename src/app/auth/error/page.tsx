"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, LogIn, Shield } from "lucide-react"

export default function AuthError() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
          
          {/* Content */}
          <div className="p-6 sm:p-8 text-center">
            {/* Error icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 sm:p-5 bg-red-100 rounded-full">
                <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Authentication Error</h1>
            
            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              There was an error during the authentication process. Please try again.
            </p>
            
            {/* Info */}
            <p className="text-sm text-gray-500 mb-6">
              You will be redirected to the login page in 5 seconds.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/auth/login")}
                className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Go to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1 h-12 border-gray-200 rounded-xl font-medium"
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Support text */}
            <p className="text-xs text-gray-400 mt-6">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
        
        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
          <Shield className="h-4 w-4" />
          <span className="text-xs">Saviour Security</span>
        </div>
      </div>
    </div>
  )
}

