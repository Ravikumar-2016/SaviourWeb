"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Save, User, Phone, Loader2, CheckCircle2, AlertCircle, Globe, AlertTriangle, Info } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { User as UserType } from "@/types/user"

interface GeocodingResult {
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validatingLocation, setValidatingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationValidated, setLocationValidated] = useState(false)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  
  // Form fields
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [photoURL, setPhotoURL] = useState("")
  
  const { user, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Auth state and redirect if not logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/login")
      }
    })
    return () => unsubscribe()
  }, [router])

  // Fetch profile data
  useEffect(() => {
    if (!user) return
    
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data() as UserType
          setFullName(data.fullName || "")
          setPhone(data.phone || "")
          setCity(data.city || "")
          setState(data.state || "")
          setCountry(data.country || "")
          setLatitude(data.latitude)
          setLongitude(data.longitude)
          setPhotoURL(data.photoURL || "")
          
          // If location already set, mark as validated
          if (data.city && data.latitude && data.longitude) {
            setLocationValidated(true)
          }
          
          // Check if this is first time user (no city set)
          if (!data.city) {
            setIsFirstTimeUser(true)
            toast({
              variant: "warning",
              title: "⚠️ Complete Your Profile",
              description: "Please add your city information to access all dashboard features.",
            })
          }
        } else {
          // Create initial user doc if it doesn't exist - this is a first time user
          setIsFirstTimeUser(true)
          const initialData = {
            uid: user.uid,
            email: user.email || "",
            fullName: user.displayName || "",
            provider: "email",
            photoURL: user.photoURL || "",
            createdAt: new Date().toISOString(),
          }
          await setDoc(doc(db, "users", user.uid), initialData)
          setFullName(user.displayName || "")
          setPhotoURL(user.photoURL || "")
          
          toast({
            variant: "warning",
            title: "👋 Welcome to Saviour!",
            description: "Please complete your profile with city information to unlock all features.",
          })
        }
      } catch (e) {
        console.error("Error fetching profile:", e)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile. Please refresh the page.",
        })
      }
      setLoading(false)
    }
    
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Validate location using geocoding API
  const validateLocation = useCallback(async () => {
    if (!city.trim()) {
      setLocationError("Please enter a city name")
      return false
    }

    setValidatingLocation(true)
    setLocationError(null)
    setLocationValidated(false)

    try {
      // Build search query
      const searchQuery = [city, state, country].filter(Boolean).join(", ")
      
      // Use OpenStreetMap Nominatim API for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Saviour-App"
          }
        }
      )

      if (!response.ok) {
        throw new Error("Geocoding service unavailable")
      }

      const data = await response.json()

      if (data.length === 0) {
        setLocationError("Location not found. Please check your city, state, and country.")
        return false
      }

      const result = data[0]
      const address = result.address || {}

      // Extract location details
      const geocodedResult: GeocodingResult = {
        city: address.city || address.town || address.village || address.municipality || city,
        state: address.state || address.region || state,
        country: address.country || country,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }

      // Update form with validated data
      setCity(geocodedResult.city)
      setState(geocodedResult.state)
      setCountry(geocodedResult.country)
      setLatitude(geocodedResult.latitude)
      setLongitude(geocodedResult.longitude)
      setLocationValidated(true)
      
      toast({
        variant: "success",
        title: "✅ Location Validated!",
        description: `Found: ${geocodedResult.city}, ${geocodedResult.state || ''} ${geocodedResult.country || ''}`.trim(),
      })

      return true
    } catch (error) {
      console.error("Geocoding error:", error)
      setLocationError("Unable to validate location. Please try again.")
      toast({
        variant: "destructive",
        title: "Location Not Found",
        description: "Please check your city name and try again.",
      })
      return false
    } finally {
      setValidatingLocation(false)
    }
  }, [city, state, country, toast])

  // Handle location change - reset validation
  const handleLocationChange = (field: "city" | "state" | "country", value: string) => {
    setLocationValidated(false)
    setLocationError(null)
    
    switch (field) {
      case "city":
        setCity(value)
        break
      case "state":
        setState(value)
        break
      case "country":
        setCountry(value)
        break
    }
  }

  // Save profile
  const saveProfile = async () => {
    if (!user) return
    
    // Validate required fields
    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Full Name Required",
        description: "Please enter your full name to continue.",
      })
      return
    }
    
    if (!city.trim()) {
      toast({
        variant: "destructive",
        title: "City Required",
        description: "City information is mandatory to access dashboard features.",
      })
      return
    }

    // Location must be validated before saving
    if (!locationValidated) {
      toast({
        variant: "warning",
        title: "Location Not Validated",
        description: "Please click 'Validate Location' button to verify your location before saving.",
      })
      return
    }

    setSaving(true)
    
    try {
      const updateData: Partial<UserType> = {
        fullName,
        phone: phone || undefined,
        city,
        state: state || undefined,
        country: country || undefined,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      }
      
      // Use setDoc with merge for first-time users to ensure document exists
      if (isFirstTimeUser) {
        await setDoc(doc(db, "users", user.uid), {
          ...updateData,
          uid: user.uid,
          email: user.email || "",
          provider: "email",
          photoURL: photoURL || user.photoURL || "",
        }, { merge: true })
      } else {
        await updateDoc(doc(db, "users", user.uid), updateData)
      }
      
      await refreshProfile()
      setIsFirstTimeUser(false)
      
      toast({
        variant: "success",
        title: "✅ Profile Saved Successfully!",
        description: isFirstTimeUser 
          ? "Welcome! You now have full access to all dashboard features."
          : "Your profile information has been updated.",
      })
      
      // Redirect to dashboard after first-time profile completion
      if (isFirstTimeUser) {
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        variant: "destructive",
        title: "Failed to Save Profile",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Skeleton className="h-12 w-1/3 rounded-lg" />
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-indigo-600 dark:bg-indigo-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription className="text-indigo-100">
                  Manage your account information
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-indigo-600 dark:text-indigo-400">
                {user?.email}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* First Time User Warning Banner */}
            {isFirstTimeUser && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-amber-800">Complete Your Profile to Continue</h4>
                  <p className="text-sm text-amber-700">
                    <strong>City information is mandatory</strong> to access all dashboard features including weather alerts, 
                    community chat, and emergency services. Please fill in at least your <strong>Full Name</strong> and <strong>City</strong> to unlock the dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Profile Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                {photoURL ? (
                  <AvatarImage src={photoURL} alt={fullName} />
                ) : null}
                <AvatarFallback className="bg-indigo-100 text-indigo-800 text-3xl">
                  {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info Message for Required Fields */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>Fields marked with <span className="text-red-500 font-bold">*</span> are required.</span>
            </div>

            {/* Error Message */}
            {locationError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{locationError}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-indigo-600" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="h-12 bg-white dark:bg-gray-800"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4 text-indigo-600" />
                Contact Number
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                type="tel"
                className="h-12 bg-white dark:bg-gray-800"
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Location Information
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 ml-2">
                  Required
                </Badge>
              </h3>
              <p className="text-sm text-gray-500">
                Enter your city and optionally state/country for accurate location services.
              </p>
              
              {/* City is mandatory notice */}
              {!city && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span><strong>City is mandatory</strong> - Without city, you cannot access other dashboard features.</span>
                </div>
              )}

              {/* City */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={city}
                  onChange={(e) => handleLocationChange("city", e.target.value)}
                  placeholder="Enter your city"
                  className="h-12 bg-white dark:bg-gray-800"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  State / Region
                </label>
                <Input
                  value={state}
                  onChange={(e) => handleLocationChange("state", e.target.value)}
                  placeholder="Enter your state or region"
                  className="h-12 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <Input
                  value={country}
                  onChange={(e) => handleLocationChange("country", e.target.value)}
                  placeholder="Enter your country"
                  className="h-12 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Validate Location Button */}
              <Button
                type="button"
                variant="outline"
                onClick={validateLocation}
                disabled={validatingLocation || !city.trim()}
                className="w-full h-12"
              >
                {validatingLocation ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validating Location...
                  </span>
                ) : locationValidated ? (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Location Validated
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Validate Location
                  </span>
                )}
              </Button>

              {/* Show coordinates if validated */}
              {locationValidated && latitude && longitude && (
                <p className="text-xs text-gray-500 text-center">
                  Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={saveProfile}
              disabled={saving || !fullName.trim() || !city.trim() || !locationValidated}
              className="w-full h-14 text-lg font-bold shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : !locationValidated ? (
                <span className="flex items-center gap-2 text-gray-400">
                  <AlertTriangle className="w-5 h-5" />
                  Validate Location First
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Profile
                </span>
              )}
            </Button>
            
            {/* Hint message when save is disabled */}
            {!locationValidated && city.trim() && (
              <p className="text-center text-sm text-amber-600 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Please click &quot;Validate Location&quot; button above to enable saving
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
