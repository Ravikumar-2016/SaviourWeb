"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Droplets, ArrowUp, ArrowDown, Info } from "lucide-react"

interface DailyForecastProps {
  data: Array<{
    dt: number
    temp_min: number
    temp_max: number
    humidity: number
    wind_speed: number
    pop: number
    uv?: number
    sunrise?: string
    sunset?: string
    source?: "weatherapi" | "openweathermap" | "mock"
    weather: {
      main: string
      description: string
      icon: string
    }
  }>
  forecastInfo: {
    totalDays: number
    weatherApiDays: number
    openWeatherDays: number
    message: string
  }
}

function formatDay(timestamp: number): { day: string; date: string; isToday: boolean } {
  const date = new Date(timestamp * 1000)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  
  if (isToday) {
    return { day: "Today", date: "", isToday: true }
  }
  if (isTomorrow) {
    return { day: "Tomorrow", date: "", isToday: false }
  }
  
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    isToday: false
  }
}

function getUVColor(uv: number): string {
  if (uv <= 2) return "text-green-600"
  if (uv <= 5) return "text-yellow-600"
  if (uv <= 7) return "text-orange-600"
  if (uv <= 10) return "text-red-600"
  return "text-purple-600"
}

export function DailyForecastCard({ data, forecastInfo }: DailyForecastProps) {
  // Find min and max temperatures for the temperature bar
  const allMinTemps = data.map(d => d.temp_min)
  const allMaxTemps = data.map(d => d.temp_max)
  const overallMin = Math.min(...allMinTemps)
  const overallMax = Math.max(...allMaxTemps)
  const tempRange = overallMax - overallMin

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="w-5 h-5 text-primary" />
            {forecastInfo.totalDays}-Day Forecast
          </CardTitle>
          {forecastInfo.weatherApiDays > 0 && forecastInfo.openWeatherDays > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-xs">
                Days 1-{forecastInfo.weatherApiDays}: WeatherAPI
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Days {forecastInfo.weatherApiDays + 1}-{forecastInfo.totalDays}: OpenWeatherMap
              </Badge>
            </div>
          )}
        </div>
        <CardDescription className="flex items-center gap-1 text-xs mt-1">
          <Info className="w-3 h-3" />
          {forecastInfo.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          {data.map((day, idx) => {
            const { day: dayName, date, isToday } = formatDay(day.dt)
            
            // Calculate position for temperature bar
            const minPos = tempRange > 0 ? ((day.temp_min - overallMin) / tempRange) * 100 : 0
            const maxPos = tempRange > 0 ? ((day.temp_max - overallMin) / tempRange) * 100 : 100
            
            // Check if this day is from OpenWeatherMap (for visual indicator)
            const isFromOpenWeather = day.source === "openweathermap"
            
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 md:p-4 rounded-xl transition-all duration-200
                  ${isToday 
                    ? "bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/30" 
                    : isFromOpenWeather
                    ? "bg-slate-100/80 dark:bg-slate-700/60 border-l-2 border-blue-400"
                    : "bg-slate-100/60 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  }`}
              >
                {/* Day name */}
                <div className="w-20 md:w-24 shrink-0">
                  <span className={`font-medium ${isToday ? "text-primary" : ""}`}>
                    {dayName}
                  </span>
                  {date && (
                    <span className="text-xs text-muted-foreground block">{date}</span>
                  )}
                </div>

                {/* Weather icon and condition */}
                <div className="flex items-center gap-2 w-24 md:w-32 shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={day.weather.icon}
                      alt={day.weather.description}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground hidden md:block truncate max-w-[60px]">
                    {day.weather.main}
                  </span>
                </div>

                {/* Rain probability */}
                {day.pop > 0 && (
                  <div className="flex items-center gap-1 text-blue-500 w-12 shrink-0">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{Math.round(day.pop * 100)}%</span>
                  </div>
                )}
                {day.pop <= 0 && <div className="w-12 shrink-0" />}

                {/* Temperature bar and values */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {/* Min temp */}
                  <div className="flex items-center gap-1 w-12 shrink-0 justify-end">
                    <ArrowDown className="w-3 h-3 text-blue-400" />
                    <span className="text-sm text-muted-foreground">{Math.round(day.temp_min)}°</span>
                  </div>

                  {/* Temperature bar */}
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden relative min-w-[60px]">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-orange-500"
                      style={{
                        left: `${minPos}%`,
                        width: `${maxPos - minPos}%`,
                      }}
                    />
                  </div>

                  {/* Max temp */}
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <ArrowUp className="w-3 h-3 text-orange-500" />
                    <span className="text-sm font-medium">{Math.round(day.temp_max)}°</span>
                  </div>
                </div>

                {/* UV Index (if available) */}
                {day.uv !== undefined && (
                  <div className={`hidden lg:flex items-center gap-1 w-16 shrink-0 ${getUVColor(day.uv)}`}>
                    <span className="text-xs">UV {Math.round(day.uv)}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
