"use client"

import { Loader2, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthLoadingProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function AuthLoading({ message = "Authenticating...", fullScreen = true, className }: AuthLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50",
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <Shield className="h-12 w-12 text-indigo-300" />
        </div>
        <Shield className="h-12 w-12 text-indigo-600" />
      </div>
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        <span className="text-lg font-medium text-indigo-700">{message}</span>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden md:block w-64 min-h-screen bg-white border-r p-4">
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-6">
          {/* Welcome card */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>

          {/* Quick actions */}
          <div className="mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                </div>
                <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Safety updates */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 shadow-sm"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl animate-pulse">
        <div className="flex justify-center mb-6">
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-center gap-2 mb-4">
            <div className="h-10 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-indigo-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}
