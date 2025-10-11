"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Laptop } from '@/lib/types'
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export interface UseRecommendedProductsResult {
  products: Laptop[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRecommendedProducts(): UseRecommendedProductsResult {
  const [products, setProducts] = useState<Laptop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendedProducts = useCallback(async () => {
    setLoading(true)
    try {
      const productsRef = collection(db, "products")
      
      // Query for products with recommend "top" and status "Active"
      const topQuery = query(
        productsRef, 
        where("status", "==", "Active"),
        where("recommend", "==", "top")
      )
      
      // Query for products with recommend "new" and status "Active"
      const newQuery = query(
        productsRef, 
        where("status", "==", "Active"),
        where("recommend", "==", "new")
      )
      
      // Execute both queries
      const [topSnapshot, newSnapshot] = await Promise.all([
        getDocs(topQuery),
        getDocs(newQuery)
      ])
      
      // Combine results
      const topProducts = topSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          // Map imageUrl from Firebase to image field expected by frontend
          image: data.imageUrl || data.image || "/placeholder-image.jpg"
        }
      }) as unknown as Laptop[]
      
      const newProducts = newSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          // Map imageUrl from Firebase to image field expected by frontend
          image: data.imageUrl || data.image || "/placeholder-image.jpg"
        }
      }) as unknown as Laptop[]
      
      // Merge and remove duplicates
      const allProducts = [...topProducts, ...newProducts]
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )
      
      setProducts(uniqueProducts)
    } catch (err) {
      console.error("Error fetching recommended products:", err)
      setError("Failed to fetch recommended products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecommendedProducts()
  }, [fetchRecommendedProducts])

  const refetch = useCallback(async () => {
    await fetchRecommendedProducts()
  }, [fetchRecommendedProducts])

  return {
    products,
    loading,
    error,
    refetch
  }
}