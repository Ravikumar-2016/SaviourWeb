"use client"

import { Card, CardContent } from "@/components/ui/card"
import { 
  Droplets, 
  Wind, 
  Gauge, 
  Sun, 
  Sunrise, 
  Sunset,
  Eye,
  MapPin
} from "lucide-react"

interface CurrentWeatherProps {
  data: {
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
  location: {
    name: string
    region?: string
    country: string
  }
}

function getWeatherGradient(main: string, isDay: boolean): string {
  const condition = main.toLowerCase()
  
  if (!isDay) {
    return "from-slate-700 via-indigo-800 to-slate-900"
  }
  
  if (condition.includes("rain") || condition.includes("drizzle")) {
    return "from-slate-500 via-blue-600 to-slate-700"
  }
  if (condition.includes("thunder") || condition.includes("storm")) {
    return "from-slate-600 via-purple-700 to-slate-800"
  }
  if (condition.includes("cloud") || condition.includes("overcast")) {
    return "from-slate-400 via-slate-500 to-slate-600"
  }
  if (condition.includes("snow") || condition.includes("sleet")) {
    return "from-slate-200 via-blue-300 to-slate-400"
  }
  if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) {
    return "from-slate-300 via-slate-400 to-slate-500"
  }
  // Clear or sunny
  return "from-blue-400 via-sky-500 to-indigo-600"
}

function getUVLevel(uvi: number): { level: string; color: string; bgColor: string } {
  if (uvi <= 2) return { level: "Low", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" }
  if (uvi <= 5) return { level: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" }
  if (uvi <= 7) return { level: "High", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" }
  if (uvi <= 10) return { level: "Very High", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" }
  return { level: "Extreme", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" }
}

export function CurrentWeatherCard({ data, location }: CurrentWeatherProps) {
  const gradientClass = getWeatherGradient(data.weather.main, data.is_day)
  const uvInfo = data.uvi !== null ? getUVLevel(data.uvi) : null

  return (
    <Card className="overflow-hidden border-0 shadow-2xl">
      {/* Main weather display */}
      <div className={`bg-gradient-to-br ${gradientClass} p-6 md:p-8 text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          {/* Location */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 opacity-90" />
            <span className="font-medium text-lg">
              {location.name}
              {location.region && `, ${location.region}`}
              {location.country && `, ${location.country}`}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Temperature and condition */}
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-7xl md:text-8xl font-light tracking-tight">
                  {Math.round(data.temp)}
                </span>
                <span className="text-3xl md:text-4xl font-light mt-2">°C</span>
              </div>
              
              <p className="text-xl md:text-2xl font-medium capitalize opacity-95">
                {data.weather.description}
              </p>
              
              <p className="text-lg opacity-80">
                Feels like {Math.round(data.feels_like)}°C
              </p>
            </div>

            {/* Weather icon */}
            <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center drop-shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.weather.icon}
                alt={data.weather.description}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Sunrise/Sunset */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Sunrise className="w-5 h-5 opacity-80" />
              <span className="opacity-90">{data.sunrise}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="w-5 h-5 opacity-80" />
              <span className="opacity-90">{data.sunset}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather details */}
      <CardContent className="p-4 md:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Humidity */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30">
            <Droplets className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-muted-foreground">Humidity</span>
            <span className="text-lg font-semibold">{data.humidity}%</span>
          </div>

          {/* Wind */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/30">
            <Wind className="w-6 h-6 text-teal-500" />
            <span className="text-sm text-muted-foreground">Wind</span>
            <span className="text-lg font-semibold">{data.wind_speed.toFixed(1)} m/s {data.wind_dir}</span>
          </div>

          {/* Pressure */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30">
            <Gauge className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-muted-foreground">Pressure</span>
            <span className="text-lg font-semibold">{data.pressure} hPa</span>
          </div>

          {/* UV Index or Visibility */}
          {uvInfo ? (
            <div className={`flex flex-col items-center gap-2 p-4 rounded-xl ${uvInfo.bgColor} transition-colors`}>
              <Sun className={`w-6 h-6 ${uvInfo.color}`} />
              <span className="text-sm text-muted-foreground">UV Index</span>
              <span className={`text-lg font-semibold ${uvInfo.color}`}>
                {data.uvi} ({uvInfo.level})
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50">
              <Eye className="w-6 h-6 text-slate-500" />
              <span className="text-sm text-muted-foreground">Visibility</span>
              <span className="text-lg font-semibold">{data.visibility.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
