"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  RefreshCw, 
  MapPin, 
  CloudOff,
  Settings
} from "lucide-react"
import { useUserCity } from "@/hooks/useUserCity"
import { 
  WeatherSkeleton,
  CurrentWeatherCard,
  HourlyForecastCard,
  DailyForecastCard 
} from "@/components/weather"

// Weather data interface matching API response
interface WeatherData {
  source: "weatherapi" | "openweathermap" | "combined" | "mock"
  forecastInfo: {
    totalDays: number
  }
  location: {
    name: string
    region?: string
    country: string
    timezone?: string
  }
  current: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    wind_speed: number
    wind_deg: number
    wind_dir: string
    uvi: number | null
    visibility: number
    weather: {
      main: string
      description: string
      icon: string
    }
    sunrise: string
    sunset: string
    is_day: boolean
  }
  hourly: Array<{
    dt: number
    temp: number
    feels_like?: number
    humidity: number
    wind_speed: number
    pop: number
    uv?: number
    weather: {
      main: string
      description: string
      icon: string
    }
  }>
  daily: Array<{
    dt: number
    temp_min: number
    temp_max: number
    humidity: number
    wind_speed: number
    pop: number
    uv?: number
    sunrise?: string
    sunset?: string
    weather: {
      main: string
      description: string
      icon: string
    }
  }>
}

type LoadingState = "idle" | "loading" | "success" | "error"

export default function WeatherPage() {
  const router = useRouter()
  const { userCity, loading: userLoading, isProfileComplete } = useUserCity({ redirectIfNoCity: false })
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch weather from our API route
  const fetchWeather = useCallback(async () => {
    if (!userCity.city) return

    setLoadingState("loading")
    setErrorMessage(null)

    try {
      const params = new URLSearchParams({
        city: userCity.city,
      })
      if (userCity.state) params.append("state", userCity.state)
      if (userCity.country) params.append("country", userCity.country)

      const response = await fetch(`/api/weather?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data: WeatherData = await response.json()
      
      setWeatherData(data)
      setLoadingState("success")
      setLastUpdated(new Date())
      setErrorMessage(null)
    } catch (error) {
      console.error("Weather fetch error:", error)
      setLoadingState("error")
      setErrorMessage("Unable to fetch weather data. Please try again later.")
    }
  }, [userCity.city, userCity.state, userCity.country])

  // Initial fetch when user data is available
  useEffect(() => {
    if (userLoading) return
    
    if (userCity.city) {
      fetchWeather()
    } else {
      setLoadingState("idle")
    }
  }, [userCity.city, userLoading, fetchWeather])

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchWeather()
    setIsRefreshing(false)
  }

  // Format last updated time
  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return ""
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Loading state - show skeleton
  if (userLoading || loadingState === "loading") {
    return <WeatherSkeleton />
  }

  // No city set - prompt to set profile
  if (!isProfileComplete || !userCity.city) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MapPin className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Set Your Location
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              To provide accurate weather information, please set your city in your profile. 
              Weather data will be based on your profile location.
            </p>
            <Button 
              onClick={() => router.push("/dashboard/profile")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              size="lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (loadingState === "error" && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CloudOff className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">
              Weather Unavailable
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {errorMessage || "We couldn't fetch weather data for your location. Please check your internet connection and try again."}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full"
                size="lg"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/dashboard/profile")}
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Check Location Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state - show weather data
  if (!weatherData) {
    return <WeatherSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-4 md:px-6 py-0 sm:py-4 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-0 py-4 sm:py-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                Weather Forecast
              </h1>
              {lastUpdated && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Updated at {formatLastUpdated(lastUpdated)}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full shadow-md h-9 w-9 sm:h-10 sm:w-10"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Current Weather */}
        <div className="px-0 sm:px-0">
          <CurrentWeatherCard 
            data={weatherData.current} 
            location={weatherData.location} 
          />
        </div>

        {/* Hourly Forecast */}
        {weatherData.hourly.length > 0 && (
          <div className="px-0 sm:px-0">
            <HourlyForecastCard data={weatherData.hourly} />
          </div>
        )}

        {/* Daily Forecast */}
        {weatherData.daily.length > 0 && (
          <div className="px-0 sm:px-0">
            <DailyForecastCard 
              data={weatherData.daily}
              forecastInfo={weatherData.forecastInfo}
            />
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-xs sm:text-sm text-muted-foreground pb-4 px-4">
          <p>
            Weather data for {weatherData.location.name}
            {weatherData.location.region && `, ${weatherData.location.region}`}
            {weatherData.location.country && `, ${weatherData.location.country}`}
          </p>
        </div>
      </div>
    </div>
  )
}
