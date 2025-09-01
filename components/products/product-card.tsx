"use client"

import { Star, Heart, ShoppingCart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Laptop } from "@/lib/types"

interface ProductCardProps {
  laptop: Laptop
  viewMode: "grid" | "list"
  isWishlisted: boolean
  onToggleWishlist: (id: number) => void
  onAddToCart: (laptop: Laptop) => void
  onBuyNow: (laptop: Laptop) => void
  onViewDetails: (laptop: Laptop) => void
}

export function ProductCard({
  laptop,
  viewMode,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}: ProductCardProps) {
  // Only use grid view for this design
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group bg-white border border-gray-200 flex flex-col h-full">
      {/* Product Image Container */}
      <div className="relative bg-gray-50 p-4">
        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10">
          {laptop.originalPrice && laptop.originalPrice > laptop.price && (
            <Badge 
              className="bg-red-500 text-white text-xs px-2 py-1 font-medium font-thai"
              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
            >
              ລາຄາພິເສດ
            </Badge>
          )}
          {!laptop.inStock && (
            <Badge 
              className="bg-gray-500 text-white text-xs px-2 py-1 font-medium font-thai"
              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
            >
              ສິນຄ້າໝົດ
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8 p-0 z-10"
          onClick={(e) => {
            e.stopPropagation()
            onToggleWishlist(laptop.id)
          }}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>

        {/* Product Image */}
        <div className="aspect-square flex items-center justify-center">
          <img
            src={laptop.image || "/placeholder.svg"}
            alt={laptop.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Product Details */}
      <CardContent className="p-4 space-y-3 flex flex-col flex-1">
        {/* Product Title */}
        <h3 
          className="font-medium text-gray-900 line-clamp-2 text-sm leading-relaxed min-h-[2.5rem] font-thai"
          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
        >
          {laptop.name}
        </h3>

        {/* Product Description/Specs */}
        <p 
          className="text-gray-600 text-sm font-thai"
          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
        >
          ຄວາມສູງປະມານ {laptop.screen} | {laptop.ram} | {laptop.storage}
        </p>

        {/* Price Section */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 font-bold text-lg">
              ฿{laptop.price.toLocaleString()}.00
            </span>
            {laptop.originalPrice && laptop.originalPrice > laptop.price && (
              <span className="text-gray-500 line-through text-sm">
                ฿{laptop.originalPrice.toLocaleString()}.00
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 mt-auto">
          {laptop.inStock ? (
            <>
              <Button
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-sm h-10 font-thai transition-all duration-300 hover:scale-105 hover:shadow-md"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(laptop)
                }}
              >
                ລາຍລະອຽດ
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white text-sm h-10 font-thai transition-all duration-300"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCart(laptop)
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                ໃສ່ຕະກ້າ
              </Button>
            </>
          ) : (
            <Button
              disabled
              className="w-full bg-gray-400 text-white text-sm h-10 cursor-not-allowed font-thai"
              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
            >
              ລາຍລະອຽດ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
