"use client"

import { Button } from "@/components/ui/button"
import type { Laptop } from "@/lib/types"
import { useCart } from "@/hooks/use-cart"

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
  // Get cart items to check current quantities
  const { cartItems } = useCart();
  
  // Helper function to check if product is in stock based on quantity
  const isProductInStock = (laptop: Laptop) => {
    if (laptop.quantity !== undefined) {
      return laptop.quantity > 0
    }
    return laptop.inStock
  }
  
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

  return (
    <div className="product-card bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      {/* Fixed Image Container with Background Image */}
      <div 
        className="product-image aspect-square bg-gray-100 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${laptop.image || "/placeholder-image.jpg"})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Fallback img for SEO and accessibility */}
        <img 
          src={laptop.image || "/placeholder-image.jpg"} 
          alt={laptop.name || "Product image"}
          className="sr-only"
          onError={(e) => {
            // If background image fails, we can't easily change it, but the img will show the placeholder
            e.currentTarget.src = "/placeholder-image.jpg"
          }}
        />
        
        {/* Out of stock badge */}
        {!isProductInStock(laptop) && (
          <div className="absolute top-2 right-2">
            <span className="bg-gray-500 text-white px-2 py-1 rounded font-thai font-semibold text-xs">
              ສິນຄ້າໝົດ
            </span>
          </div>
        )}
      </div>
      
      <div className="product-info p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="product-title text-lg font-bold text-gray-900 line-clamp-2">
            {laptop.name || "Unknown Product"}
          </h3>
          <p className="product-description text-sm text-gray-600 mt-2 line-clamp-2">
            {laptop.description || "No description available."}
          </p>
          <div className="product-pricing flex justify-between items-center mt-2">
            <span className="sale-price text-red-500 text-sm font-bold">
              {(laptop.price || 0).toLocaleString()} ກີບ
            </span>
            {laptop.originalPrice && laptop.originalPrice > laptop.price && (
              <span className="discount-price text-gray-500 line-through text-xs">
                {laptop.originalPrice.toLocaleString()} ກີບ
              </span>
            )}
            {laptop.discountPrice && laptop.discountPrice > laptop.price && (
              <span className="discount-price text-gray-500 line-through text-xs">
                {laptop.discountPrice.toLocaleString()} ກີບ
              </span>
            )}
          </div>
        </div>
        <div className="mt-auto flex space-x-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-10 font-thai text-xs"
            onClick={() => onViewDetails(laptop)}
          >
            ລາຍລະອຽດ
          </Button>
          <Button
            className="flex-1 h-10 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            onClick={() => {
              // Get current quantity in cart
              const currentInCart = cartItems.find(item => item.id === laptop.id)?.quantity || 0;
              
              // Check if product has a specific quantity limit before adding to cart
              if (laptop.quantity !== undefined) {
                if (laptop.quantity <= 0) {
                  // Product is out of stock
                  alert("ສິນຄ້ານີ້ໝົດແລ້ວ");
                  return;
                }
                
                if (currentInCart >= laptop.quantity) {
                  // Already have maximum quantity in cart
                  alert(`ສິນຄ້າໃນສະຕ໋ອກມີແຕ່ ${laptop.quantity} ລາຍການເທົ່ານັ້ນ`);
                  return;
                }
              }
              
              onAddToCart(laptop);
            }}
            disabled={!canAddToCart(laptop)}
          >
            {isProductInStock(laptop) && !canAddToCart(laptop) 
              ? "ເພີ່ມໝົດແລ້ວ"  // Already added maximum quantity
              : (
                <>
                  <span className="hidden sm:inline">ເພີ່ມໃສ່ກະຕ່າ</span>
                  <span className="sm:hidden">ຊື້</span>
                </>
              )
            }
          </Button>
        </div>
      </div>
    </div>
  )
}