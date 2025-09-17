"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Laptop } from "@/lib/types"

export interface CartItem extends Laptop {
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (laptop: Laptop, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    // Load cart from localStorage on initial render
    try {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error)
      localStorage.removeItem("cart")
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    } else {
      // Clear from storage if cart is empty
      localStorage.removeItem("cart")
    }
  }, [cartItems])

  const addToCart = (laptop: Laptop, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === laptop.id)
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === laptop.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      // Ensure all required fields are present when creating a new cart item
      const newCartItem: CartItem = {
        id: laptop.id,
        name: laptop.name,
        price: laptop.price,
        image: laptop.image || undefined,
        description: laptop.description || "",
        rating: laptop.rating || 0,
        sold: laptop.sold || 0,
        discountPrice: laptop.discountPrice,
        quantity: quantity,
      };
      return [...prevItems, newCartItem];
    })
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0) // Remove if quantity is 0
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cart")
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}