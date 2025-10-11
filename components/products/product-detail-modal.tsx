"use client"

import { useState } from "react"
import { Star, ShoppingCart, Heart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Laptop } from "@/lib/types"
import { useCart } from "@/hooks/use-cart"

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
  // Get cart items to check current quantities
  const { cartItems } = useCart();

  if (!laptop) return null
  
  // Get available quantity, default to undefined if not available
  const availableQuantity = laptop.quantity !== undefined ? laptop.quantity : undefined
  
  // Find how many of this product are already in the cart
  const inCartQuantity = cartItems.find(item => item.id === laptop.id)?.quantity || 0;
  
  // Calculate maximum quantity that can be added to cart
  const maxAddableQuantity = availableQuantity !== undefined 
    ? Math.max(0, availableQuantity - inCartQuantity)
    : 999; // If no quantity limit is set

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const newQuantity = prev + delta;
      // Make sure we don't exceed what we can add to cart
      return Math.min(Math.max(1, newQuantity), maxAddableQuantity || 1);
    })
  }
  
  // Check if we can add the selected quantity to cart
  const canAddToCart = maxAddableQuantity > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) {
      alert(`ສິນຄ້າໃນສະຕ໋ອກມີແຕ່ ${availableQuantity} ລາຍການເທົ່ານັ້ນ ແລະ ທ່ານໄດ້ເພີ່ມເຂົ້າກະຕ່າແລ້ວ`);
      return;
    }
    
    // Adjust quantity to not exceed what's available
    const safeQuantity = Math.min(quantity, maxAddableQuantity);
    
    onAddToCart(laptop, safeQuantity)
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
            
            {/* Show available quantity if defined */}
            {laptop.quantity !== undefined && (
              <div className="text-sm font-medium text-gray-700 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                ຈຳນວນສິນຄ້າໃນສະຕ໋ອກ: <span className={laptop.quantity > 5 ? "text-green-600" : "text-orange-500"}>{laptop.quantity}</span> ລາຍການ
              </div>
            )}
            
            {/* Quantity selector */}
            <div className="flex items-center space-x-4 my-4">
              <span className="text-sm font-medium text-gray-700 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                ຈຳນວນ:
              </span>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => handleQuantityChange(-1)} 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button 
                  onClick={() => handleQuantityChange(1)} 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={laptop.quantity !== undefined && quantity >= laptop.quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {laptop.quantity !== undefined && quantity === laptop.quantity && (
                <span className="text-xs text-orange-500 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ຈຳນວນສູງສຸດທີ່ມີ
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white font-thai"
              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              disabled={!canAddToCart}
            >
              {!canAddToCart
                ? inCartQuantity > 0 
                  ? "ເພີ່ມໝົດແລ້ວ" // Already added maximum quantity
                  : "ສິນຄ້າໝົດ"      // Out of stock
                : "ເພີ່ມໃສ່ກະຕ່າ"     // Can add to cart
              }
            </Button>
            
            {/* Show available vs. in cart information */}
            {availableQuantity !== undefined && (
              <div className="text-xs text-gray-600 mt-1 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                {inCartQuantity > 0 && (
                  <span>ໃນກະຕ່າ: {inCartQuantity} | </span>
                )}
                ໃນສະຕ໋ອກ: {availableQuantity} | ເຫຼືອສຳລັບເພີ່ມ: {maxAddableQuantity}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}