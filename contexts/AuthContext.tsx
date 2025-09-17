"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getCustomerProfile, CustomerProfile } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  userProfile: CustomerProfile | null
  loading: boolean
  setUserProfile: (profile: CustomerProfile | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  setUserProfile: () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Get customer profile from Firestore
        try {
          const profile = await getCustomerProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching customer profile:', error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    setUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}