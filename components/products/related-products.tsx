"use client"

import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Laptop } from "@/lib/types"
import { useCart } from "@/hooks/use-cart"

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
  // Get cart items to check current quantities
  const { cartItems } = useCart();
  
  const getRelatedProducts = (laptop: Laptop) => {
    if (!allLaptops || !Array.isArray(allLaptops)) {
      console.log("allLaptops is undefined or not an array:", allLaptops)
      return []
    }

    // First, try to get products from the same category
    const sameCategoryProducts = allLaptops
      .filter((l) => l.id !== laptop.id && l.category === laptop.category)
      .map((l) => {
        let score = 0

        // Same brand gets high priority within same category
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

        // In stock products get priority
        if (l.inStock) score += 2

        return { laptop: l, score }
      })
      .sort((a, b) => b.score - a.score)

    // If we have enough products from same category, return them
    if (sameCategoryProducts.length >= 8) {
      return sameCategoryProducts.slice(0, 8).map((item) => item.laptop)
    }

    // If not enough products in same category, fill with products from other categories
    const otherCategoryProducts = allLaptops
      .filter((l) => l.id !== laptop.id && l.category !== laptop.category)
      .map((l) => {
        let score = 0

        // Same brand gets some priority
        if (l.brand === laptop.brand) score += 5

        // Similar price range
        const priceDiff = Math.abs(l.price - laptop.price) / laptop.price
        if (priceDiff <= 0.3) score += 3

        // Higher rating gets bonus
        if (l.rating >= 4.5) score += 2

        // In stock products get priority
        if (l.inStock) score += 1

        return { laptop: l, score }
      })
      .sort((a, b) => b.score - a.score)

    // Combine same category products with other category products to reach 8 total
    const needed = 8 - sameCategoryProducts.length
    const additionalProducts = otherCategoryProducts.slice(0, needed)

    const allRelated = [...sameCategoryProducts, ...additionalProducts]
    return allRelated.map((item) => item.laptop)
  }

  const relatedProducts = getRelatedProducts(currentLaptop)
  
  // Helper function to check if product can be added to cart
  const canAddToCart = (laptop: Laptop) => {
    // If product doesn't have a defined quantity, use inStock flag
    if (laptop.quantity === undefined) {
      return laptop.inStock;
    }
    
    // Find how many of this product are already in the cart
    const inCartQuantity = cartItems.find(item => item.id === laptop.id)?.quantity || 0;
    
    // Check if adding one more would exceed available quantity
    return laptop.quantity > inCartQuantity;
  }

  if (relatedProducts.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold">You Might Also Like</h3>
        <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 text-xs sm:text-sm">
          View All Similar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {relatedProducts.map((laptop) => (
          <Card
            key={laptop.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-200"
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
                className="absolute top-1 right-1 bg-white/80 hover:bg-white h-5 w-5 p-0 sm:h-6 sm:w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleWishlist(laptop.id)
                }}
              >
                <Heart className={`w-2 h-2 sm:w-3 sm:h-3 ${wishlist.includes(laptop.id) ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              {laptop.freeShipping && (
                <Badge className="absolute top-1 left-1 bg-green-500 text-[9px] px-1 py-0 sm:text-xs">Free Ship</Badge>
              )}
              {laptop.originalPrice && (
                <Badge className="absolute bottom-1 left-1 bg-red-500 text-[9px] px-1 py-0 sm:text-xs">
                  {Math.round(((laptop.originalPrice - laptop.price) / laptop.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            <CardContent className="p-2 sm:p-3">
              <div className="space-y-1 sm:space-y-2">
                <h4 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                  {laptop.name}
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-orange-600 text-xs sm:text-sm">
                      ${laptop.price.toLocaleString()}
                    </span>
                    {laptop.originalPrice && (
                      <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                        ${laptop.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 sm:text-xs hidden sm:inline-flex">
                    {laptop.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2 h-2 sm:w-3 sm:h-3 ${
                          i < Math.floor(laptop.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] sm:text-xs text-gray-500 ml-0.5">({laptop.rating})</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">{laptop.sold} sold</span>
                </div>

                {/* Action Buttons - Fixed responsive text */}
                <div className="flex gap-1 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-5 sm:h-7 text-[9px] sm:text-xs px-1"
                    disabled={!canAddToCart(laptop)}
                    onClick={(e) => {
                      e.stopPropagation();
                      
                      // Check if product has a specific quantity limit before adding to cart
                      if (laptop.quantity !== undefined) {
                        // Find how many of this product are already in the cart
                        const inCartQuantity = cartItems.find(item => item.id === laptop.id)?.quantity || 0;
                        
                        if (inCartQuantity >= laptop.quantity) {
                          alert(`ສິນຄ້າໃນສະຕ໋ອກມີແຕ່ ${laptop.quantity} ລາຍການເທົ່ານັ້ນ`);
                          return;
                        }
                      }
                      
                      onAddToCart(laptop);
                    }}
                  >
                    <ShoppingCart className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5" />
                    {/* Show ເພີ່ມໃສ່ກະຕ່າ on sm screens and above, show ຊື້ on mobile screens */}
                    <span className="hidden sm:inline">ເພີ່ມໃສ່ກະຕ່າ</span>
                    <span className="sm:hidden">ຊື້</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-5 sm:h-7 px-1 sm:px-2 text-[9px] sm:text-xs bg-transparent min-w-[35px] sm:min-w-[45px]"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewProduct(laptop)
                    }}
                  >
                    ລາຍລະອຽດ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why These Products Section */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
        <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Why These Products?</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span className="break-words">Same category ({currentLaptop.category})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="break-words">Similar brand & specs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="break-words">Price range & ratings</span>
          </div>
        </div>
      </div>
    </div>
  )
}