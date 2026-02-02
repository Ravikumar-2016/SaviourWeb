"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, LogIn } from "lucide-react"

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(10)
  
  const errorType = searchParams.get("error") || "unknown"
  
  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Configuration Error",
      description: "There's an issue with the authentication configuration. Please contact support.",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You don't have permission to access this resource.",
    },
    Verification: {
      title: "Verification Required",
      description: "Please verify your email address to continue.",
    },
    Default: {
      title: "Authentication Error",
      description: "There was an error during the authentication process. Please try again.",
    },
    unknown: {
      title: "Something Went Wrong",
      description: "An unexpected error occurred. Please try logging in again.",
    },
  }

  const { title, description } = errorMessages[errorType] || errorMessages.unknown

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/auth/login")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full animate-pulse">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 pb-8">
          <p className="text-gray-600">{description}</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Redirecting to login in {countdown} seconds...</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Go to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

