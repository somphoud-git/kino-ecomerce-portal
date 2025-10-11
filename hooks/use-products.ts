"use client"

import { useState, useEffect, useCallback } from 'react'
import { getProductById, ProductFilters } from '@/lib/products'
import type { Laptop } from '@/lib/types'
import { db } from "@/lib/firebase" // Adjust the path to your Firebase config
import { collection, query, where, getDocs } from "firebase/firestore"

export interface UseProductsResult {
  products: Laptop[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalCount: number
}

export function useProducts(category?: string): UseProductsResult {
  const [products, setProducts] = useState<Laptop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const productsRef = collection(db, "products")
      // Base query to only get active products
      let q = query(productsRef, where("status", "==", "Active"))
      
      // Add category filter if specified
      if (category) {
        q = query(productsRef, where("category", "==", category), where("status", "==", "Active"))
      }
      
      const querySnapshot = await getDocs(q)
      const productsData = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        const mappedProduct = {
          ...data,
          id: doc.id,
          // Map imageUrl from Firebase to image field expected by frontend
          image: data.imageUrl || data.image || "/placeholder-image.jpg"
        } as unknown as Laptop
        
        // Debug logging for image mapping
        console.log('Product image mapping:', {
          productId: doc.id,
          productName: data.name,
          originalImageUrl: data.imageUrl,
          originalImage: data.image,
          mappedImage: mappedProduct.image
        })
        
        return mappedProduct
      })
      setProducts(productsData)
      setTotalCount(productsData.length)
    } catch (err) {
      setError("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const refetch = useCallback(async () => {
    await fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    refetch,
    totalCount
  }
}

export interface UseProductResult {
  product: Laptop | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<Laptop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedProduct = await getProductById(id)
      setProduct(fetchedProduct)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນສິນຄ້າ'
      setError(errorMessage)
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [fetchProduct, id])

  const refetch = useCallback(async () => {
    await fetchProduct()
  }, [fetchProduct])

  return {
    product,
    loading,
    error,
    refetch
  }
}