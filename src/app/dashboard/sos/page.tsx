"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, XCircle, MapPin, ImagePlus, AlertCircle, Loader2, Edit, Trash2, Eye, X, Clock, List } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useUserCity, getUserCoordinates } from "@/hooks/useUserCity"
import SOSEditModal from "@/components/Modals/SOSEditModal"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type EmergencyType =
  | "Medical Emergency"
  | "Fire Outbreak"
  | "Armed Robbery"
  | "Car Accident"
  | "Domestic Violence"
  | "Natural Disaster"
  | "Missing Person"
  | "Public Disturbance"
  | "Other"

type AlertLevel = "Low" | "Medium" | "High"

const emergencyTypes: EmergencyType[] = [
  "Medical Emergency",
  "Fire Outbreak",
  "Armed Robbery",
  "Car Accident",
  "Domestic Violence",
  "Natural Disaster",
  "Missing Person",
  "Public Disturbance",
  "Other",
]

const alertLevels: AlertLevel[] = ["Low", "Medium", "High"]

const alertLevelColors = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-red-500"
}

const emergencyTypeIcons = {
  "Medical Emergency": "🩺",
  "Fire Outbreak": "🔥",
  "Armed Robbery": "🔫",
  "Car Accident": "🚗",
  "Domestic Violence": "⚠️",
  "Natural Disaster": "🌪️",
  "Missing Person": "👤",
  "Public Disturbance": "🚨",
  "Other": "❓"
}

type SOSRequest = {
  id: string
  userId: string
  latitude: number
  longitude: number
  emergencyType: string
  alertLevel?: string
  urgency: "High" | "Medium" | "Low"
  description: string
  createdAt: unknown
  isPublic: boolean
  status?: string
  responderId?: string
  responderName?: string
  senderName?: string
  senderContact?: string
  address?: string
  imageUrl?: string
}

function normalizeCity(city: string | null): string | null {
  return city ? city.trim().toLowerCase() : null
}

