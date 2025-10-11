"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-products"
import type { Laptop } from "@/lib/types"

interface ProductSearchProps {
  onProductSelect?: (product: Laptop) => void
  placeholder?: string
  className?: string
}

export function ProductSearch({ 
  onProductSelect, 
  placeholder = "ຄົ້ນຫາສິນຄ້າ...", 
  className = "" 
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Laptop[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  
  const { products, loading } = useProducts()

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([])
      setIsOpen(false)
      return
    }

    // Convert search term to lowercase for case-insensitive matching
    const searchLower = searchTerm.toLowerCase()
    
    // Filter products that contain any of the searched letters/characters
    const filtered = products.filter(product => {
      const productName = product.name.toLowerCase()
      
      // Check if product name contains any character from the search term
      return searchLower.split('').some(char => {
        // Skip spaces and special characters
        if (char.trim() === '') return false
        return productName.includes(char)
      }) || productName.includes(searchLower)
    })

    setFilteredProducts(filtered.slice(0, 8)) // Limit to 8 results
    setIsOpen(filtered.length > 0)
  }, [searchTerm, products])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProductClick = (product: Laptop) => {
    setSearchTerm("")
    setIsOpen(false)
    
    if (onProductSelect) {
      onProductSelect(product)
    } else {
      // Default behavior: navigate to product page
      window.location.href = `/product/${product.id}`
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (filteredProducts.length > 0) setIsOpen(true)
          }}
          className="pl-10 pr-10 w-full"
          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <span className="text-sm mt-2 block">ກໍາລັງຄົ້ນຫາ...</span>
            </div>
          )}
          
          {!loading && filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.inStock ? product.name : "ສິນຄ້າໝົດ"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 
                  className="text-sm font-medium text-gray-900 truncate"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                >
                  {product.name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-bold text-red-500">
                    ₭{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-500 line-through">
                      ₭{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {!product.inStock && (
                    <span 
                      className="text-xs bg-gray-500 text-white font-medium px-2 py-1 rounded"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    >
                      ສິນຄ້າໝົດ
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {searchTerm && filteredProducts.length === 0 && !loading && (
            <div 
              className="p-4 text-center text-gray-500"
              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
            >
              ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ
            </div>
          )}
        </div>
      )}
    </div>
  )
}