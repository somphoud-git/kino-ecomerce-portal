
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { Settings } from "./types"

export interface UserProfile {
  uid: string
  name: string
  surname: string
  phoneNumber: string
  email: string
  whatsapp?: string | null
  village: string
  district: string
  province: string
  shippingBranch?: string
  password?: string // Store password in customers table
  userType: 'customer' | 'staff' | 'admin'
  status?: string // User status: 'Active' or 'Blocked'
  createdAt: string
  updatedAt: string
}

export const saveUserProfile = async (uid: string, userData: UserProfile) => {
  try {
    const userRef = doc(db, "customers", uid)
    await setDoc(userRef, userData)
    console.log("Customer profile saved successfully")
  } catch (error) {
    console.error("Error saving customer profile:", error)
    throw new Error("Failed to save customer profile")
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "customers", uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting customer profile:", error)
    throw new Error("Failed to get customer profile")
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, "customers", uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    console.log("Customer profile updated successfully")
  } catch (error) {
    console.error("Error updating customer profile:", error)
    throw new Error("Failed to update customer profile")
  }
}

export const getSettings = async (): Promise<Settings | null> => {
  try {
    const settingsRef = doc(db, "settings", "app-settings")
    const settingsSnap = await getDoc(settingsRef)
    
    if (settingsSnap.exists()) {
      return settingsSnap.data() as Settings
    } else {
      // Return default settings if no settings document exists
      return {
        enableDeposit: false,
        qrCodeImageUrl: ""
      }
    }
  } catch (error) {
    console.error("Error getting settings:", error)
    throw new Error("Failed to get settings")
  }
}