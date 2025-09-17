"use client"

import { useState } from "react"
import { Star, ShoppingCart, Heart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Laptop } from "@/lib/types"

interface ProductDetailModalProps {
  laptop: Laptop | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (laptop: Laptop, quantity: number) => void
  onBuyNow: (laptop: Laptop) => void
  onToggleWishlist: (id: number) => void
  isWishlisted: boolean
}

export function ProductDetailModal({
  laptop,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)

  if (!laptop) return null

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    onAddToCart(laptop, quantity)
    onClose()
  }

  const handleBuyNow = () => {
    onBuyNow(laptop)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle 
            className="text-2xl font-bold text-gray-900 font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            {laptop.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Product details for {laptop.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={laptop.image}
              alt={laptop.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <div className="text-3xl font-bold text-red-500">
              ${laptop.price.toLocaleString()}
            </div>
            {laptop.originalPrice && (
              <div className="text-lg text-gray-500 line-through">
                ${laptop.originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-sm text-gray-600">
              {laptop.description}
            </div>
            <Button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}