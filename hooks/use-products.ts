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
      const q = category
        ? query(productsRef, where("category", "==", category))
        : productsRef
      const querySnapshot = await getDocs(q)
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Laptop[]
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