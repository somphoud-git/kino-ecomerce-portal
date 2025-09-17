"use client"
import { useState } from "react"
import { Search, ShoppingCart, Bell, ChevronDown, Heart, User, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { LogoutModal } from "@/components/auth/logout-modal"
import Link from "next/link"

interface HeaderProps {
  wishlistCount?: number
  cartCount: number
}

export function Header({ wishlistCount = 0, cartCount }: HeaderProps) {
  const { user, userProfile } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false)
  }
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 ml-[2cm] mr-[2cm]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                NoRacing
              </span>
            </Link>
          </div>

          {/* Enhanced Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Input
                placeholder="Search for laptops, brands, models..."
                className="w-full pl-4 pr-24 h-11 border-2 border-gray-200 focus:border-orange-500"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
            </div>
          </div>

          {/* Enhanced User Actions */}
          <div className="flex items-center space-x-2">
            {user && userProfile ? (
              // User is authenticated
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogoutClick}
                  className="font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">ອອກຈາກລະບົບ</span>
                </Button>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                    <span className="hidden md:inline">ປະຫວັດສັ່ງຊື້</span>
                  </Button>
                </Link>
                <Link href="/wishlist">
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart className="w-4 h-4" />
                    {wishlistCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500">
                      {cartCount}
                    </Badge>
                  </Button>
                </Link>
              </div>
            ) : (
              // User is not authenticated
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:flex font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  <User className="w-4 h-4 mr-1" />
                  ເຂົ້າສູ່ລະບົບ
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */}
       <nav className="flex items-center justify-between py-3 text-sm border-t">
          <div>
            <Link href="/products" className="text-gray-600 hover:text-gray-900 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              ສິນຄ້າທັງໝົດ
            </Link>
          </div>
          <div className="flex items-center space-x-1 font-medium font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
            <Menu className="w-4 h-4" />
            <span>ໝວດໝູ່ສິນຄ້າ</span>
            <ChevronDown className="w-4 h-4" />
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
