"use client"

import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Laptop } from "@/lib/types"

interface RelatedProductsProps {
  currentLaptop: Laptop
  allLaptops: Laptop[]
  onViewProduct: (laptop: Laptop) => void
  onAddToCart: (laptop: Laptop) => void
  onToggleWishlist: (id: number) => void
  wishlist: number[]
}

export function RelatedProducts({
  currentLaptop,
  allLaptops,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  wishlist,
}: RelatedProductsProps) {
  const getRelatedProducts = (laptop: Laptop) => {
    if (!allLaptops || !Array.isArray(allLaptops)) {
      console.log("[v0] allLaptops is undefined or not an array:", allLaptops)
      return []
    }

    const related = allLaptops
      .filter((l) => l.id !== laptop.id)
      .map((l) => {
        let score = 0

        // Same category gets highest priority
        if (l.category === laptop.category) score += 10

        // Same brand gets high priority
        if (l.brand === laptop.brand) score += 8

        // Similar price range (within 30%)
        const priceDiff = Math.abs(l.price - laptop.price) / laptop.price
        if (priceDiff <= 0.3) score += 6

        // Similar processor family
        const currentProc = laptop.processor.toLowerCase()
        const relatedProc = l.processor.toLowerCase()
        if (currentProc.includes("intel") && relatedProc.includes("intel")) score += 4
        if (currentProc.includes("amd") && relatedProc.includes("amd")) score += 4

        // Similar RAM
        if (l.ram === laptop.ram) score += 3

        // Similar screen size
        if (l.screen === laptop.screen) score += 2

        // Higher rating gets bonus
        if (l.rating >= 4.5) score += 1

        return { laptop: l, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.laptop)

    return related
  }

  const relatedProducts = getRelatedProducts(currentLaptop)

  if (relatedProducts.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">You Might Also Like</h3>
        <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600">
          View All Similar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.map((laptop) => (
          <Card
            key={laptop.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
            onClick={() => onViewProduct(laptop)}
          >
            <div className="aspect-[4/3] bg-gray-100 relative">
              <img
                src={laptop.image || "/placeholder.svg"}
                alt={laptop.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {!laptop.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-medium text-xs">Out of Stock</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleWishlist(laptop.id)
                }}
              >
                <Heart className={`w-3 h-3 ${wishlist.includes(laptop.id) ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              {laptop.freeShipping && (
                <Badge className="absolute top-2 left-2 bg-green-500 text-xs px-1 py-0">Free Ship</Badge>
              )}
              {laptop.originalPrice && (
                <Badge className="absolute bottom-2 left-2 bg-red-500 text-xs px-1 py-0">
                  {Math.round(((laptop.originalPrice - laptop.price) / laptop.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            <CardContent className="p-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {laptop.name}
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-orange-600">${laptop.price.toLocaleString()}</span>
                    {laptop.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        ${laptop.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {laptop.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(laptop.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({laptop.rating})</span>
                  </div>
                  <span className="text-xs text-gray-500">{laptop.sold} sold</span>
                </div>

                <div className="flex gap-1 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-7 text-xs"
                    disabled={!laptop.inStock}
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToCart(laptop)
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewProduct(laptop)
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Why These Products?</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Similar category: {currentLaptop.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Same brand: {currentLaptop.brand}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Similar price range</span>
          </div>
        </div>
      </div>
    </div>
  )
}
