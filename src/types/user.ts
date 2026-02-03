export interface User {
  uid: string
  email: string
  fullName: string
  phone?: string
  city?: string
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  provider: "email" | "google"
  photoURL?: string
  createdAt: string
  updatedAt?: string
}
