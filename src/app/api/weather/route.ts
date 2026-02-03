import { NextRequest, NextResponse } from "next/server"
import { safeError, isProduction } from "@/lib/env"

// API keys - server-side only (no NEXT_PUBLIC_ prefix for security)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY

// Types for WeatherAPI.com
interface WeatherCondition {
  text: string
  icon: string
  code: number
}

interface WeatherAPIHour {
  time_epoch: number
  time: string
  temp_c: number
  temp_f: number
  is_day: number
  condition: WeatherCondition
  wind_mph: number
  wind_kph: number
  wind_degree: number
  wind_dir: string
  pressure_mb: number
  humidity: number
  feelslike_c: number
  chance_of_rain: number
  chance_of_snow: number
  uv: number
}

interface WeatherAPIDay {
  maxtemp_c: number
  mintemp_c: number
  avgtemp_c: number
  maxwind_kph: number
  avghumidity: number
  daily_chance_of_rain: number
  daily_chance_of_snow: number
  condition: WeatherCondition
  uv: number
}

interface WeatherAPIAstro {
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  moon_phase: string
}

interface WeatherAPIForecastDay {
  date: string
  date_epoch: number
  day: WeatherAPIDay
  astro: WeatherAPIAstro
  hour: WeatherAPIHour[]
}

interface WeatherAPILocation {
  name: string
  region: string
  country: string
  lat: number
  lon: number
  tz_id: string
  localtime_epoch: number
  localtime: string
}

interface WeatherAPICurrent {
  last_updated_epoch: number
  temp_c: number
  is_day: number
  condition: WeatherCondition
  wind_kph: number
  wind_degree: number
  wind_dir: string
  pressure_mb: number
  humidity: number
  feelslike_c: number
  uv: number
  vis_km: number
}

interface WeatherAPIResponse {
  location: WeatherAPILocation
  current: WeatherAPICurrent
  forecast: {
    forecastday: WeatherAPIForecastDay[]
  }
}

// Types for OpenWeatherMap
interface OpenWeatherMapWeather {
  id: number
  main: string
  description: string
  icon: string
}

interface OpenWeatherMapMain {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

interface OpenWeatherMapWind {
  speed: number
  deg: number
}

interface OpenWeatherMapCurrent {
  weather: OpenWeatherMapWeather[]
  main: OpenWeatherMapMain
  wind: OpenWeatherMapWind
  visibility: number
  dt: number
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  name: string
}

interface OpenWeatherMapForecastItem {
  dt: number
  main: OpenWeatherMapMain
  weather: OpenWeatherMapWeather[]
  wind: OpenWeatherMapWind
  visibility: number
  pop: number
  dt_txt: string
}

interface OpenWeatherMapForecast {
  list: OpenWeatherMapForecastItem[]
  city: {
    name: string
    country: string
    timezone: number
    sunrise: number
    sunset: number
  }
}

// Unified response type
interface UnifiedWeatherResponse {
  source: "weatherapi" | "openweathermap" | "combined" | "mock"
  forecastInfo: {
    totalDays: number
    weatherApiDays: number
    openWeatherDays: number
    message: string
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
    source: "weatherapi" | "openweathermap" | "mock"
    weather: {
      main: string
      description: string
      icon: string
    }
  }>
}

// Helper functions
function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(deg / 22.5) % 16
  return directions[index]
}

