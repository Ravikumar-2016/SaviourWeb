"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUserCity, getUserCoordinates } from "@/hooks/useUserCity"

type Alert = {
  id: string
  type: "warning" | "info" | "danger"
  title: string
  message: string
  location: string
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

export default function AlertsPage() {
  const { userCity, loading: userLoading, isProfileComplete } = useUserCity()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch alerts from Gemini API using user's profile location
  useEffect(() => {
    if (userLoading) return
    
    const coords = getUserCoordinates(userCity)
    if (!coords) {
      setLoading(false)
      return
    }

    async function fetchAlerts() {
      setLoading(true)
      setError(null)
      try {
        const prompt = `Give me a list of important public safety alerts (weather, disaster, crime, traffic, health, etc.) for the area at latitude ${coords!.latitude}, longitude ${coords!.longitude} (${userCity.city || "Unknown"}, ${userCity.state || ""}, ${userCity.country || ""}) from today to the previous 7 days. Format each alert as: {type: warning|info|danger, title, message, location}. Return as JSON array only, no markdown.`
        
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        })
        const data = await response.json()
        
        let alertsArr: Alert[] = []
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          try {
            const text = data.candidates[0].content.parts[0].text
            // Try to parse directly
            alertsArr = JSON.parse(text)
          } catch {
            // Try to extract JSON from text
            const match = data.candidates[0].content.parts[0].text.match(/\[[\s\S]*\]/)
            if (match) {
              try {
                alertsArr = JSON.parse(match[0])
              } catch {
                alertsArr = []
              }
            }
          }
        }
        
        // Add IDs if missing
        alertsArr = alertsArr.map((alert, idx) => ({
          ...alert,
          id: alert.id || `alert-${idx}`
        }))
        
        setAlerts(alertsArr)
      } catch (err) {
        console.error("Error fetching alerts:", err)
        setError("Failed to fetch alerts. Please try again.")
        setAlerts([])
      }
      setLoading(false)
    }
    
    fetchAlerts()
  }, [userCity, userLoading])

  // Loading state
  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-gray-600">Loading your profile...</span>
      </div>
    )
  }

  // No city set
  if (!isProfileComplete || !userCity.city) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Real-Time Alerts</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Set Your Location</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please set your city in your profile to receive alerts for your area.
          </p>
          <Button asChild>
            <Link href="/dashboard/profile">Update Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Alerts</h2>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            Showing alerts for {userCity.city}{userCity.state ? `, ${userCity.state}` : ""}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-red-600 mb-2 p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
          <span className="text-gray-600">Loading alerts for {userCity.city}...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p>No alerts found for your area in the past week.</p>
              <p className="text-sm mt-1">This is good news! Stay safe.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    {alert.type === "warning" && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
                    {alert.type === "info" && <Info className="mr-2 h-5 w-5 text-blue-500" />}
                    {alert.type === "danger" && <Bell className="mr-2 h-5 w-5 text-red-500" />}
                    {alert.title}
                  </CardTitle>
                  <Badge
                    variant={alert.type === "warning" ? "default" : alert.type === "danger" ? "destructive" : "secondary"}
                  >
                    {alert.type.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="mr-1 h-4 w-4" />
                    {alert.location}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
