"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, AlertTriangle, CheckCircle, TrendingUp, Map, Book, Users as Community, Plus, HandHelping, X, Loader2, MapPin, CloudSun, Shield, Phone, Droplets, Wind, ThermometerSun, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import FirstAidTutorial from "@/components/Safety/First-Aid-Tutorial"
import FloodSafety from "@/components/Safety/Flood-Safety"
import EarthquakeSafety from "@/components/Safety/Earthquake-Safety"
import { useUserCity, getUserCoordinates } from "@/hooks/useUserCity"

interface WeatherData {
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: Array<{ main: string; description: string }>
  wind: { speed: number }
  name: string
}

export default function Dashboard() {
  const { userCity, loading: userLoading } = useUserCity()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [sosRaised, setSosRaised] = useState(0)
  const [sosResponded, setSosResponded] = useState(0)
  const [notificationsCount] = useState(0)
  const [openPopup, setOpenPopup] = useState<string | null>(null)
  const router = useRouter()

  // Fetch SOS stats
  const fetchSosStats = async (uid: string) => {
    try {
      const sosRaisedQuery = query(
        collection(db, "sos_requests"),
        where("userId", "==", uid)
      )
      const sosRaisedSnap = await getDocs(sosRaisedQuery)
      setSosRaised(sosRaisedSnap.size)

      const sosRespondedQuery = query(
        collection(db, "sos_requests"),
        where("responderId", "==", uid)
      )
      const sosRespondedSnap = await getDocs(sosRespondedQuery)
      setSosResponded(sosRespondedSnap.size)
    } catch {
      setSosRaised(0)
      setSosResponded(0)
    }
  }

  // Fetch weather using user's profile location
  useEffect(() => {
    if (userLoading) return
    
    const coords = getUserCoordinates(userCity)
    if (!coords) {
      setWeatherLoading(false)
      setWeatherError("Please set your city in your profile to see weather data.")
      return
    }

    const fetchWeather = async () => {
      setWeatherLoading(true)
      setWeatherError(null)
      try {
        // Use internal API route instead of direct external API call
        const weatherResp = await axios.get<WeatherData>(
          `/api/weather-widget?lat=${coords.latitude}&lon=${coords.longitude}`
        )
        setWeather(weatherResp.data)
      } catch (err) {
        console.error("Weather API error:", err)
        setWeatherError("Could not fetch weather data. Please try again later.")
        setWeather(null)
      } finally {
        setWeatherLoading(false)
      }
    }

    fetchWeather()
  }, [userCity, userLoading])

  // Fetch SOS stats when user is loaded
  useEffect(() => {
    if (userCity.uid) {
      fetchSosStats(userCity.uid)
    }
  }, [userCity.uid])

  if (userLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        
        {/* Weather Card Skeleton */}
        <Skeleton className="h-44 w-full rounded-2xl" />
        
        {/* Quick Actions Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const quickActions = [
    { 
      title: "Create SOS", 
      description: "Send emergency alert",
      icon: <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />, 
      gradient: "from-red-500 to-rose-600",
      hoverGradient: "hover:from-red-600 hover:to-rose-700",
      route: "/dashboard/sos" 
    },
    { 
      title: "View Map", 
      description: "See active emergencies",
      icon: <Map className="w-5 h-5 md:w-6 md:h-6" />, 
      gradient: "from-blue-500 to-indigo-600",
      hoverGradient: "hover:from-blue-600 hover:to-indigo-700",
      route: "/dashboard/navigation" 
    },
    { 
      title: "Resources", 
      description: "Share or request supplies",
      icon: <Book className="w-5 h-5 md:w-6 md:h-6" />, 
      gradient: "from-emerald-500 to-green-600",
      hoverGradient: "hover:from-emerald-600 hover:to-green-700",
      route: "/dashboard/resources" 
    },
    { 
      title: "Community", 
      description: "Chat with neighbors",
      icon: <Community className="w-5 h-5 md:w-6 md:h-6" />, 
      gradient: "from-violet-500 to-purple-600",
      hoverGradient: "hover:from-violet-600 hover:to-purple-700",
      route: "/dashboard/community" 
    },
  ]

  const safetyGuides = [
    { 
      title: "First Aid", 
      icon: <CheckCircle className="h-5 w-5" />, 
      description: "Essential emergency steps",
      key: "firstAid",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    { 
      title: "Flood Safety", 
      icon: <Droplets className="h-5 w-5" />, 
      description: "Flood survival guide",
      key: "floodSafety",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    { 
      title: "Earthquake", 
      icon: <TrendingUp className="h-5 w-5" />, 
      description: "Earthquake protocols",
      key: "earthquakeSafety",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
  ]

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes('cloud')) return '☁️'
    if (lowerCondition.includes('rain')) return '🌧️'
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return '☀️'
    if (lowerCondition.includes('snow')) return '❄️'
    if (lowerCondition.includes('thunder')) return '⛈️'
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️'
    return '🌤️'
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {greeting()}{userCity.fullName ? `, ${userCity.fullName}` : ""} 👋
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
        </div>
        {userCity.photoURL && (
          <Avatar className="h-12 w-12 border-2 border-white shadow-md hidden sm:flex">
            <AvatarImage src={userCity.photoURL} alt={userCity.fullName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              {userCity.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Weather Card - Enhanced */}
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <CardContent className="relative p-5 md:p-6 text-white">
          {weatherLoading ? (
            <div className="flex items-center gap-3 py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading weather...</span>
            </div>
          ) : weather ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="text-5xl md:text-6xl">
                  {getWeatherIcon(weather.weather[0].main)}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-bold">{Math.round(weather.main.temp)}°</span>
                    <span className="text-xl text-white/80">C</span>
                  </div>
                  <p className="text-lg capitalize text-white/90 mt-1">{weather.weather[0].description}</p>
                  <div className="flex items-center gap-1 text-sm text-white/70 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{userCity.city}{userCity.state ? `, ${userCity.state}` : ""}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 md:gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                  <ThermometerSun className="h-4 w-4 text-white/80" />
                  <div className="text-sm">
                    <span className="text-white/70">Feels </span>
                    <span className="font-medium">{Math.round(weather.main.feels_like)}°</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                  <Droplets className="h-4 w-4 text-white/80" />
                  <div className="text-sm">
                    <span className="text-white/70">Humidity </span>
                    <span className="font-medium">{weather.main.humidity}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                  <Wind className="h-4 w-4 text-white/80" />
                  <div className="text-sm">
                    <span className="text-white/70">Wind </span>
                    <span className="font-medium">{Math.round(weather.wind.speed)} m/s</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4">
              <CloudSun className="h-8 w-8 text-white/70" />
              <div>
                <p className="font-medium">Weather Unavailable</p>
                <p className="text-sm text-white/70">{weatherError || "Set your city in profile"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Enhanced */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            onClick={() => router.push('/dashboard/sos')}
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <button 
              key={index} 
              className={`group relative overflow-hidden bg-gradient-to-br ${action.gradient} ${action.hoverGradient} text-white p-4 md:p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-left`}
              onClick={() => router.push(action.route)}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  {action.icon}
                </div>
                <h3 className="font-semibold text-sm md:text-base">{action.title}</h3>
                <p className="text-xs text-white/80 mt-0.5 hidden md:block">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Safety Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="relative p-5 md:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <span className="font-medium">SOS Raised</span>
                  </div>
                  <div className="text-4xl font-bold">{sosRaised}</div>
                  <p className="text-sm text-white/70 mt-1">Total emergencies reported</p>
                </div>
                <div className="text-6xl font-bold text-white/10">🆘</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="relative p-5 md:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <HandHelping className="h-5 w-5" />
                    </div>
                    <span className="font-medium">SOS Responded</span>
                  </div>
                  <div className="text-4xl font-bold">{sosResponded}</div>
                  <p className="text-sm text-white/70 mt-1">People you helped</p>
                </div>
                <div className="text-6xl font-bold text-white/10">🤝</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Safety Guides - Enhanced */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Guides</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            onClick={() => router.push('/dashboard/safety')}
          >
            View All 12 Guides
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {safetyGuides.map((guide, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-300"
              onClick={() => setOpenPopup(guide.key)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${guide.bgColor}`}>
                    <div className={guide.color}>{guide.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {guide.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Shield className="h-5 w-5" />, label: "Safety", route: "/dashboard/safety", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/50" },
          { icon: <CloudSun className="h-5 w-5" />, label: "Weather", route: "/dashboard/weather", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
          { icon: <Phone className="h-5 w-5" />, label: "Emergency", route: "/dashboard/emergency", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50" },
          { icon: <Community className="h-5 w-5" />, label: "Profile", route: "/dashboard/profile", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/50" },
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.route)}
            className={`flex items-center gap-3 p-4 rounded-xl ${item.bg} hover:opacity-80 transition-all duration-200 group`}
          >
            <div className={item.color}>{item.icon}</div>
            <span className={`font-medium text-sm ${item.color}`}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Safety Guide Popup Modal */}
      {openPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpenPopup(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="p-6">
              {openPopup === "firstAid" && (
                <FirstAidTutorial
                  open={true}
                  onClose={() => setOpenPopup(null)}
                />
              )}
              {openPopup === "floodSafety" && (
                <FloodSafety
                  open={true}
                  onClose={() => setOpenPopup(null)}
                />
              )}
              {openPopup === "earthquakeSafety" && (
                <EarthquakeSafety
                  open={true}
                  onClose={() => setOpenPopup(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