function formatTimeFromTimestamp(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

// Fetch from WeatherAPI.com (primary - 3 days free tier)
async function fetchWeatherAPI(location: string): Promise<UnifiedWeatherResponse | null> {
  if (!WEATHER_API_KEY) return null

  try {
    // WeatherAPI free tier only supports 3 days forecast
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`
    const response = await fetch(url, { next: { revalidate: 300 } }) // Cache for 5 minutes

    if (!response.ok) {
      console.error("WeatherAPI error:", response.status)
      return null
    }

    const data: WeatherAPIResponse = await response.json()
    const now = new Date()
    const currentHour = now.getHours()
    const forecastDays = data.forecast.forecastday.length

    // Transform to unified format
    return {
      source: "weatherapi",
      forecastInfo: {
        totalDays: forecastDays,
        weatherApiDays: forecastDays,
        openWeatherDays: 0,
        message: `${forecastDays}-day forecast from WeatherAPI`
      },
      location: {
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        timezone: data.location.tz_id,
      },
      current: {
        temp: data.current.temp_c,
        feels_like: data.current.feelslike_c,
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb,
        wind_speed: data.current.wind_kph / 3.6, // Convert to m/s
        wind_deg: data.current.wind_degree,
        wind_dir: data.current.wind_dir,
        uvi: data.current.uv,
        visibility: data.current.vis_km,
        weather: {
          main: data.current.condition.text,
          description: data.current.condition.text,
          icon: `https:${data.current.condition.icon.replace("64x64", "128x128")}`,
        },
        sunrise: data.forecast.forecastday[0]?.astro.sunrise || "",
        sunset: data.forecast.forecastday[0]?.astro.sunset || "",
        is_day: data.current.is_day === 1,
      },
      hourly: data.forecast.forecastday.flatMap((day) =>
        day.hour
          .filter((hour) => {
            const hourDate = new Date(hour.time_epoch * 1000)
            return hourDate >= now || hourDate.getHours() >= currentHour
          })
          .map((hour) => ({
            dt: hour.time_epoch,
            temp: hour.temp_c,
            feels_like: hour.feelslike_c,
            humidity: hour.humidity,
            wind_speed: hour.wind_kph / 3.6,
            pop: hour.chance_of_rain / 100,
            uv: hour.uv,
            weather: {
              main: hour.condition.text,
              description: hour.condition.text,
              icon: `https:${hour.condition.icon.replace("64x64", "128x128")}`,
            },
          }))
      ).slice(0, 24),
      daily: data.forecast.forecastday.map((day) => ({
        dt: day.date_epoch,
        temp_min: day.day.mintemp_c,
        temp_max: day.day.maxtemp_c,
        humidity: day.day.avghumidity,
        wind_speed: day.day.maxwind_kph / 3.6,
        pop: day.day.daily_chance_of_rain / 100,
        uv: day.day.uv,
        sunrise: day.astro.sunrise,
        sunset: day.astro.sunset,
        source: "weatherapi" as const,
        weather: {
          main: day.day.condition.text,
          description: day.day.condition.text,
          icon: `https:${day.day.condition.icon.replace("64x64", "128x128")}`,
        },
      })),
    }
  } catch (error) {
    console.error("WeatherAPI fetch error:", error)
    return null
  }
}

// Fetch from OpenWeatherMap (fallback - 5 days free tier)
async function fetchOpenWeatherMap(location: string): Promise<UnifiedWeatherResponse | null> {
  if (!OPENWEATHER_API_KEY) return null

  try {
    // Get current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    const currentResponse = await fetch(currentUrl, { next: { revalidate: 300 } })

    if (!currentResponse.ok) {
      console.error("OpenWeatherMap current error:", currentResponse.status)
      return null
    }

    const currentData: OpenWeatherMapCurrent = await currentResponse.json()

    // Get forecast (5-day / 3-hour forecast)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    const forecastResponse = await fetch(forecastUrl, { next: { revalidate: 300 } })

    if (!forecastResponse.ok) {
      console.error("OpenWeatherMap forecast error:", forecastResponse.status)
      return null
    }

    const forecastData: OpenWeatherMapForecast = await forecastResponse.json()

    // Process daily data from 3-hour forecasts (max 5 days)
    const dailyMap = new Map<string, { temps: number[]; item: OpenWeatherMapForecastItem }>()
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { temps: [], item })
      }
      dailyMap.get(date)!.temps.push(item.main.temp)
    })

    // OpenWeatherMap free tier provides 5-day forecast
    const daily = Array.from(dailyMap.entries()).slice(0, 5).map(([, data]) => ({
      dt: data.item.dt,
      temp_min: Math.min(...data.temps),
      temp_max: Math.max(...data.temps),
      humidity: data.item.main.humidity,
      wind_speed: data.item.wind.speed,
      pop: data.item.pop,
      source: "openweathermap" as const,
      weather: {
        main: data.item.weather[0].main,
        description: data.item.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.item.weather[0].icon}@2x.png`,
      },
    }))

    return {
      source: "openweathermap",
      forecastInfo: {
        totalDays: daily.length,
        weatherApiDays: 0,
        openWeatherDays: daily.length,
        message: `${daily.length}-day forecast from OpenWeatherMap`
      },
      location: {
        name: currentData.name,
        country: currentData.sys.country,
      },
      current: {
        temp: currentData.main.temp,
        feels_like: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        wind_speed: currentData.wind.speed,
        wind_deg: currentData.wind.deg,
        wind_dir: getWindDirection(currentData.wind.deg),
        uvi: null, // Not available in free tier
        visibility: currentData.visibility / 1000, // Convert to km
        weather: {
          main: currentData.weather[0].main,
          description: currentData.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@4x.png`,
        },
        sunrise: formatTimeFromTimestamp(currentData.sys.sunrise, currentData.timezone),
        sunset: formatTimeFromTimestamp(currentData.sys.sunset, currentData.timezone),
        is_day: currentData.dt > currentData.sys.sunrise && currentData.dt < currentData.sys.sunset,
      },
      hourly: forecastData.list.slice(0, 8).map((item) => ({
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        pop: item.pop,
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        },
      })),
      daily,
    }
  } catch (error) {
    console.error("OpenWeatherMap fetch error:", error)
    return null
  }
}

// Generate mock data for testing
function getMockWeatherData(cityName: string): UnifiedWeatherResponse {
  const now = new Date()
  const isDay = now.getHours() >= 6 && now.getHours() < 18

  return {
    source: "mock",
    forecastInfo: {
      totalDays: 5,
      weatherApiDays: 0,
      openWeatherDays: 0,
      message: "Demo data - Configure API keys for real weather"
    },
    location: {
      name: cityName,
      country: "Demo",
    },
    current: {
      temp: 24,
      feels_like: 26,
      humidity: 65,
      pressure: 1013,
      wind_speed: 3.5,
      wind_deg: 180,
      wind_dir: "S",
      uvi: 5,
      visibility: 10,
      weather: {
        main: "Clear",
        description: "Clear sky",
        icon: `https://openweathermap.org/img/wn/${isDay ? "01d" : "01n"}@4x.png`,
      },
      sunrise: "6:30 AM",
      sunset: "6:45 PM",
      is_day: isDay,
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      dt: Math.floor(now.getTime() / 1000) + i * 3600,
      temp: 20 + Math.sin(i / 4) * 8,
      humidity: 60 + Math.random() * 20,
      wind_speed: 2 + Math.random() * 3,
      pop: Math.random() * 0.3,
      uv: Math.max(0, 8 - Math.abs(i - 12)),
      weather: {
        main: "Clear",
        description: "Clear sky",
        icon: `https://openweathermap.org/img/wn/${i >= 6 && i < 18 ? "01d" : "01n"}@2x.png`,
      },
    })),
    daily: Array.from({ length: 5 }, (_, i) => ({
      dt: Math.floor(now.getTime() / 1000) + i * 86400,
      temp_min: 18 + Math.random() * 4,
      temp_max: 28 + Math.random() * 5,
      humidity: 55 + Math.random() * 25,
      wind_speed: 2 + Math.random() * 4,
      pop: Math.random() * 0.4,
      uv: 5 + Math.random() * 3,
      sunrise: "6:30 AM",
      sunset: "6:45 PM",
      source: "mock" as const,
      weather: {
        main: ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)],
        description: "Variable conditions",
        icon: `https://openweathermap.org/img/wn/02d@2x.png`,
      },
    })),
  }
}