function EmergencyTypePicker({
  selectedType,
  onSelect,
}: {
  selectedType: EmergencyType | null
  onSelect: (type: EmergencyType) => void
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Emergency Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {emergencyTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200 ${
              selectedType === type
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-gray-800"
            }`}
            onClick={() => onSelect(type)}
          >
            <span className="text-2xl mb-1">{emergencyTypeIcons[type]}</span>
            <span className="text-sm font-medium text-center">{type}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function AlertLevelPicker({
  selectedLevel,
  onSelect,
}: {
  selectedLevel: AlertLevel | null
  onSelect: (level: AlertLevel) => void
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Alert Level <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-3">
        {alertLevels.map((level) => (
          <button
            key={level}
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg border transition-all duration-200 ${
              selectedLevel === level
                ? `${alertLevelColors[level]} text-white font-bold shadow-md`
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => onSelect(level)}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SOSPage() {
  const { userCity, loading: userLoading, isProfileComplete } = useUserCity()
  const { toast } = useToast()
  const [sosToDelete, setSosToDelete] = useState<SOSRequest | null>(null)
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType | null>(null)
  const [selectedAlertLevel, setSelectedAlertLevel] = useState<AlertLevel>("High")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [canCancel, setCanCancel] = useState(false)
  const [cancelCountdown, setCancelCountdown] = useState(5)
  
  // Manage My SOS state
  const [viewMode, setViewMode] = useState<"create" | "manage">("create")
  const [mySosRequests, setMySosRequests] = useState<SOSRequest[]>([])
  const [mySosLoading, setMySosLoading] = useState(true)
  const [editingSOS, setEditingSOS] = useState<SOSRequest | null>(null)
  const [selectedSOS, setSelectedSOS] = useState<SOSRequest | null>(null)

  // Get location from user profile
  const profileCoords = getUserCoordinates(userCity)
  
  // Fetch current user's SOS requests
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    
    const q = query(
      collection(db, "sos_requests"),
      where("userId", "==", user.uid)
    )
    
    const unsub = onSnapshot(q, (snapshot) => {
      const requests: SOSRequest[] = []
      snapshot.forEach((docSnap) => {
        requests.push({
          id: docSnap.id,
          ...docSnap.data()
        } as SOSRequest)
      })
      // Sort by createdAt descending
      requests.sort((a, b) => {
        const aTime = a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt 
          ? (a.createdAt as { seconds: number }).seconds : 0
        const bTime = b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt 
          ? (b.createdAt as { seconds: number }).seconds : 0
        return bTime - aTime
      })
      setMySosRequests(requests)
      setMySosLoading(false)
    })
    
    return () => unsub()
  }, [userCity.uid])

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined
    if (sosSent && canCancel) {
      if (cancelCountdown > 0) {
        timerId = setTimeout(() => setCancelCountdown(cancelCountdown - 1), 1000)
      } else {
        setCanCancel(false)
      }
    }
    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [sosSent, canCancel, cancelCountdown])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 500KB.",
        variant: "destructive",
      })
      return
    }
    setImageFile(file)
  }

  const uploadImageAsBase64 = async (file: File): Promise<string> => {
    setImageUploading(true)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(",")[1]
        if (base64String.length > 1000000) {
          setImageUploading(false)
          reject(new Error("Image too large for Firestore."))
          return
        }
        const dataUrl = `data:${file.type};base64,${base64String}`
        try {
          const user = auth.currentUser
          if (!user) throw new Error("User not authenticated")
          await addDoc(collection(db, "sos_images"), {
            userId: user.uid,
            imageData: dataUrl,
            uploadedAt: new Date().toISOString(),
            contentType: file.type,
            purpose: "sos_request",
          })
          setImageUploading(false)
          resolve(dataUrl)
        } catch (err) {
          setImageUploading(false)
          reject(err)
        }
      }
      reader.onerror = () => {
        setImageUploading(false)
        reject(new Error("Failed to read image file."))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSendSOS = async () => {
    if (!selectedEmergencyType) {
      toast({
        title: "Missing information",
        description: "Please select an emergency type.",
        variant: "destructive",
      })
      return
    }
    if (!profileCoords) {
      toast({
        title: "Location not available",
        description: "Please set your city in your profile first.",
        variant: "destructive",
      })
      return
    }
    
    setIsSending(true)
    try {
      const user = auth.currentUser
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to send SOS.",
          variant: "destructive",
        })
        setIsSending(false)
        return
      }
      
      // Process image upload
      let imageUrl: string | null = null
      if (imageFile) {
        try {
          imageUrl = await uploadImageAsBase64(imageFile)
        } catch (error) {
          console.error("Image upload error:", error)
        }
      }
      
      // Create the SOS document using profile location
      await addDoc(collection(db, "sos_requests"), {
        userId: user.uid,
        latitude: profileCoords.latitude,
        longitude: profileCoords.longitude,
        city: normalizeCity(userCity.city),
        state: userCity.state || null,
        country: userCity.country || null,
        emergencyType: selectedEmergencyType,
        alertLevel: selectedAlertLevel,
        description,
        createdAt: serverTimestamp(),
        isPublic: true,
        senderName: user.displayName || user.email?.split('@')[0] || "Anonymous",
        senderContact: user.phoneNumber || user.email || "",
        imageUrl: imageUrl,
        status: "active",
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        }
      })
      
      setSosSent(true)
      setCanCancel(true)
      setCancelCountdown(5)
    } catch (e) {
      console.error("SOS submission error:", e)
      toast({
        title: "Failed to send SOS",
        description: "Please try again.",
        variant: "destructive",
      })
    }
    setIsSending(false)
  }

  const handleCancelSOS = () => {
    setSosSent(false)
    setCanCancel(false)
    setSelectedEmergencyType(null)
    setSelectedAlertLevel("High")
    setDescription("")
    setImageFile(null)
    setImagePreview(null)
    toast({
      title: "SOS Cancelled",
      description: "Your SOS alert has been cancelled.",
    })
  }

  // Delete SOS handler
  const handleDeleteSOS = async (sos: SOSRequest) => {
    setSosToDelete(sos)
  }

  // Confirm delete SOS
  const confirmDeleteSOS = async () => {
    if (!sosToDelete) return
    try {
      await deleteDoc(doc(db, "sos_requests", sosToDelete.id))
      setSelectedSOS(null)
      toast({
        title: "SOS Deleted",
        description: "Your SOS request has been deleted.",
      })
    } catch (e) {
      console.error("Error deleting SOS:", e)
      toast({
        title: "Failed to delete",
        description: "Failed to delete SOS. Please try again.",
        variant: "destructive",
      })
    }
    setSosToDelete(null)
  }

  // Update SOS handler
  const handleUpdateSOS = (sos: SOSRequest) => {
    setSelectedSOS(null)
    setEditingSOS(sos)
  }

  // Format timestamp
  const formatTime = (timestamp: unknown) => {
    if (!timestamp || typeof timestamp !== 'object' || !('seconds' in timestamp)) return "Unknown"
    const date = new Date((timestamp as { seconds: number }).seconds * 1000)
    return date.toLocaleString()
  }

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <span className="text-gray-600">Loading your profile...</span>
        </div>
      </div>
    )
  }

  // No city set - prompt user to set location
  if (!isProfileComplete || !userCity.city || !profileCoords) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Emergency Alert System</h1>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Location Required</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              To use the emergency alert system, please set your city and location in your profile first.
              This ensures responders can locate you quickly.
            </p>
            <Button asChild>
              <Link href="/dashboard/profile">Update Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage SOS</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create emergency alerts or manage your existing SOS requests
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          <Button
            variant={viewMode === "create" ? "default" : "outline"}
            onClick={() => setViewMode("create")}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Create SOS
          </Button>
          <Button
            variant={viewMode === "manage" ? "default" : "outline"}
            onClick={() => setViewMode("manage")}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            My SOS Requests
            {mySosRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">{mySosRequests.length}</Badge>
            )}
          </Button>
        </div>

        {viewMode === "manage" ? (
          /* Manage My SOS Section */
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                My SOS Requests
              </CardTitle>
              <CardDescription>
                View, update, or delete your emergency alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mySosLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : mySosRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">You haven&apos;t created any SOS requests yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setViewMode("create")}
                    className="mt-2"
                  >
                    Create your first SOS
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySosRequests.map((sos) => (
                    <Card key={sos.id} className="relative border-l-4" style={{ borderLeftColor: alertLevelColors[(sos.urgency || sos.alertLevel) as keyof typeof alertLevelColors]?.replace('bg-', '#') || '#6366f1' }}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{emergencyTypeIcons[sos.emergencyType as keyof typeof emergencyTypeIcons] || "❓"}</span>
                          <span className="font-bold">{sos.emergencyType}</span>
                          <Badge className={alertLevelColors[(sos.urgency || sos.alertLevel) as keyof typeof alertLevelColors] || "bg-gray-500"}>
                            {sos.urgency || sos.alertLevel}
                          </Badge>
                          <Badge variant={sos.status === "responded" ? "default" : "outline"} className="ml-auto">
                            {sos.status || "active"}
                          </Badge>
                        </div>
                        {sos.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{sos.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <MapPin className="w-4 h-4" />
                          {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Clock className="w-4 h-4" />
                          {formatTime(sos.createdAt)}
                        </div>
                        {sos.responderId && (
                          <div className="text-sm text-green-600 dark:text-green-400 mb-3 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Responded by: {sos.responderName || "Someone"}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedSOS(sos)} className="flex-1 sm:flex-none min-w-[70px]">
                            <Eye className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateSOS(sos)} className="flex-1 sm:flex-none min-w-[80px]">
                            <Edit className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Update</span>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSOS(sos)} className="flex-1 sm:flex-none min-w-[80px]">
                            <Trash2 className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Create SOS Section */
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-indigo-600 dark:bg-indigo-800 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {sosSent ? "Alert Activated" : "Initiate Emergency Alert"}
                  </CardTitle>
                  <CardDescription className="text-indigo-100">
                    {sosSent 
                      ? "Responders have been notified of your situation" 
                    : "Fill in the details below to request assistance"}
                </CardDescription>
              </div>
              <div className={`p-3 rounded-full ${sosSent ? 'bg-green-500' : 'bg-red-500'} shadow-md`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {sosSent ? (
              <div className="flex flex-col items-center py-8 space-y-6">
                <div className="relative">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <div className="absolute -inset-4 border-4 border-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Alert Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Your location and emergency details have been dispatched to nearby responders.
                    Stay calm and wait for assistance.
                  </p>
                </div>
                
                {canCancel && (
                  <div className="w-full max-w-xs space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">
                        You can cancel this alert within the next:
                      </p>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {cancelCountdown} seconds
                      </div>
                    </div>
                    <Progress value={(cancelCountdown / 5) * 100} className="h-2" />
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelSOS}
                      className="w-full py-6 text-lg font-bold"
                    >
                      Cancel Emergency Alert
                    </Button>
                  </div>
                )}
                
                {!canCancel && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSosSent(false)}
                    className="mt-4"
                  >
                    Back to Alert Form
                  </Button>
                )}
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={e => {
                  e.preventDefault()
                  handleSendSOS()
                }}
              >
                <EmergencyTypePicker 
                  selectedType={selectedEmergencyType} 
                  onSelect={setSelectedEmergencyType} 
                />
                
                <AlertLevelPicker 
                  selectedLevel={selectedAlertLevel} 
                  onSelect={setSelectedAlertLevel} 
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Details (optional)
                  </label>
                  <Textarea
                    placeholder="Provide more information about the emergency (e.g., number of people involved, specific injuries, description of suspects, etc.)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="min-h-[120px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attach Photo (optional)
                    <span className="text-xs text-gray-500 ml-1">Max 500KB</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add Photo</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        disabled={imageUploading}
                        className="hidden" 
                      />
                    </label>
                    
                    {imageUploading && (
                      <div className="flex items-center justify-center w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    )}
                    
                    {imagePreview && !imageUploading && (
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={imagePreview} 
                          alt="Emergency preview" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                        >
                          <XCircle className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">Your Location</h4>
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                          ✓ From Profile
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Coordinates: {profileCoords.latitude.toFixed(6)}, {profileCoords.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div className="mt-1 p-1.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-1.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Location:</span> {userCity.city}
                          {userCity.state ? `, ${userCity.state}` : ""}
                          {userCity.country ? `, ${userCity.country}` : ""}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Update your location in <Link href="/dashboard/profile" className="text-indigo-600 hover:underline">Profile Settings</Link>
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full py-6 text-lg font-bold shadow-lg"
                  disabled={isSending || imageUploading}
                >
                  {isSending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Emergency Alert...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      SEND EMERGENCY ALERT
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By sending this alert, you agree to share your location and emergency details with responders.
                  Only use for genuine emergencies.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      )}

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>In case you can&apos;t use this form, call emergency services directly.</p>
        </div>
      </div>

      {/* SOS Edit Modal */}
      <SOSEditModal
        visible={!!editingSOS}
        sosRequest={editingSOS}
        onClose={() => setEditingSOS(null)}
        onUpdate={() => setEditingSOS(null)}
      />

      {/* SOS Detail Modal */}
      {selectedSOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg p-6 relative mx-4">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              onClick={() => setSelectedSOS(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{emergencyTypeIcons[selectedSOS.emergencyType as keyof typeof emergencyTypeIcons] || "❓"}</span>
              <span className="font-bold text-lg">{selectedSOS.emergencyType}</span>
              <Badge className={alertLevelColors[(selectedSOS.urgency || selectedSOS.alertLevel) as keyof typeof alertLevelColors] || "bg-gray-500"}>
                {selectedSOS.urgency || selectedSOS.alertLevel}
              </Badge>
            </div>
            <Badge variant={selectedSOS.status === "responded" ? "default" : "outline"} className="mb-3">
              Status: {selectedSOS.status || "active"}
            </Badge>
            {selectedSOS.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{selectedSOS.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4" />
              Coordinates: {selectedSOS.latitude.toFixed(6)}, {selectedSOS.longitude.toFixed(6)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Clock className="w-4 h-4" />
              Created: {formatTime(selectedSOS.createdAt)}
            </div>
            {selectedSOS.responderId && (
              <div className="text-sm text-green-600 dark:text-green-400 mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Responded by: {selectedSOS.responderName || "Someone"}
              </div>
            )}
            {selectedSOS.imageUrl && (
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedSOS.imageUrl} 
                  alt="SOS attachment" 
                  className="w-full max-h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleUpdateSOS(selectedSOS)}>
                <Edit className="w-4 h-4 mr-1" /> Update
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteSOS(selectedSOS)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!sosToDelete} onOpenChange={(open) => !open && setSosToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SOS Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this SOS request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSOS} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
