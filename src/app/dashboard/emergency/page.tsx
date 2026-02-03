"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Phone, Ambulance, Flame, Shield, Plus, Trash2, User, Heart, 
  MapPin, MessageSquare, Share2, Copy, Loader2, AlertTriangle,
  X, UserPlus, PhoneCall
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"

type PersonalContact = {
  id: string
  name: string
  relation: string
  phone: string
  userId: string
  createdAt: unknown
}

const NATIONAL_EMERGENCY_NUMBERS = [
  { name: "General Emergency", number: "112", icon: Phone, color: "bg-red-500", description: "All emergencies" },
  { name: "Police", number: "100", icon: Shield, color: "bg-blue-500", description: "Crime & security" },
  { name: "Fire", number: "101", icon: Flame, color: "bg-orange-500", description: "Fire emergencies" },
  { name: "Ambulance", number: "102", icon: Ambulance, color: "bg-green-500", description: "Medical emergencies" },
]

const SAFETY_TIPS = [
  "Stay calm and assess the situation before acting",
  "Always share your location with trusted contacts",
  "Keep emergency numbers saved offline",
  "Have a first aid kit ready at home",
]

export default function EmergencyHelpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<import("firebase/auth").User | null>(null)
  const [contacts, setContacts] = useState<PersonalContact[]>([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  
  // Add contact modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [formName, setFormName] = useState("")
  const [formRelation, setFormRelation] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formProcessing, setFormProcessing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auth check
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/login")
      } else {
        setUser(firebaseUser)
      }
    })
    return () => unsub()
  }, [router])

  // Fetch personal contacts
  useEffect(() => {
    if (!user) return
    
    setLoading(true)
    
    const contactsQuery = query(
      collection(db, "personal_contacts"),
      where("userId", "==", user.uid)
    )
    
    const unsub = onSnapshot(
      contactsQuery,
      (snapshot) => {
        const data: PersonalContact[] = []
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as PersonalContact)
        })
        // Sort by createdAt
        data.sort((a, b) => {
          const aTime = a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt 
            ? (a.createdAt as { seconds: number }).seconds : 0
          const bTime = b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt 
            ? (b.createdAt as { seconds: number }).seconds : 0
          return bTime - aTime
        })
        setContacts(data)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching contacts:", error)
        setContacts([])
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load contacts. Please refresh.",
          variant: "destructive",
        })
      }
    )
    
    return () => unsub()
  }, [user, toast])

  // Get current location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  // Share location
  const handleShareLocation = async () => {
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      setCurrentLocation(location)
      const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`
      
      if (navigator.share) {
        await navigator.share({
          title: "My Location",
          text: `I'm sharing my location with you: ${mapsUrl}`,
          url: mapsUrl,
        })
        toast({
          title: "Location Shared",
          description: "Your location has been shared successfully.",
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(mapsUrl)
        toast({
          title: "Location Copied",
          description: "Location link copied to clipboard. Share it via WhatsApp or SMS.",
        })
      }
    } catch (error) {
      console.error("Share location error:", error)
      toast({
        title: "Error",
        description: "Could not get your location. Please enable location services.",
        variant: "destructive",
      })
    } finally {
      setLocationLoading(false)
    }
  }

  // Send emergency SMS to a specific contact
  const handleSendSMS = async (phone: string, contactName?: string) => {
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`
      const message = encodeURIComponent(`🚨 EMERGENCY! I need urgent help. My location: ${mapsUrl}`)
      
      // Open SMS app with phone number and pre-filled message
      window.open(`sms:${phone}?body=${message}`, "_self")
      
      toast({
        title: "SMS Opened",
        description: contactName ? `Sending emergency SMS to ${contactName}` : "Send the emergency message now.",
      })
    } catch (error) {
      console.error("Emergency SMS error:", error)
      // Fallback without location
      const message = encodeURIComponent(`🚨 EMERGENCY! I need urgent help. Please call me immediately.`)
      window.open(`sms:${phone}?body=${message}`, "_self")
      toast({
        title: "SMS Opened",
        description: "Location unavailable. Send message manually.",
        variant: "destructive",
      })
    } finally {
      setLocationLoading(false)
    }
  }

  // Send emergency SMS (opens SMS app without recipient - user can choose)
  const handleEmergencySMS = async () => {
    if (contacts.length > 0) {
      // Show toast to guide user to select a contact
      toast({
        title: "Select a Contact",
        description: "Click the SMS button next to a contact to send emergency message.",
      })
      return
    }
    
    // If no contacts, open SMS app without recipient
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`
      const message = encodeURIComponent(`🚨 EMERGENCY! I need urgent help. My location: ${mapsUrl}`)
      window.open(`sms:?body=${message}`, "_self")
      toast({
        title: "SMS Opened",
        description: "Enter a phone number to send the message.",
      })
    } catch (error) {
      console.error("Emergency SMS error:", error)
      const message = encodeURIComponent(`🚨 EMERGENCY! I need urgent help. Please call me immediately.`)
      window.open(`sms:?body=${message}`, "_self")
    } finally {
      setLocationLoading(false)
    }
  }

  // Add contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    if (!formName.trim() || !formRelation.trim() || !formPhone.trim()) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive",
      })
      return
    }
    
    setFormProcessing(true)
    try {
      await addDoc(collection(db, "personal_contacts"), {
        userId: user.uid,
        name: formName.trim(),
        relation: formRelation.trim(),
        phone: formPhone.trim(),
        createdAt: serverTimestamp(),
      })
      toast({
        title: "Contact Added",
        description: `${formName} has been added to your emergency contacts.`,
      })
      setFormName("")
      setFormRelation("")
      setFormPhone("")
      setShowAddModal(false)
    } catch (error) {
      console.error("Add contact error:", error)
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFormProcessing(false)
    }
  }

  // Delete contact
  const handleDeleteContact = async (contact: PersonalContact) => {
    if (!confirm(`Delete ${contact.name} from your emergency contacts?`)) return
    
    setDeletingId(contact.id)
    try {
      await deleteDoc(doc(db, "personal_contacts", contact.id))
      toast({
        title: "Contact Deleted",
        description: `${contact.name} has been removed.`,
      })
    } catch (error) {
      console.error("Delete contact error:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Call contact
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <PhoneCall className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emergency Help</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Quick access to emergency services and contacts</p>
        </div>

        {/* National Emergency Numbers */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              National Emergency Numbers
            </CardTitle>
            <CardDescription>Tap to call immediately</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {NATIONAL_EMERGENCY_NUMBERS.map((emergency) => (
                <Button
                  key={emergency.number}
                  variant="outline"
                  className="h-auto flex-col py-6 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  onClick={() => handleCall(emergency.number)}
                >
                  <div className={`w-12 h-12 ${emergency.color} rounded-full flex items-center justify-center mb-3`}>
                    <emergency.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{emergency.number}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{emergency.name}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{emergency.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Share2 className="w-5 h-5 text-blue-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Share your location or send emergency alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={handleShareLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                ) : (
                  <MapPin className="w-8 h-8 text-blue-500" />
                )}
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Share My Location</p>
                  <p className="text-xs text-gray-500 mt-1">Generate & share Google Maps link</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-3 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={handleEmergencySMS}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                ) : (
                  <MessageSquare className="w-8 h-8 text-green-500" />
                )}
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Send Emergency SMS</p>
                  <p className="text-xs text-gray-500 mt-1">Pre-filled message with location</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Emergency Contacts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Personal Emergency Contacts
                </CardTitle>
                <CardDescription>Your trusted contacts for emergencies</CardDescription>
              </div>
              <Button onClick={() => setShowAddModal(true)} size="sm" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
                <span className="text-gray-500">Loading contacts...</span>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No emergency contacts added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your trusted contacts for quick access</p>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">{contact.relation}</Badge>
                          <span className="text-sm text-gray-500">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleCall(contact.phone)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handleSendSMS(contact.phone, contact.name)}
                        disabled={locationLoading}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        SMS
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteContact(contact)}
                        disabled={deletingId === contact.id}
                      >
                        {deletingId === contact.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="border-0 shadow-lg bg-amber-50 dark:bg-amber-900/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-amber-700 dark:text-amber-400">
              <Shield className="w-5 h-5" />
              Quick Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {SAFETY_TIPS.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-amber-800 dark:text-amber-300">
                  <span className="w-6 h-6 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4">
            <form
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
              onSubmit={handleAddContact}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Emergency Contact</h2>
                  <p className="text-sm text-gray-500">Add a trusted contact for emergencies</p>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relation *
                  </label>
                  <Input
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value)}
                    placeholder="e.g., Father, Friend, Neighbor"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g., 9876543210"
                    type="tel"
                    required
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={formProcessing}>
                  {formProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}