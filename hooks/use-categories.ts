"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Category } from "@/lib/types"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      // Query all categories from Firestore (simplified to avoid composite index requirement)
      const categoriesRef = collection(db, "categories")
      const querySnapshot = await getDocs(categoriesRef)
      
      const fetchedCategories: Category[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Filter active categories in client-side code
        if (data.isActive !== false) { // Include if isActive is true or undefined
          fetchedCategories.push({
            id: doc.id,
            name: data.name || "",
            displayName: data.displayName || data.name || "",
            description: data.description || "",
            isActive: data.isActive ?? true,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          })
        }
      })

      // Sort categories by displayName in client-side code
      fetchedCategories.sort((a, b) => a.displayName.localeCompare(b.displayName))

      setCategories(fetchedCategories)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { categories, loading, error, refetch: fetchCategories }
}