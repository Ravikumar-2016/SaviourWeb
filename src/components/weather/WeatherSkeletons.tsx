"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function WeatherSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Current Weather Card Skeleton */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4">
                <Skeleton className="h-16 w-32 bg-white/20" />
                <Skeleton className="h-6 w-48 bg-white/20" />
                <Skeleton className="h-5 w-36 bg-white/20" />
                <div className="flex gap-4 mt-4">
                  <Skeleton className="h-5 w-24 bg-white/20" />
                  <Skeleton className="h-5 w-24 bg-white/20" />
                  <Skeleton className="h-5 w-24 bg-white/20" />
                </div>
              </div>
              <Skeleton className="h-32 w-32 rounded-full bg-white/20" />
            </div>
          </div>
          <CardContent className="p-4 md:p-6 bg-white/80 dark:bg-slate-800/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Forecast Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="min-w-[80px] flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Forecast Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-700">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function CurrentWeatherSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-16 w-32 bg-white/20" />
            <Skeleton className="h-6 w-48 bg-white/20" />
            <Skeleton className="h-5 w-36 bg-white/20" />
          </div>
          <Skeleton className="h-32 w-32 rounded-full bg-white/20" />
        </div>
      </div>
    </Card>
  )
}

export function HourlyForecastSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="min-w-[80px] flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DailyForecastSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-700">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
