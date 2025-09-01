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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle 
            className="text-2xl font-bold font-thai"
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
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={laptop.image}
                alt={laptop.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  ${laptop.price.toLocaleString()}
                </span>
                {laptop.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${laptop.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Rating and Sales */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{laptop.rating}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {laptop.sold} ຂາຍແລ້ວ
                </span>
              </div>
            </div>

            <Separator />

            {/* Product Details */}
            <div className="space-y-4">
              <h3 
                className="text-lg font-semibold font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ຂໍ້ມູນສິນຄ້າ
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">ຍີ່ຫໍ້:</span>
                  <span className="font-medium">{laptop.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">ໂປເຊດເຊີ:</span>
                  <span className="font-medium">{laptop.processor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">RAM:</span>
                  <span className="font-medium">{laptop.ram}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">ພື້ນທີ່ເກັບຂໍ້ມູນ:</span>
                  <span className="font-medium">{laptop.storage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">ຈໍພາບ:</span>
                  <span className="font-medium">{laptop.screen}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {laptop.inStock && (
                <Badge variant="default" className="bg-green-100 text-green-800 font-thai">
                  ມີສິນຄ້າ
                </Badge>
              )}
              {laptop.freeShipping && (
                <Badge variant="secondary" className="font-thai">
                  ຂົນສົ່ງຟຣີ
                </Badge>
              )}
            </div>

            {/* Description */}
            {laptop.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 
                    className="text-lg font-semibold font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    ລາຍລະອຽດ
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {laptop.description}
                  </p>
                </div>
              </>
            )}

            {/* Features */}
            {laptop.features && laptop.features.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 
                    className="text-lg font-semibold font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    ຄຸນສົມບັດ
                  </h3>
                  <ul className="space-y-1">
                    {laptop.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span 
                  className="font-medium font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                >
                  ຈໍານວນ:
                </span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => onToggleWishlist(laptop.id)}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <Heart 
                    className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                  <span 
                    className="font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    {isWishlisted ? 'ຖອກອອກ' : 'ບັນທຶກ'}
                  </span>
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={!laptop.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span 
                    className="font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    ເພີ່ມໃສ່ກະຕ່າ
                  </span>
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!laptop.inStock}
                >
                  <span 
                    className="font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    ຊື້ດຽວນີ້
                  </span>
                </Button>
              </div>

              {!laptop.inStock && (
                <p 
                  className="text-center text-red-600 font-medium font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                >
                  ສິນຄ້າໝົດ
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}