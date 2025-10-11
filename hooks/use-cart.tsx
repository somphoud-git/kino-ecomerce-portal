"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Laptop } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export interface CartItem {
  id: number
  name: string
  price: number
  image?: string
  quantity: number
  discountPrice?: number | null
  barcode?: string
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
  const { toast } = useToast()

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
    // Check if product has a defined quantity
    const availableQuantity = laptop.quantity !== undefined ? laptop.quantity : 999;
    
    // If product is out of stock, don't add to cart
    if (availableQuantity <= 0) {
      toast({
        title: `${laptop.name} ສິນຄ້າໝົດ`,
        description: "ບໍ່ສາມາດເພີ່ມເຂົ້າກະຕ່າໄດ້",
        duration: 3000,
        style: { 
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          color: "white",
          fontFamily: "'Noto Sans Lao Looped', sans-serif"
        }
      })
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === laptop.id)
      
      if (existingItem) {
        // Check if adding quantity would exceed available quantity
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > availableQuantity) {
          // Show error message outside setState to avoid state updates during render
          setTimeout(() => {
            toast({
              title: `ສິນຄ້າມີຈຳກັດ`,
              description: `ສິນຄ້າໃນສະຕ໋ອກມີແຕ່ ${availableQuantity} ລາຍການເທົ່ານັ້ນ ແລະ ທ່ານໄດ້ເພີ່ມເຂົ້າກະຕ່າຄົບແລ້ວ`,
              duration: 3000,
              style: { 
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                fontFamily: "'Noto Sans Lao Looped', sans-serif"
              }
            });
          }, 0);
          
          // Set to maximum available quantity instead
          return prevItems.map((item) =>
            item.id === laptop.id ? { ...item, quantity: availableQuantity } : item
          );
        }
        
        // Normal case - add to existing quantity
        return prevItems.map((item) =>
          item.id === laptop.id ? { ...item, quantity: newQuantity } : item
        );
      }
      
      // Adding new item - ensure we don't add more than available
      const safeQuantity = Math.min(quantity, availableQuantity);
      
      // Ensure all required fields are present when creating a new cart item
      const newCartItem: CartItem = {
        id: laptop.id,
        name: laptop.name,
        price: laptop.price,
        image: laptop.image,
        discountPrice: laptop.discountPrice,
        quantity: safeQuantity,
        barcode: laptop.barcode,
      }
      return [...prevItems, newCartItem]
    })
    
    // Show notification
    toast({
      title: `${laptop.name} ເພີ່ມເຂົ້າກະຕ່າແລ້ວ ${quantity} ລາຍການ`,
      description: "ໄປທີ່ກະຕ່າເພື່ອຕິດຕາມລາຍການສິນຄ້າ",
      duration: 3000,
      style: { 
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        fontFamily: "'Noto Sans Lao Looped', sans-serif"
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems((prevItems) => {
      // First, find the product to get its details
      const currentItem = prevItems.find(item => item.id === productId);
      if (!currentItem) return prevItems;
      
      // Attempt to find the actual product from products data
      // Since we don't have direct access to product data here, we'll limit based on what we have
      // The complete solution would involve checking with the actual product database
      
      return prevItems.map((item) => {
        if (item.id === productId) {
          // Ensure quantity is at least 0
          const newQuantity = Math.max(0, quantity);
          
          // Return the updated item
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove if quantity is 0
    });
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