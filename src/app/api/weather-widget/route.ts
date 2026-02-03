import { NextRequest, NextResponse } from "next/server"
import { safeError, isProduction } from "@/lib/env"

// Server-side only API key (no NEXT_PUBLIC_ prefix)
const OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY

interface WeatherData {
  name: string
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  wind: {
    speed: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    // Validate inputs
    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Missing latitude or longitude parameters" },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude values" },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Latitude or longitude out of valid range" },
        { status: 400 }
      )
    }

    // Check for API key
    if (!OPENWEATHER_API_KEY) {
      if (!isProduction()) {
        console.error("OPENWEATHERMAP_API_KEY is not configured")
      }
      return NextResponse.json(
        { error: "Weather service is not configured" },
        { status: 503 }
      )
    }

    // Fetch from OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      safeError("OpenWeatherMap API error", response.status)
      return NextResponse.json(
        { error: "Failed to fetch weather data" },
        { status: response.status }
      )
    }

    const data: WeatherData = await response.json()

    // Return only necessary data (don't expose raw API response)
    return NextResponse.json({
      name: data.name,
      weather: data.weather.map(w => ({
        main: w.main,
        description: w.description,
        icon: w.icon,
      })),
      main: {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
      },
      wind: {
        speed: data.wind.speed,
      },
    })
  } catch (error) {
    safeError("Weather widget API error", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
