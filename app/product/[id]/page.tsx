"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Heart, ShoppingCart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ProductCard } from "@/components/products/product-card"
import { useProduct, useProducts } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/AuthContext"
import type { Laptop } from "@/lib/types"

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [wishlist, setWishlist] = useState<number[]>([])

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()
  const { user, loading: authLoading } = useAuth()
  
  // Fetch product from Firebase
  const { product: laptop, loading: productLoading, error } = useProduct(resolvedParams.id)
  
  // Fetch related products (same category, excluding current product)
  const { products: allProducts } = useProducts()
  const relatedProducts = laptop 
    ? allProducts.filter(p => p.id !== laptop.id && p.category === laptop.category).slice(0, 4)
    : []

  // Check if product is in stock (quantity-based with fallback to inStock)
  const isProductInStock = (laptop: Laptop) => {
    // Check quantity first, if exists and is 0 or less, item is out of stock
    if (laptop.quantity !== undefined) {
      return laptop.quantity > 0
    }
    // Fallback to inStock boolean if quantity is not available
    return laptop.inStock
  }

  // Loading state
  if (productLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          wishlistCount={wishlist.length} 
          cartCount={getTotalItems()} 
        />
        {/* The container below is fine since it uses 'container mx-auto px-4' */}
        <div className="container mx-auto px-4 py-8"> 
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p 
                className="mt-4 text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ກໍາລັງໂຫຼດລາຍລະອຽດຂອງສິນຄ້າ...
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
        />
        {/* The container below is fine since it uses 'container mx-auto px-4' */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ເກີດຂໍ້ຜິດພາດ</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/products")}>
              ກັບໄປຫນ້າສິນຄ້າ
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!laptop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          wishlistCount={wishlist.length} 
          cartCount={getTotalItems()} 
        />
        {/* The container below is fine since it uses 'container mx-auto px-4' */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ບໍ່ມີສິນຄ້າ</h1>
            <Button onClick={() => router.push("/products")}>
              ກັບໄປຫນ້າສິນຄ້າ
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleAddToCart = (laptop: Laptop, quantity = 1) => {
    // Check if product is in stock before adding to cart
    if (!isProductInStock(laptop)) {
      console.log("Product is out of stock:", laptop.name);
      return;
    }
    
    // Check if adding would exceed available quantity
    if (laptop.quantity !== undefined) {
      // Find how many of this product are already in the cart
      const inCartQuantity = cartItems.find(item => item.id === laptop.id)?.quantity || 0;
      
      // Check if adding would exceed available quantity
      if (inCartQuantity + quantity > laptop.quantity) {
        console.log(`Cannot add more. In cart: ${inCartQuantity}, Adding: ${quantity}, Available: ${laptop.quantity}`);
        return;
      }
    }
    
    // Check if user is authenticated
    if (!user) {
      window.location.href = "/login"
      console.log("Redirecting to login page for add to cart:", laptop.name)
    } else {
      // User is authenticated, add directly to cart with the specified quantity
      addToCart(laptop, quantity)
      console.log("Added to cart:", laptop.name, "Quantity:", quantity)
    }
  }

  const handleBuyNow = (laptop: Laptop) => {
    // Check if product is in stock before proceeding to buy
    if (!isProductInStock(laptop)) {
      console.log("Product is out of stock:", laptop.name);
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      window.location.href = "/login"
      console.log("Redirecting to login page for buy now:", laptop.name)
    } else {
      // User is authenticated, add to cart and redirect to checkout
      for (let i = 0; i < quantity; i++) {
        addToCart(laptop)
      }
      window.location.href = "/checkout"
      console.log("Proceeding to checkout:", laptop.name)
    }
  }

  const handleViewRelatedDetails = (relatedLaptop: Laptop) => {
    window.location.href = `/product/${relatedLaptop.id}`
  }

  return (
    <div className=" min-h-screen bg-gray-50" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <Header 
        wishlistCount={wishlist.length} 
        cartCount={getTotalItems()} 
      />

      {/* FIX APPLIED HERE: Replaced ml-[2cm] mr-[2cm] with standard responsive padding (px-4 sm:px-6 lg:px-8) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> 
        {/* The inner container is now redundant, but we keep its padding/py classes for spacing */}
        <div className="py-8 ">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="font-thai"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ກັບໄປຫນ້າສິນຄ້າ
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Product Images */}
              <div className="space-y-3">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-md mx-auto">
                  <img
                    src={laptop.image || "/placeholder.svg"}
                    alt={laptop.inStock ? "ສິນຄ້າມີຢູ່" : "ສິນຄ້າໝົດ"}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                {/* Title and Badges */}
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                      <Badge 
                        className="bg-red-500 text-white font-thai text-xs"
                      >
                        ລາຄາພິເສດ
                      </Badge>
                    )}
                    {!isProductInStock(laptop) && (
                      <Badge 
                        className="bg-gray-500 text-white text-xs"
                      >
                        ສິນຄ້າໝົດ
                      </Badge>
                    )}
                    <Badge variant="outline" className="font-thai text-xs">
                      {laptop.category}
                    </Badge>
                  </div>
                  <h1 
                    className="text-2xl font-bold text-gray-900 font-thai"
                  >
                    {laptop.name}
                  </h1>
                  
                  {/* Product Description */}
                  {laptop.description && (
                    <div className="mt-3">
                      <p 
                        className="text-gray-600 text-sm leading-relaxed font-thai"
                      >
                        {laptop.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-red-500">
                        {laptop.price.toLocaleString()} ກີບ
                    </span>
                    {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                      <span className="text-xl text-gray-500 line-through">
                        {laptop.originalPrice.toLocaleString()} ກີບ
                      </span>
                    )}
                    {laptop.discountPrice && (
                      <span className="discount-price text-gray-500 line-through">{laptop.discountPrice.toLocaleString()} ກີບ</span>
                    )}
                  </div>
                  {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                    <div className="text-base text-green-600 font-thai">
                      ປະຫຍັດ {(laptop.originalPrice - laptop.price).toLocaleString()} ກີບ
                    </div>
                  )}
                </div>

                <Separator />

                <Separator />
                <div>
                <div>
                    <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      className="flex-1 py-2 text-base text-black bg-red-500 hover:bg-red-600 font-lao"
                      disabled={!isProductInStock(laptop)}
                      onClick={() => handleAddToCart(laptop, quantity)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      ເພີ່ມໃສ່ກະຕ່າ
                    </Button>
                    </div>
                    </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        // FIX APPLIED HERE: Replaced ml-[2cm] mr-[2cm] with standard responsive padding (px-4 sm:px-6 lg:px-8)
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* The inner container is now redundant, but we keep its padding/py classes for spacing */}
          <div className="py-6 ">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 
                className="text-xl font-bold text-gray-900 mb-4 font-thai"
              >
                ສິນຄ້າທີ່ກ່ຽວຂ້ອງ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {relatedProducts.map((relatedLaptop) => (
                  <ProductCard
                    key={relatedLaptop.id}
                    laptop={relatedLaptop}
                    viewMode="grid"
                    isWishlisted={wishlist.includes(relatedLaptop.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onViewDetails={handleViewRelatedDetails}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}