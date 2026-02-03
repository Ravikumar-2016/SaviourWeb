"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  CheckCircle2, Home, Hammer, Truck, Radio, Utensils, 
  HeartPulse, Package, Loader2, X, Plus, Edit, Trash2, Phone, MapPin,
  User, Clock, Gift
} from "lucide-react"
import { db, auth } from "@/lib/firebase"
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, serverTimestamp 
} from "firebase/firestore"
import Link from "next/link"
import { useUserCity } from "@/hooks/useUserCity"

const RESOURCE_CATEGORIES = [
  { id: "medical", name: "Medical Supplies", icon: <HeartPulse className="w-4 h-4 text-red-500" /> },
  { id: "food", name: "Food & Water", icon: <Utensils className="w-4 h-4 text-green-500" /> },
  { id: "shelter", name: "Shelter & Clothing", icon: <Home className="w-4 h-4 text-blue-500" /> },
  { id: "rescue", name: "Rescue Equipment", icon: <CheckCircle2 className="w-4 h-4 text-yellow-500" /> },
  { id: "communication", name: "Communication", icon: <Radio className="w-4 h-4 text-indigo-500" /> },
  { id: "transportation", name: "Transportation", icon: <Truck className="w-4 h-4 text-cyan-500" /> },
  { id: "tools", name: "Tools & Equipment", icon: <Hammer className="w-4 h-4 text-lime-500" /> },
  { id: "energy", name: "Power & Fuel", icon: <Package className="w-4 h-4 text-orange-500" /> },
]

const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const
type UrgencyLevel = typeof URGENCY_LEVELS[number]

const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-green-500 text-white",
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  claimed: "bg-blue-100 text-blue-700",
  fulfilled: "bg-purple-100 text-purple-700",
  pending: "bg-yellow-100 text-yellow-700",
  resolved: "bg-gray-100 text-gray-700",
}

// Resource Offer type
type ResourceOffer = {
  id: string
  userId: string
  userName: string
  city: string
  category: string
  title: string
  description: string
  quantity: number
  status: "available" | "claimed" | "fulfilled"
  contactNumber: string
  createdAt: unknown
}

// Resource Request type
type ResourceRequest = {
  id: string
  userId: string
  userName: string
  city: string
  category: string
  description: string
  urgency: UrgencyLevel
  status: "pending" | "fulfilled" | "resolved"
  contactNumber: string
  createdAt: unknown
}

