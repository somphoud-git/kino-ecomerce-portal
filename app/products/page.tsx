"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { LoginModal } from "@/components/auth/login-modal"
import { laptops } from "@/lib/data"
import { useCart } from "@/hooks/use-cart"
import type { Laptop } from "@/lib/types"

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState("best")
  const [wishlist, setWishlist] = useState<number[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState<"cart" | "buy" | null>(null)
  const [pendingLaptop, setPendingLaptop] = useState<Laptop | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()

  // Show all laptops without filtering
  const sortedLaptops = [...laptops].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "popular":
        return b.sold - a.sold
      default:
        return 0
    }
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedLaptops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLaptops = sortedLaptops.slice(startIndex, endIndex)

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleAddToCart = (laptop: Laptop, quantity = 1) => {
    setLoginAction("cart")
    setPendingLaptop(laptop)
    setShowLoginModal(true)
    console.log("[v0] Requesting login for add to cart:", laptop.name)
  }

  const handleBuyNow = (laptop: Laptop) => {
    setLoginAction("buy")
    setPendingLaptop(laptop)
    setShowLoginModal(true)
    console.log("[v0] Requesting login for buy now:", laptop.name)
  }

  const handleViewDetails = (laptop: Laptop) => {
    window.location.href = `/product/${laptop.id}`
    console.log("[v0] Navigating to product page:", laptop.name)
  }

  const handleLogin = (email: string, password: string) => {
    console.log("[v0] Login attempt:", { email, action: loginAction })
    setShowLoginModal(false)

    if (pendingLaptop) {
      if (loginAction === "cart") {
        addToCart(pendingLaptop, 1)
        console.log("[v0] Added to cart after login:", pendingLaptop.name)
      } else if (loginAction === "buy") {
        addToCart(pendingLaptop, 1)
        window.location.href = "/checkout"
        console.log("[v0] Proceeding to checkout after login:", pendingLaptop.name)
      }
    }

    setLoginAction(null)
    setPendingLaptop(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <Header wishlistCount={wishlist.length} cartCount={getTotalItems()} />
        <div className="absolute top-4 right-4 z-50">
          <CartDrawer
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            getTotalItems={getTotalItems}
            getTotalPrice={getTotalPrice}
            clearCart={clearCart}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Content */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {currentLaptops.map((laptop) => (
              <ProductCard
                key={laptop.id}
                laptop={laptop}
                viewMode="grid"
                isWishlisted={wishlist.includes(laptop.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ກ່ອນໜ້າ
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 ${
                      currentPage === page 
                        ? "bg-blue-600 text-white" 
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ຖັດໄປ
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        actionType={loginAction}
      />
    </div>
  )
}
