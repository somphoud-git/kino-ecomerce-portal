"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { LoginModal } from "@/components/auth/login-modal"
import { useProducts } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/AuthContext"
import type { Laptop } from "@/lib/types"

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState("best")
  const [wishlist, setWishlist] = useState<number[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState<"cart" | "buy" | null>(null)
  const [pendingLaptop, setPendingLaptop] = useState<Laptop | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // Ensure this is a multiple of 4 for proper alignment

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()
  const { user, loading: authLoading } = useAuth()
  
  // Fetch products from Firebase
  const { products: allProducts, loading: productsLoading, error } = useProducts()

  // Sort products based on selected criteria
  const sortedLaptops = useMemo(() => {
    return [...allProducts].filter(Boolean).sort((a, b) => {
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
  }, [allProducts, sortBy])

  // Calculate pagination only if products exceed itemsPerPage
  const totalPages = Math.ceil(sortedLaptops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLaptops = sortedLaptops.length <= itemsPerPage ? sortedLaptops : sortedLaptops.slice(startIndex, endIndex)

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleAddToCart = (laptop: Laptop, quantity = 1) => {
    if (!laptop || !laptop.id || !laptop.name || !laptop.price) {
      console.error("Invalid laptop object:", laptop);
      return;
    }
    
    // Ensure laptop has all required properties with fallbacks
    const validLaptop = {
      ...laptop,
      image: laptop.image || "/placeholder-image.jpg",
      description: laptop.description || "No description available"
    };
    
    if (!user) {
      window.location.href = "/login"
      console.log("Redirecting to login page for add to cart:", validLaptop.name)
    } else {
      addToCart(validLaptop, quantity)
      console.log("Added to cart:", validLaptop.name)
    }
  }

  const handleBuyNow = (laptop: Laptop) => {
    if (!laptop || !laptop.id || !laptop.name || !laptop.price) {
      console.error("Invalid laptop object:", laptop);
      return;
    }
    
    // Ensure laptop has all required properties with fallbacks
    const validLaptop = {
      ...laptop,
      image: laptop.image || "/placeholder-image.jpg",
      description: laptop.description || "No description available"
    };
    
    // Check if user is authenticated
    if (!user) {
      setLoginAction("buy")
      setPendingLaptop(validLaptop)
      setShowLoginModal(true)
      console.log("Requesting login for buy now:", validLaptop.name)
    } else {
      // User is authenticated, add to cart and redirect to checkout
      addToCart(validLaptop, 1)
      window.location.href = "/checkout"
      console.log("[v0] Proceeding to checkout:", validLaptop.name)
    }
  }

  const handleViewDetails = (laptop: Laptop) => {
    // Allow viewing details without authentication
    window.location.href = `/product/${laptop.id}`
    console.log("[v0] Navigating to product page:", laptop.name)
  }

  const handleLoginSuccess = () => {
    // Handle pending actions after successful login
    if (pendingLaptop) {
      if (loginAction === "cart") {
        addToCart(pendingLaptop, 1)
        console.log("Added to cart after login:", pendingLaptop.name)
      } else if (loginAction === "buy") {
        addToCart(pendingLaptop, 1)
        window.location.href = "/checkout"
        console.log("[v0] Proceeding to checkout after login:", pendingLaptop.name)
      }
    }
    
    setLoginAction(null)
    setPendingLaptop(null)
  }

  const handleLogin = () => {
    // This function is no longer needed since LoginModal handles authentication internally
    setShowLoginModal(false)
    setLoginAction(null)
    setPendingLaptop(null)
  }

  // Loading state
  if (productsLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header wishlistCount={wishlist.length} cartCount={getTotalItems()} />
        <div className="max-w-7xl mx-auto px-4 py-6 ml-[3cm] mr-[3cm]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p 
                className="mt-4 text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ກໍາລັງໂຫລດສິນຄ້າ...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header wishlistCount={wishlist.length} cartCount={getTotalItems()} />
        <div className="max-w-7xl mx-auto px-4 py-6 ml-[3cm] mr-[3cm]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p 
                className="text-red-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                {error}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ລອງໃໝ່
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // No products state
  if (sortedLaptops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header wishlistCount={wishlist.length} cartCount={getTotalItems()} />
        <div className="max-w-7xl mx-auto px-4 py-6 ml-[3cm] mr-[3cm]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p 
                className="text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ບໍ່ມີສິນຄ້າ
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${showLoginModal ? "bg-white" : "bg-gray-50"}`}>
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

      <div className="max-w-7xl mx-auto px-4 py-6 ml-[2cm] mr-[2cm]">
        {/* Main Content */}
        <div>
          <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentLaptops.filter(laptop => laptop && laptop.id).map((laptop) => (
              <div key={laptop.id || Math.random()} className="product-card bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                <div className="product-image aspect-square bg-gray-100">
                  <img src={laptop.image || "/placeholder-image.jpg"} alt={laptop.name || "Product"} className="w-full h-full object-contain" />
                </div>
                <div className="product-info p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="product-title text-lg font-bold text-gray-900">{laptop.name || "Unknown Product"}</h3>
                    <p className="product-description text-sm text-gray-600 mt-2 line-clamp-2">
                      {laptop.description || "No description available."}
                    </p>
                    <div className="product-pricing flex justify-between items-center mt-4">
                      <span className="sale-price text-red-500 text-xl font-bold">${(laptop.price || 0).toLocaleString()}</span>
                      {laptop.discountPrice && (
                        <span className="discount-price text-gray-500 line-through">${laptop.discountPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-10"
                      onClick={() => handleViewDetails(laptop)}
                    >
                      Detail
                    </Button>
                    <Button
                      className="flex-1 h-10 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      onClick={() => handleAddToCart(laptop)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
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
        actionType={loginAction}
        onLoginSuccess={handleLoginSuccess}
        className="bg-white"
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div> {/* Black background overlay */}
      </LoginModal>
    </div>
  )
}