export default function ResourcesPage() {
  const { userCity, loading: userLoading, isProfileComplete } = useUserCity()
  const { toast } = useToast()
  const [offers, setOffers] = useState<ResourceOffer[]>([])
  const [myOffers, setMyOffers] = useState<ResourceOffer[]>([])
  const [myRequests, setMyRequests] = useState<ResourceRequest[]>([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [myOffersLoading, setMyOffersLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [tab, setTab] = useState<"offers" | "myoffers" | "requests">("offers")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  // Modal states
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<ResourceRequest | null>(null)
  const [editingOffer, setEditingOffer] = useState<ResourceOffer | null>(null)
  
  // Form states
  const [formCategory, setFormCategory] = useState("")
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formQuantity, setFormQuantity] = useState("")
  const [formUrgency, setFormUrgency] = useState<UrgencyLevel>("medium")
  const [formContactNumber, setFormContactNumber] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // Fetch resource offers from other users in same city
  useEffect(() => {
    if (userLoading || !userCity.city) return
    
    const user = auth.currentUser
    if (!user) return

    setOffersLoading(true)
    
    // Query all offers in the city (simpler query to avoid index requirements)
    const offersQuery = query(
      collection(db, "resources_offers"),
      where("city", "==", userCity.city.toLowerCase())
    )
    
    const unsub = onSnapshot(
      offersQuery, 
      (snapshot) => {
        const data: ResourceOffer[] = []
        snapshot.forEach((docSnap) => {
          const offer = { id: docSnap.id, ...docSnap.data() } as ResourceOffer
          // Exclude current user's offers and only show available ones
          if (offer.userId !== user.uid && offer.status === "available") {
            data.push(offer)
          }
        })
        // Sort by createdAt descending (client-side)
        data.sort((a, b) => {
          const aTime = a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt 
            ? (a.createdAt as { seconds: number }).seconds : 0
          const bTime = b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt 
            ? (b.createdAt as { seconds: number }).seconds : 0
          return bTime - aTime
        })
        setOffers(data)
        setOffersLoading(false)
      },
      (error) => {
        console.error("Error fetching offers:", error)
        setOffers([])
        setOffersLoading(false)
      }
    )
    
    return () => unsub()
  }, [userCity.city, userLoading])

  // Fetch my resource offers
  useEffect(() => {
    if (userLoading) return
    
    const user = auth.currentUser
    if (!user) return

    setMyOffersLoading(true)
    
    // Simple query by userId only
    const myOffersQuery = query(
      collection(db, "resources_offers"),
      where("userId", "==", user.uid)
    )
    
    const unsub = onSnapshot(
      myOffersQuery, 
      (snapshot) => {
        const data: ResourceOffer[] = []
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as ResourceOffer)
        })
        // Sort by createdAt descending (client-side)
        data.sort((a, b) => {
          const aTime = a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt 
            ? (a.createdAt as { seconds: number }).seconds : 0
          const bTime = b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt 
            ? (b.createdAt as { seconds: number }).seconds : 0
          return bTime - aTime
        })
        setMyOffers(data)
        setMyOffersLoading(false)
      },
      (error) => {
        console.error("Error fetching my offers:", error)
        setMyOffers([])
        setMyOffersLoading(false)
      }
    )
    
    return () => unsub()
  }, [userLoading])

  // Fetch my resource requests
  useEffect(() => {
    if (userLoading) return
    
    const user = auth.currentUser
    if (!user) return

    setRequestsLoading(true)
    
    // Simple query by userId only
    const requestsQuery = query(
      collection(db, "resources_requests"),
      where("userId", "==", user.uid)
    )
    
    const unsub = onSnapshot(
      requestsQuery, 
      (snapshot) => {
        const data: ResourceRequest[] = []
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as ResourceRequest)
        })
        // Sort by createdAt descending (client-side)
        data.sort((a, b) => {
          const aTime = a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt 
            ? (a.createdAt as { seconds: number }).seconds : 0
          const bTime = b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt 
            ? (b.createdAt as { seconds: number }).seconds : 0
          return bTime - aTime
        })
        setMyRequests(data)
        setRequestsLoading(false)
      },
      (error) => {
        console.error("Error fetching requests:", error)
        setMyRequests([])
        setRequestsLoading(false)
      }
    )
    
    return () => unsub()
  }, [userLoading])

  // Filter offers by category
  const filteredOffers = offers.filter((offer) => {
    if (categoryFilter === "all") return true
    return offer.category === categoryFilter
  })

  // Reset form
  const resetForm = () => {
    setFormCategory("")
    setFormTitle("")
    setFormDescription("")
    setFormQuantity("")
    setFormUrgency("medium")
    setFormContactNumber("")
    setFormError(null)
    setEditingRequest(null)
  }

  // Open offer modal
  const openOfferModal = (offer?: ResourceOffer) => {
    resetForm()
    if (offer) {
      setEditingOffer(offer)
      setFormCategory(offer.category)
      setFormTitle(offer.title)
      setFormDescription(offer.description)
      setFormQuantity(offer.quantity.toString())
      setFormContactNumber(offer.contactNumber)
    } else {
      setFormContactNumber("")
    }
    setOfferModalOpen(true)
  }

  // Open request modal
  const openRequestModal = (request?: ResourceRequest) => {
    resetForm()
    if (request) {
      setEditingRequest(request)
      setFormCategory(request.category)
      setFormDescription(request.description)
      setFormUrgency(request.urgency)
      setFormContactNumber(request.contactNumber)
    } else {
      setFormContactNumber("")
    }
    setRequestModalOpen(true)
  }

  // Submit offer
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user || !userCity.city) return
    
    if (!formCategory || !formTitle.trim() || !formDescription.trim() || !formQuantity.trim() || !formContactNumber.trim()) {
      setFormError("Please fill all required fields")
      return
    }
    
    setProcessing(true)
    setFormError(null)
    
    try {
      if (editingOffer) {
        // Update existing offer
        await updateDoc(doc(db, "resources_offers", editingOffer.id), {
          category: formCategory,
          title: formTitle.trim(),
          description: formDescription.trim(),
          quantity: Number(formQuantity),
          contactNumber: formContactNumber.trim()
        })
        toast({
          title: "Offer Updated",
          description: "Your resource offer has been updated successfully.",
        })
      } else {
        // Create new offer
        await addDoc(collection(db, "resources_offers"), {
          userId: user.uid,
          userName: userCity.fullName || user.displayName || "Anonymous",
          city: userCity.city.toLowerCase(),
          category: formCategory,
          title: formTitle.trim(),
          description: formDescription.trim(),
          quantity: Number(formQuantity),
          status: "available",
          contactNumber: formContactNumber.trim(),
          createdAt: serverTimestamp()
        })
        toast({
          title: "Offer Created",
          description: "Your resource offer has been created successfully.",
        })
      }
      setOfferModalOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error creating offer:", err)
      setFormError("Failed to create offer. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save offer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Submit request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user || !userCity.city) return
    
    if (!formCategory || !formDescription.trim() || !formContactNumber.trim()) {
      setFormError("Please fill all required fields")
      return
    }
    
    setProcessing(true)
    setFormError(null)
    
    try {
      if (editingRequest) {
        // Update existing request
        await updateDoc(doc(db, "resources_requests", editingRequest.id), {
          category: formCategory,
          description: formDescription.trim(),
          urgency: formUrgency,
          contactNumber: formContactNumber.trim()
        })
        toast({
          title: "Request Updated",
          description: "Your resource request has been updated successfully.",
        })
      } else {
        // Create new request
        await addDoc(collection(db, "resources_requests"), {
          userId: user.uid,
          userName: userCity.fullName || user.displayName || "Anonymous",
          city: userCity.city.toLowerCase(),
          category: formCategory,
          description: formDescription.trim(),
          urgency: formUrgency,
          status: "pending",
          contactNumber: formContactNumber.trim(),
          createdAt: serverTimestamp()
        })
        toast({
          title: "Request Created",
          description: "Your resource request has been submitted successfully.",
        })
      }
      setRequestModalOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error submitting request:", err)
      setFormError("Failed to submit request. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Delete offer
  const handleDeleteOffer = async (offer: ResourceOffer) => {
    if (!confirm("Are you sure you want to delete this offer?")) return
    
    try {
      await deleteDoc(doc(db, "resources_offers", offer.id))
      toast({
        title: "Offer Deleted",
        description: "Your resource offer has been deleted.",
      })
    } catch (err) {
      console.error("Error deleting offer:", err)
      toast({
        title: "Error",
        description: "Failed to delete offer. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Mark offer as fulfilled
  const handleFulfillOffer = async (offer: ResourceOffer) => {
    try {
      await updateDoc(doc(db, "resources_offers", offer.id), {
        status: "fulfilled"
      })
      toast({
        title: "Offer Fulfilled",
        description: "Your resource offer has been marked as fulfilled.",
      })
    } catch (err) {
      console.error("Error fulfilling offer:", err)
      toast({
        title: "Error",
        description: "Failed to update offer. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete request
  const handleDeleteRequest = async (request: ResourceRequest) => {
    if (!confirm("Are you sure you want to delete this request?")) return
    
    try {
      await deleteDoc(doc(db, "resources_requests", request.id))
      toast({
        title: "Request Deleted",
        description: "Your resource request has been deleted.",
      })
    } catch (err) {
      console.error("Error deleting request:", err)
      toast({
        title: "Error",
        description: "Failed to delete request. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Mark request as resolved
  const handleResolveRequest = async (request: ResourceRequest) => {
    try {
      await updateDoc(doc(db, "resources_requests", request.id), {
        status: "resolved"
      })
      toast({
        title: "Request Resolved",
        description: "Your resource request has been marked as resolved.",
      })
    } catch (err) {
      console.error("Error resolving request:", err)
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format timestamp
  const formatTime = (timestamp: unknown) => {
    if (!timestamp || typeof timestamp !== 'object' || !('seconds' in timestamp)) return "Unknown"
    const date = new Date((timestamp as { seconds: number }).seconds * 1000)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get category info
  const getCategoryInfo = (categoryId: string) => {
    return RESOURCE_CATEGORIES.find(c => c.id === categoryId) || { name: categoryId, icon: <Package className="w-4 h-4" /> }
  }

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // No city set - redirect to profile
  if (!isProfileComplete || !userCity.city) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Set Your Location</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please set your city in your profile to access resources in your area.
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Resources</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {userCity.city} • {filteredOffers.length} Available Resources
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => openOfferModal()} className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Offer Resource
                </Button>
                <Button onClick={() => openRequestModal()} variant="outline" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Request Resource
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={tab} onValueChange={v => setTab(v as "offers" | "myoffers" | "requests")} className="w-full">
              <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                <TabsTrigger 
                  value="offers" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"
                >
                  Available Resources
                </TabsTrigger>
                <TabsTrigger 
                  value="myoffers" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"
                >
                  My Offers
                  {myOffers.filter(o => o.status === "available").length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {myOffers.filter(o => o.status === "available").length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="requests" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"
                >
                  My Requests
                  {myRequests.filter(r => r.status === "pending").length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {myRequests.filter(r => r.status === "pending").length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                {/* Available Resources Tab */}
                <TabsContent value="offers">
                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                      size="sm"
                      variant={categoryFilter === "all" ? "default" : "outline"}
                      onClick={() => setCategoryFilter("all")}
                    >
                      All Categories
                    </Button>
                    {RESOURCE_CATEGORIES.map(cat => (
                      <Button
                        key={cat.id}
                        size="sm"
                        variant={categoryFilter === cat.id ? "default" : "outline"}
                        onClick={() => setCategoryFilter(cat.id)}
                        className="flex items-center gap-1"
                      >
                        {cat.icon}
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Offers List */}
                  {offersLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                        <span className="text-gray-500">Loading resources...</span>
                      </div>
                    </div>
                  ) : filteredOffers.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <Package className="mx-auto mb-3 w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">No resources available</p>
                      <p className="text-sm mt-1">Be the first to offer a resource in {userCity.city}!</p>
                      <Button onClick={() => openOfferModal()} className="mt-4">
                        <Gift className="w-4 h-4 mr-2" />
                        Offer a Resource
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredOffers.map(offer => {
                        const category = getCategoryInfo(offer.category)
                        return (
                          <Card key={offer.id} className="relative overflow-hidden transition-all hover:shadow-md">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                  {category.icon}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg">{offer.title}</h3>
                                  <p className="text-sm text-gray-500">{category.name}</p>
                                </div>
                                <Badge className={STATUS_COLORS[offer.status]}>
                                  {offer.quantity} available
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {offer.description}
                              </p>
                              
                              <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>{offer.userName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{offer.contactNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(offer.createdAt)}</span>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                className="w-full mt-4"
                                onClick={() => window.open(`tel:${offer.contactNumber}`)}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Contact Donor
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
                
                {/* My Offers Tab */}
                <TabsContent value="myoffers">
                  {myOffersLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                        <span className="text-gray-500">Loading your offers...</span>
                      </div>
                    </div>
                  ) : myOffers.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <Gift className="mx-auto mb-3 w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">No offers yet</p>
                      <p className="text-sm mt-1">Share resources with people in need</p>
                      <Button onClick={() => openOfferModal()} className="mt-4">
                        <Gift className="w-4 h-4 mr-2" />
                        Create Offer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOffers.map(offer => {
                        const category = getCategoryInfo(offer.category)
                        return (
                          <Card key={offer.id} className="relative overflow-hidden hover:shadow-md transition-all">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                    {category.icon}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-lg">{offer.title}</h3>
                                    <p className="text-sm text-gray-500">{category.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={STATUS_COLORS[offer.status]}>
                                        {offer.status.toUpperCase()}
                                      </Badge>
                                      <Badge variant="outline">
                                        {offer.quantity} units
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {offer.status === "available" && (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openOfferModal(offer)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleDeleteOffer(offer)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {offer.description}
                              </p>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(offer.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{offer.contactNumber}</span>
                                </div>
                              </div>
                              
                              {offer.status === "available" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-4"
                                  onClick={() => handleFulfillOffer(offer)}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark as Fulfilled
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
                
                {/* My Requests Tab */}
                <TabsContent value="requests">
                  {requestsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                        <span className="text-gray-500">Loading your requests...</span>
                      </div>
                    </div>
                  ) : myRequests.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <CheckCircle2 className="mx-auto mb-3 w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">No requests yet</p>
                      <p className="text-sm mt-1">Create a request if you need resources</p>
                      <Button onClick={() => openRequestModal()} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myRequests.map(request => {
                        const category = getCategoryInfo(request.category)
                        return (
                          <Card key={request.id} className="relative overflow-hidden hover:shadow-md transition-all">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                    {category.icon}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-lg">{category.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={STATUS_COLORS[request.status]}>
                                        {request.status.toUpperCase()}
                                      </Badge>
                                      <Badge className={URGENCY_COLORS[request.urgency]}>
                                        {request.urgency.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {request.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openRequestModal(request)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleDeleteRequest(request)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {request.description}
                              </p>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTime(request.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{request.contactNumber}</span>
                                </div>
                              </div>
                              
                              {request.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-4"
                                  onClick={() => handleResolveRequest(request)}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark as Resolved
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Offer Resource Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4">
            <form
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
              onSubmit={handleSubmitOffer}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingOffer ? "Edit Offer" : "Offer a Resource"}
                  </h2>
                  <p className="text-sm text-gray-500">Share resources with people in {userCity.city}</p>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setOfferModalOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESOURCE_CATEGORIES.map(cat => (
                      <Button
                        key={cat.id}
                        type="button"
                        size="sm"
                        variant={formCategory === cat.id ? "default" : "outline"}
                        onClick={() => setFormCategory(cat.id)}
                        className="flex items-center gap-2 justify-start"
                      >
                        {cat.icon}
                        <span className="text-xs">{cat.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <Input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g., Water Bottles, First Aid Kit"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <Textarea
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Describe what you're offering"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={formQuantity}
                    onChange={e => setFormQuantity(e.target.value)}
                    placeholder="How many units?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    value={formContactNumber}
                    onChange={e => setFormContactNumber(e.target.value)}
                    placeholder="Your phone number"
                    required
                  />
                </div>
                
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {formError}
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" className="w-full" disabled={processing}>
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Gift className="w-4 h-4 mr-2" />
                  )}
                  {editingOffer ? "Update Offer" : "Offer Resource"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Resource Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4">
            <form
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
              onSubmit={handleSubmitRequest}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingRequest ? "Edit Request" : "Request a Resource"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Request resources from people in {userCity.city}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setRequestModalOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESOURCE_CATEGORIES.map(cat => (
                      <Button
                        key={cat.id}
                        type="button"
                        size="sm"
                        variant={formCategory === cat.id ? "default" : "outline"}
                        onClick={() => setFormCategory(cat.id)}
                        className="flex items-center gap-2 justify-start"
                      >
                        {cat.icon}
                        <span className="text-xs">{cat.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <Textarea
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Describe what you need and why"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgency Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {URGENCY_LEVELS.map(level => (
                      <Button
                        key={level}
                        type="button"
                        size="sm"
                        variant={formUrgency === level ? "default" : "outline"}
                        className={`capitalize ${formUrgency === level ? URGENCY_COLORS[level] : ""}`}
                        onClick={() => setFormUrgency(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Number *
                  </label>
                  <Input
                    value={formContactNumber}
                    onChange={e => setFormContactNumber(e.target.value)}
                    placeholder="Your phone number"
                    required
                  />
                </div>
                
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                    {formError}
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" className="w-full" disabled={processing}>
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {editingRequest ? "Update Request" : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
