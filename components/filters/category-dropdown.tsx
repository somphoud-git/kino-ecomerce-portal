"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCategories } from "@/hooks/use-categories"
import type { Category } from "@/lib/types"

interface CategoryDropdownProps {
  selectedCategory?: string
  onCategorySelectAction: (category: Category | null) => void
  className?: string
}

export function CategoryDropdown({ 
  selectedCategory, 
  onCategorySelectAction, 
  className = "" 
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { categories, loading, error } = useCategories()

  const handleCategorySelect = (category: Category | null) => {
    onCategorySelectAction(category)
    setIsOpen(false)
  }

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`font-thai ${className}`}
          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif", color: "black" }}
        >
          {selectedCategoryData ? selectedCategoryData.displayName : "ໝວດໝູ່ສິນຄ້າ"}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 max-h-80 overflow-y-auto"
      >
        {/* All Categories Option */}
        <DropdownMenuItem
          onClick={() => handleCategorySelect(null)}
          className={`font-thai cursor-pointer ${!selectedCategory ? 'bg-orange-50 text-orange-600' : ''}`}
          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
        >
          ສິນຄ້າທັງໝົດ
        </DropdownMenuItem>
        
        {/* Loading State */}
        {loading && (
          <DropdownMenuItem disabled className="font-thai justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              <span>ກໍາລັງໂຫຼດ...</span>
            </div>
          </DropdownMenuItem>
        )}

        {/* Error State */}
        {error && (
          <DropdownMenuItem disabled className="font-thai text-red-500">
            {error}
          </DropdownMenuItem>
        )}

        {/* Category Items */}
        {!loading && !error && categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className={`font-thai cursor-pointer ${
              selectedCategory === category.name ? 'bg-orange-50 text-orange-600' : ''
            }`}
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            <div className="flex flex-col">
              <span>{category.displayName}</span>
            </div>
          </DropdownMenuItem>
        ))}

        {/* No Categories */}
        {!loading && !error && categories.length === 0 && (
          <DropdownMenuItem disabled className="font-thai">
            ບໍ່ມີສິນຄ້າປະເພດນີ້
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}