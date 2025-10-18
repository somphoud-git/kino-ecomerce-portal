"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { TopProductsSection } from "@/components/products/top-products-section"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { LoginModal } from "@/components/auth/login-modal"
import { FloatingCartButton } from "@/components/cart/floating-cart-button"
import { useProducts } from "@/hooks/use-products"
import { useTopProducts } from "@/hooks/use-top-products"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/AuthContext"
import type { Laptop, Category } from "@/lib/types"

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState("best")
  const [wishlist, setWishlist] = useState<number[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState<"cart" | "buy" | null>(null)
  const [pendingLaptop, setPendingLaptop] = useState<Laptop | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const itemsPerPage = 20 // Multiple of 4 for desktop grid (5 rows x 4 columns), also works with mobile 2-column grid

  const searchParams = useSearchParams()
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  // Fetch products from Firebase
  const { products: allProducts, loading: productsLoading, error } = useProducts()
  
  // Fetch top products
  const { products: topProducts, loading: topProductsLoading } = useTopProducts()

  // Handle category from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Filter and sort products based on selected criteria and category
  const sortedLaptops = useMemo(() => {
    let filtered = [...allProducts].filter(Boolean)
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    
    // Sort filtered products
    return filtered.sort((a, b) => {
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
  }, [allProducts, sortBy, selectedCategory])

  // Calculate pagination only if products exceed itemsPerPage
  const totalPages = Math.ceil(sortedLaptops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLaptops = sortedLaptops.length <= itemsPerPage ? sortedLaptops : sortedLaptops.slice(startIndex, endIndex)

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Helper function to check if product is in stock based on quantity
  const isProductInStock = (laptop: Laptop) => {
    // Check quantity first, if exists and is 0 or less, item is out of stock
    if (laptop.quantity !== undefined) {
      return laptop.quantity > 0
    }
    // Fallback to inStock boolean if quantity is not available
    return laptop.inStock
  }

  const handleAddToCart = (laptop: Laptop, quantity = 1) => {
    if (!laptop || !laptop.id || !laptop.name || !laptop.price) {
      console.error("Invalid laptop object:", laptop);
      return;
    }

    // Check if product is in stock before adding to cart
    if (!isProductInStock(laptop)) {
      console.log("Product is out of stock:", laptop.name);
      toast({
        title: "⚠️ ສິນຄ້າໝົດ",
        description: "ບໍ່ສາມາດເພີ່ມສິນຄ້າໄດ້, ສິນຄ້ານີ້ໝົດແລ້ວ",
        variant: "destructive",
        style: { 
          fontFamily: "'Noto Sans Lao Looped', sans-serif",
          background: "#FEE2E2", 
          border: "1px solid #FECACA",
          color: "#B91C1C"
        }
      });
      return;
    }
    
    // Check if adding would exceed available quantity
    if (laptop.quantity !== undefined) {
      // Find how many of this product are already in the cart
      const inCartQuantity = cartItems.find(item => item.id === laptop.id)?.quantity || 0;
      
      // Check if adding would exceed available quantity
      if (inCartQuantity + quantity > laptop.quantity) {
        console.log(`Cannot add more. In cart: ${inCartQuantity}, Adding: ${quantity}, Available: ${laptop.quantity}`);
        toast({
          title: "⚠️ ຂໍ້ຈຳກັດສິນຄ້າ",
          description: `ບໍ່ສາມາດເພີ່ມສິນຄ້າໄດ້, ສິນຄ້າໃນສະຕ໋ອກມີພຽງແຕ່ ${laptop.quantity} ລາຍການ ແລະ ທ່ານໄດ້ເພີ່ມເຂົ້າກະຕ່າແລ້ວ ${inCartQuantity} ລາຍການ`,
          variant: "destructive",
          style: { 
            fontFamily: "'Noto Sans Lao Looped', sans-serif",
            background: "#FEE2E2", 
            border: "1px solid #FECACA",
            color: "#B91C1C"
          }
        });
        return;
      }
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
      
      // Show success toast notification
      const currentQuantity = cartItems.find(item => item.id === laptop.id)?.quantity || 0;
      const newQuantity = currentQuantity + quantity;
      toast({
        title: "🛒 ເພີ່ມສິນຄ້າສຳເລັດ",
        description: `ສິນຄ້າເພີ່ມເຂົ້າກະຕ້າ ແລ້ວ ${newQuantity} ລາຍການ`,
        style: { 
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          fontFamily: "'Noto Sans Lao Looped', sans-serif"
        }
      });
    }
  }

  const handleBuyNow = (laptop: Laptop) => {
    if (!laptop || !laptop.id || !laptop.name || !laptop.price) {
      console.error("Invalid laptop object:", laptop);
      return;
    }

    // Check if product is in stock before proceeding to buy
    if (!isProductInStock(laptop)) {
      console.log("Product is out of stock:", laptop.name);
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
      window.location.href = "/login"
      console.log("Redirecting to login page for buy now:", validLaptop.name)
    } else {
      // User is authenticated, add to cart and redirect to checkout
      addToCart(validLaptop, 1)
      window.location.href = "/checkout"
      console.log("Proceeding to checkout:", validLaptop.name)
    }
  }

  const handleViewDetails = (laptop: Laptop) => {
    // Allow viewing details without authentication
    window.location.href = `/product/${laptop.id}`
    console.log("Navigating to product page:", laptop.name)
  }

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category?.name)
    setCurrentPage(1) // Reset to first page when category changes
    
    // Update URL without page reload
    const url = new URL(window.location.href)
    if (category) {
      url.searchParams.set('category', category.name)
    } else {
      url.searchParams.delete('category')
    }
    window.history.pushState({}, '', url.toString())
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
        console.log("Proceeding to checkout after login:", pendingLaptop.name)
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
        <Header 
          wishlistCount={wishlist.length} 
          cartCount={getTotalItems()} 
          selectedCategory={selectedCategory}
          onCategorySelectAction={handleCategorySelect}
        />
        {/* FIX APPLIED HERE: Replaced ml-[5%] mr-[5%] with standard responsive padding (px-4 sm:px-6 lg:px-8) */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"> 
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
        <Header 
          wishlistCount={wishlist.length} 
          cartCount={getTotalItems()} 
          selectedCategory={selectedCategory}
          onCategorySelectAction={handleCategorySelect}
        />
        {/* FIX APPLIED HERE: Replaced ml-[5%] mr-[5%] with standard responsive padding (px-4 sm:px-6 lg:px-8) */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
                ລອງໃຫມ່
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
        <Header 
          wishlistCount={wishlist.length} 
          cartCount={getTotalItems()} 
          selectedCategory={selectedCategory}
          onCategorySelectAction={handleCategorySelect}
        />
        {/* FIX APPLIED HERE: Replaced ml-[5%] mr-[5%] with standard responsive padding (px-4 sm:px-6 lg:px-8) */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p 
                className="text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ບໍ່ມີສິນຄ້າປະເພດນີ້
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
      <Header 
        wishlistCount={wishlist.length} 
        cartCount={getTotalItems()} 
        selectedCategory={selectedCategory}
        onCategorySelectAction={handleCategorySelect}
      />

      {/* FIX APPLIED HERE: Replaced ml-[5%] mr-[5%] with standard responsive padding (px-4 sm:px-6 lg:px-8) */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"> 
        {/* Top Products Section */}
        {topProducts.length > 0 && (
          <div className="mb-12">
            <TopProductsSection 
              products={topProducts}
              onProductClick={handleViewDetails}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white py-4" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
          <div className="products-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {currentLaptops.filter(laptop => laptop && laptop.id).map((laptop) => (
              <div key={laptop.id || Math.random()} className="product-card bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                {/* Fixed Image Container - Clickable */}
                <div 
                  className="product-image aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
                  onClick={() => handleViewDetails(laptop)}
                >
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img 
                      src={laptop.image || "/placeholder-image.jpg"} 
                      alt={laptop.name} 
                      className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg"
                      }}
                    />
                  </div>
                  {/* Out of stock badge in top-right corner */}
                  {!isProductInStock(laptop) && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-gray-500 text-white px-2 py-1 rounded font-thai font-semibold text-xs" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        ສິນຄ້າໝົດ
                      </span>
                    </div>
                  )}
                </div>
                <div className="product-info p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 
                      className="product-title text-lg font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleViewDetails(laptop)}
                    >
                      {laptop.name || "Unknown Product"}
                    </h3>
                    <p className="product-description text-sm text-gray-600 mt-2 line-clamp-2">
                      {laptop.description || "No description available."}
                    </p>
                    <div className="product-pricing flex justify-between items-center mt-2">
                      <span className="sale-price text-red-500 text-sm font-bold">{(laptop.price || 0).toLocaleString()} ກີບ</span>
                      {laptop.discountPrice && (
                        <span className="discount-price text-gray-500 line-through text-xs">{laptop.discountPrice.toLocaleString()} ກີບ</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto flex space-x-1 sm:space-x-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-8 sm:h-10 font-thai text-xs sm:text-sm px-1 sm:px-3"
                      onClick={() => handleViewDetails(laptop)}
                    >
                      <span className="hidden sm:inline">ລາຍລະອຽດ</span>
                      <span className="sm:hidden">ລາຍລະອຽດ</span>
                    </Button>
                    <Button
                      className="flex-1 h-8 sm:h-10 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-1 sm:px-3"
                      onClick={() => handleAddToCart(laptop)}
                      disabled={!isProductInStock(laptop)}
                    >
                      <span className="hidden sm:inline">ເພີ່ມໃສ່ກະຕ່າ</span>
                      <span className="sm:hidden">ຊື່</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 sm:mt-12 space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="font-thai text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
              >
                <span className="hidden sm:inline">ກ່ອນໜ້າ</span>
                <span className="sm:hidden">ກ່ອນ</span>
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show fewer pages on mobile - simplified logic
                    const showRange = totalPages > 7 ? 1 : 2
                    return Math.abs(page - currentPage) <= showRange || page === 1 || page === totalPages
                  })
                  .map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm ${
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
                className="font-thai text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
              >
                <span className="hidden sm:inline">ຖັດໄປ</span>
                <span className="sm:hidden">ຖັດ</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Floating Cart Button */}
      <FloatingCartButton />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        actionType={loginAction}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}