"use server"

import { auth, db } from "@/lib/firebase"
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore"

export interface ProfileData {
  name: string
  email: string
  city: string | null
}

export interface ProfileUpdateResult {
  success: boolean
  error?: string
}

export async function updateProfile(data: ProfileData): Promise<ProfileUpdateResult> {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const userDocRef = doc(db, "users", currentUser.uid)
    
    // Check if user document exists
    const userDoc = await getDoc(userDocRef)
    
    const profileData = {
      name: data.name,
      email: data.email,
      city: data.city,
      updatedAt: new Date(),
    }

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, profileData)
    } else {
      // Create new document
      await setDoc(userDocRef, {
        ...profileData,
        createdAt: new Date(),
      })
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}

export async function getProfile(): Promise<{ success: boolean; data?: ProfileData; error?: string }> {
  try {
    const currentUser = auth.currentUser

    if (!currentUser) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const userDocRef = doc(db, "users", currentUser.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return {
        success: true,
        data: {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          city: null,
        },
      }
    }

    const userData = userDoc.data()
    return {
      success: true,
      data: {
        name: userData.name || currentUser.displayName || "",
        email: userData.email || currentUser.email || "",
        city: userData.city || null,
      },
    }
  } catch (error) {
    console.error("Error getting profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get profile",
    }
  }
}
