
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

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
  userType: 'customer' | 'staff' | 'admin'
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