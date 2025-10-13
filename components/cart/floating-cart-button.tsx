"use client"

import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useEffect, useState } from "react"

export function FloatingCartButton() {
  const router = useRouter()
  const { getTotalItems, getTotalPrice } = useCart()
  const [isVisible, setIsVisible] = useState(false)
  const itemCount = getTotalItems()

  // Show button only when there are items in cart
  useEffect(() => {
    setIsVisible(itemCount > 0)
  }, [itemCount])

  // Don't render anything if cart is empty
  if (!isVisible || itemCount === 0) {
    return null
  }

  const handleClick = () => {
    router.push("/cart")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={handleClick}
        className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-4 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
        aria-label="View cart"
      >
        {/* Cart Icon */}
        <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
        
        {/* Item Count Badge */}
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
          {itemCount}
        </div>
        
        {/* Tooltip on hover - Desktop only */}
        <div className="hidden sm:block absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
            <div className="font-semibold">{itemCount} ລາຍການ</div>
            <div className="text-xs text-gray-300">{getTotalPrice().toLocaleString()} ກີບ</div>
            {/* Arrow */}
            <div className="absolute top-full right-6 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
