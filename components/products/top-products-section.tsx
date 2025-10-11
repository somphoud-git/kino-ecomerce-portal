"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Laptop } from '@/lib/types'

interface TopProductsSectionProps {
  products: Laptop[]
  onProductClick?: (product: Laptop) => void
}

export function TopProductsSection({ products, onProductClick }: TopProductsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Items per page based on screen size
  const itemsToShow = isMobile ? 3 : 7

  // Calculate total pages needed
  const totalPages = Math.ceil(products.length / itemsToShow)
  const showNavigation = products.length > itemsToShow

  // Get products for current page
  const getCurrentPageProducts = () => {
    const startIndex = currentPage * itemsToShow
    const endIndex = startIndex + itemsToShow
    return products.slice(startIndex, endIndex)
  }

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  const handleProductClick = (product: Laptop) => {
    if (onProductClick) {
      onProductClick(product)
    } else {
      window.location.href = `/product/${product.id}`
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="top-product bg-white py-4">
      <div className="mx-auto px-2">
        <h2 
          className="text-left text-gray-800 mb-8 font-thai"
          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
        >
          ສິນຄ້າໃຫມ່ ແລະ ສິນຄ້າຂາຍດີ
        </h2>
        
        <div className="relative px-4 sm:px-8">
          {/* Navigation Buttons */}
          {showNavigation && currentPage > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 sm:left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-xl hover:bg-gray-50 border-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              onClick={goToPrevious}
              aria-label="Previous products"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </Button>
          )}
          
          {showNavigation && currentPage < totalPages - 1 && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 sm:right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-xl hover:bg-gray-50 border-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              onClick={goToNext}
              aria-label="Next products"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </Button>
          )}

          {/* Products Grid */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div className="product-grid grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-4">
              {getCurrentPageProducts().map((product) => (
                <div 
                  key={product.id}
                  className="category-item flex flex-col items-center cursor-pointer group"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Square Image Container - Fixed size container */}
                  <div className="relative mb-2 sm:mb-3 w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                    {/* Inner container for styling with consistent dimensions */}
                    <div className="absolute inset-0 rounded-lg border-2 border-gray-200 bg-white shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105 flex items-center justify-center p-1 sm:p-2">
                      <img 
                        src={product.image || "/placeholder-image.jpg"}
                        alt={product.name}
                        className="max-w-[90%] max-h-[90%] object-contain"
                      />
                    </div>
                    {/* Top badge */}
                    <div className={`absolute top-0 right-0 text-white text-xs font-bold px-1 py-1 rounded-bl-lg rounded-tr-lg border-2 border-white font-thai transform translate-x-1/4 -translate-y-1/4 z-10 ${
                      product.recommend === 'new' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {product.recommend === 'new' ? 'ໃຫມ່' : 'ຂາຍດີ'}
                    </div>
                  </div>
                  
                  {/* Product Name */}
                  <p 
                    className="text-center text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 line-clamp-2 max-w-full px-1 font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    title={product.name}
                  >
                    {product.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Indicators */}
          {showNavigation && (
            <div className="flex justify-center mt-4 space-x-1">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentPage 
                      ? 'bg-yellow-500 shadow-lg scale-110' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentPage(index)}
                  aria-label={`Go to page ${index + 1} of ${totalPages}`}
                  title={`Page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}