// Fetch extended forecast from OpenWeatherMap to extend WeatherAPI data
async function fetchOpenWeatherMapExtended(location: string, startFromDay: number): Promise<UnifiedWeatherResponse["daily"] | null> {
  if (!OPENWEATHER_API_KEY) return null

  try {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    const forecastResponse = await fetch(forecastUrl, { next: { revalidate: 300 } })

    if (!forecastResponse.ok) return null

    const forecastData: OpenWeatherMapForecast = await forecastResponse.json()

    // Process daily data from 3-hour forecasts
    const dailyMap = new Map<string, { temps: number[]; item: OpenWeatherMapForecastItem }>()
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { temps: [], item })
      }
      dailyMap.get(date)!.temps.push(item.main.temp)
    })

    // Skip first N days (already covered by WeatherAPI), take remaining days
    return Array.from(dailyMap.entries())
      .slice(startFromDay, 5) // OpenWeatherMap provides up to 5 days
      .map(([, data]) => ({
        dt: data.item.dt,
        temp_min: Math.min(...data.temps),
        temp_max: Math.max(...data.temps),
        humidity: data.item.main.humidity,
        wind_speed: data.item.wind.speed,
        pop: data.item.pop,
        source: "openweathermap" as const,
        weather: {
          main: data.item.weather[0].main,
          description: data.item.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.item.weather[0].icon}@2x.png`,
        },
      }))
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const state = searchParams.get("state")
    const country = searchParams.get("country")

    // Input validation
    if (!city) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      )
    }

    // Sanitize input - only allow alphanumeric, spaces, and common punctuation
    const sanitizedCity = city.replace(/[^a-zA-Z0-9\s,.-]/g, '').substring(0, 100)
    const sanitizedState = state?.replace(/[^a-zA-Z0-9\s,.-]/g, '').substring(0, 100)
    const sanitizedCountry = country?.replace(/[^a-zA-Z0-9\s,.-]/g, '').substring(0, 100)

    // Build location query
    const locationParts = [sanitizedCity]
    if (sanitizedState) locationParts.push(sanitizedState)
    if (sanitizedCountry) locationParts.push(sanitizedCountry)
    const location = locationParts.join(", ")

    if (!isProduction()) {
      console.log("Fetching weather for:", location)
    }

    // Try WeatherAPI first (primary source - 3 days)
    const weatherApiData = await fetchWeatherAPI(location)

    if (weatherApiData) {
      // WeatherAPI succeeded - try to extend with OpenWeatherMap for days 4-5
      const extendedDays = await fetchOpenWeatherMapExtended(location, weatherApiData.daily.length)
      
      if (extendedDays && extendedDays.length > 0) {
        // Combine data: WeatherAPI (days 1-3) + OpenWeatherMap (days 4-5)
        const combinedDaily = [...weatherApiData.daily, ...extendedDays]
        const weatherApiDays = weatherApiData.daily.length
        const openWeatherDays = extendedDays.length
        
        return NextResponse.json({
          ...weatherApiData,
          source: "combined" as const,
          forecastInfo: {
            totalDays: combinedDaily.length,
            weatherApiDays,
            openWeatherDays,
            message: `${combinedDaily.length}-day forecast: Days 1-${weatherApiDays} from WeatherAPI, Days ${weatherApiDays + 1}-${combinedDaily.length} from OpenWeatherMap`
          },
          daily: combinedDaily
        })
      }
      
      // Return WeatherAPI only data
      return NextResponse.json(weatherApiData)
    }

    // Fallback to OpenWeatherMap only (5 days)
    const openWeatherData = await fetchOpenWeatherMap(location)

    if (openWeatherData) {
      return NextResponse.json(openWeatherData)
    }

    // If both APIs fail, return mock data (don't expose API key status)
    return NextResponse.json(getMockWeatherData(sanitizedCity))

  } catch (error) {
    safeError("Weather API error", error)
    const city = request.nextUrl.searchParams.get("city") || "Unknown"
    return NextResponse.json(getMockWeatherData(city))
  }
}
