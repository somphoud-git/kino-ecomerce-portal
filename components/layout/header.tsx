"use client"
import { useState } from "react"
import { Search, ShoppingCart, Bell, ChevronDown, Heart, User, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductSearch } from "@/components/search/product-search"
import { CategoryDropdown } from "@/components/filters/category-dropdown"
import { useAuth } from "@/contexts/AuthContext"
import { LogoutModal } from "@/components/auth/logout-modal"
import type { Category } from "@/lib/types"
import Link from "next/link"

interface HeaderProps {
  wishlistCount?: number
  cartCount: number
  selectedCategory?: string
  onCategorySelectAction?: (category: Category | null) => void
}

export function Header({ 
  wishlistCount = 0, 
  cartCount, 
  selectedCategory, 
  onCategorySelectAction 
}: HeaderProps) {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false)
  }

  const handleCategorySelect = (category: Category | null) => {
    if (onCategorySelectAction) {
      onCategorySelectAction(category)
    } else {
      // Default behavior: navigate to products page with category filter
      const url = category ? `/products?category=${encodeURIComponent(category.name)}` : '/products'
      window.location.href = url
    }
  }
  
  return (
    <header className="bg-white border-b shadow-sm" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Logo, Search (Desktop), and User Actions */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Search (Desktop) */}
          <div className="flex items-center space-x-8 flex-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                ຮ້ານ NoRacing
              </span>
            </Link>

            {/* Search - Desktop Only */}
            <div className="hidden lg:block flex-1 max-w-2xl">
              <ProductSearch 
                placeholder="ຄົ້ນຫາສິນຄ້າ..."
                className="w-full"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {authLoading ? (
              // Loading state - show skeleton or placeholder
              <div className="flex items-center space-x-2">
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500">
                      {cartCount}
                    </Badge>
                  </Button>
                </Link>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user && userProfile ? (
              // User is authenticated - Show cart and logout buttons
              <div className="flex items-center space-x-2">
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500">
                      {cartCount}
                    </Badge>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogoutClick}
                  className="font-thai"
                  title="ອອກຈາກລະບົບ"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              // User is not authenticated - Show only login button, hide cart
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-thai">
                    <User className="w-4 h-4 mr-1" />
                    ເຂົ້າສູ່ລະບົບ
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Middle Row: Search Input - Mobile Only */}
        <div className="lg:hidden py-3 border-t">
          <div className="w-full">
            <ProductSearch 
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
              className="w-full"
            />
          </div>
        </div>

        {/* Bottom Row: Navigation */}
        <nav className="flex items-center justify-between text-sm">
          <div>
            <Link href="/products" className="text-black hover:text-gray-900 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              ສິນຄ້າທັງໝົດ
            </Link>
          </div>
          <div className="flex items-center">
            <CategoryDropdown
              selectedCategory={selectedCategory}
              onCategorySelectAction={handleCategorySelect}
              className="text-gray-600 hover:text-gray-900"
            />
          </div>
        </nav>
      </div>
      
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onCloseAction={handleCloseLogoutModal} 
      />
    </header>
  )
}