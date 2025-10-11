"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Laptop } from '@/lib/types'

interface CarouselProps {
  products: Laptop[]
  title?: string
  onProductClick?: (product: Laptop) => void
}

export function Carousel({ products, title, onProductClick }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(4)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setItemsToShow(2)
      } else if (width < 768) {
        setItemsToShow(2)
      } else if (width < 1024) {
        setItemsToShow(3)
      } else {
        setItemsToShow(4)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, products.length - itemsToShow)

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }

  const handleProductClick = (product: Laptop) => {
    if (onProductClick) {
      onProductClick(product)
    } else {
      // Default behavior: navigate to product page
      window.location.href = `/product/${product.id}`
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-white py-6">
      {title && (
        <h2 
          className="text-2xl font-bold text-gray-800 mb-6 text-center font-thai"
          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
        >
          {title}
        </h2>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {currentIndex < maxIndex && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden" ref={carouselRef}>
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              width: `${(products.length / itemsToShow) * 100}%`
            }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className={`flex-shrink-0 px-2`}
                style={{ width: `${100 / products.length}%` }}
              >
                <div 
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-50 p-4">
                    <img 
                      src={product.image || "/placeholder-image.jpg"} 
                      alt={product.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3">
                    <h3 
                      className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="mt-2">
                      <span className="text-lg font-bold text-red-500">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Recommend Badge */}
                    {product.recommend && (
                      <div className="mt-2">
                        <span 
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full font-thai ${
                            product.recommend === 'top' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                        >
                          {product.recommend === 'top' ? 'ຍອດນິຍົມ' : 'ໃໝ່'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {maxIndex > 0 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}