"use client"

import { useState, useCallback } from "react"
import type { CartItem, Laptop } from "@/lib/types"

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = useCallback((laptop: Laptop, quantity = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.laptop.id === laptop.id)

      if (existingItem) {
        return prev.map((item) =>
          item.laptop.id === laptop.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }

      return [...prev, { id: Date.now(), laptop, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const updateQuantity = useCallback(
    (itemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId)
        return
      }

      setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
    },
    [removeFromCart],
  )

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.laptop.price * item.quantity, 0)
  }, [cartItems])

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }
}
