"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Clock, Droplets } from "lucide-react"

interface HourlyForecastProps {
  data: Array<{
    dt: number
    temp: number
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
}

function formatHour(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours()
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours} ${period}`
}

function isCurrentHour(timestamp: number): boolean {
  const now = new Date()
  const itemDate = new Date(timestamp * 1000)
  return now.getHours() === itemDate.getHours() && 
         now.getDate() === itemDate.getDate()
}

export function HourlyForecastCard({ data }: HourlyForecastProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-none sm:rounded-xl">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Hourly Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 sm:pb-4 px-3 sm:px-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 sm:gap-3 pb-2">
            {data.map((hour, idx) => {
              const isCurrent = isCurrentHour(hour.dt)
              return (
                <div
                  key={idx}
                  className={`min-w-[70px] sm:min-w-[90px] flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200
                    ${isCurrent 
                      ? "bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/50 shadow-md" 
                      : "bg-slate-100/80 dark:bg-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                    }`}
                >
                  <span className={`text-xs sm:text-sm font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                    {isCurrent ? "Now" : formatHour(hour.dt)}
                  </span>
                  
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hour.weather.icon}
                      alt={hour.weather.description}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                  
                  <span className={`text-base sm:text-lg font-bold ${isCurrent ? "text-primary" : ""}`}>
                    {Math.round(hour.temp)}°
                  </span>
                  
                  {hour.pop > 0 && (
                    <div className="flex items-center gap-1 text-blue-500">
                      <Droplets className="w-3 h-3" />
                      <span className="text-xs font-medium">{Math.round(hour.pop * 100)}%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
