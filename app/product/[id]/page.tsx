"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Heart, ShoppingCart, Zap, Check, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ProductCard } from "@/components/products/product-card"
import { LoginModal } from "@/components/auth/login-modal"
import { laptops } from "@/lib/data"
import { useCart } from "@/hooks/use-cart"
import type { Laptop } from "@/lib/types"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [wishlist, setWishlist] = useState<number[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState<"cart" | "buy" | null>(null)
  const [pendingLaptop, setPendingLaptop] = useState<Laptop | null>(null)

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()

  // Find the laptop by ID
  const laptop = laptops.find(l => l.id === parseInt(params.id))

  // Get related products (same category, excluding current product)
  const relatedProducts = laptops
    .filter(l => l.id !== parseInt(params.id) && l.category === laptop?.category)
    .slice(0, 4)

  if (!laptop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header wishlistCount={wishlist.length} cartCount={getTotalItems()} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ບໍ່ພົບສິນຄ້າ</h1>
            <p className="text-gray-600 mb-6">ສິນຄ້າທີ່ທ່ານກໍາລັງມົງຫາບໍ່ມີອຢູ່ໃນລະບົບ</p>
            <Button onClick={() => router.push("/products")}>
              ກັບໄປໝັ່ງສິນຄ້າ
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Mock additional images for demonstration
  const images = [
    laptop.image || "/placeholder.svg",
    laptop.image || "/placeholder.svg",
    laptop.image || "/placeholder.svg",
  ]

  const features = [
    { icon: <Truck className="w-4 h-4" />, text: laptop.freeShipping ? "ສ່ງຟຣີ" : "ມີຄ່າຈັດສ່ງ" },
    { icon: <Shield className="w-4 h-4" />, text: "ຮັບປະກັນ 1 ປີ" },
    { icon: <RotateCcw className="w-4 h-4" />, text: "ເປຼີ່ຍນຄືນໄດ້ 7 ມື້" },
    { icon: <Check className="w-4 h-4" />, text: laptop.inStock ? "ພໍ້ມສ່ງ" : "ສິນຄ້າໝົດ" },
  ]

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

  const handleViewRelatedDetails = (relatedLaptop: Laptop) => {
    window.location.href = `/product/${relatedLaptop.id}`
  }

  const handleLogin = (email: string, password: string) => {
    console.log("[v0] Login attempt:", { email, action: loginAction })
    setShowLoginModal(false)

    if (pendingLaptop) {
      if (loginAction === "cart") {
        for (let i = 0; i < quantity; i++) {
          addToCart(pendingLaptop)
        }
        console.log("[v0] Added to cart after login:", pendingLaptop.name)
      } else if (loginAction === "buy") {
        for (let i = 0; i < quantity; i++) {
          addToCart(pendingLaptop)
        }
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

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ກັບ
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={laptop.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex space-x-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${laptop.name} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Title and Badges */}
              <div>
                <div className="flex items-start gap-2 mb-2">
                  {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                    <Badge 
                      className="bg-red-500 text-white font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    >
                      ລາຄາພິເສດ
                    </Badge>
                  )}
                  {!laptop.inStock && (
                    <Badge 
                      className="bg-gray-500 text-white font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    >
                      ສິນຄ້າໝົດ
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-thai">
                    {laptop.category}
                  </Badge>
                </div>
                <h1 
                  className="text-3xl font-bold text-gray-900 font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                >
                  {laptop.name}
                </h1>
              </div>

              {/* Rating and Sales */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(laptop.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({laptop.rating})</span>
                </div>
                <span className="text-sm text-gray-500 font-thai">
                  ຂາຍແລ້ວ {laptop.sold} ຊິ້ນ
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold text-red-500">
                    ฿{laptop.price.toLocaleString()}.00
                  </span>
                  {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                    <span className="text-2xl text-gray-500 line-through">
                      ฿{laptop.originalPrice.toLocaleString()}.00
                    </span>
                  )}
                </div>
                {laptop.originalPrice && laptop.originalPrice > laptop.price && (
                  <div className="text-lg text-green-600 font-thai">
                    ປະຫຍັດ ฿{(laptop.originalPrice - laptop.price).toLocaleString()}.00
                  </div>
                )}
              </div>

              <Separator />

              {/* Specifications */}
              <div className="space-y-4">
                <h3 
                  className="text-xl font-semibold font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                >
                  ຄຸນສົມບັດ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-thai">ຫນ້າຈົເ:</span>
                      <span className="font-medium">{laptop.screen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-thai">ຫນ່ວຍຄວາມຈໍາ:</span>
                      <span className="font-medium">{laptop.ram}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-thai">ພື້ນທີ່ຈັດເກັບ:</span>
                      <span className="font-medium">{laptop.storage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-thai">ໂປຼເສສເລໍ:</span>
                      <span className="font-medium">{laptop.processor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-4">
                <h3 
                  className="text-xl font-semibold font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                >
                  ບໍລິການ
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="text-blue-600">{feature.icon}</div>
                      <span 
                        className="font-thai"
                        style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quantity and Actions */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span 
                    className="text-lg font-medium font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    ຈໍານວນ:
                  </span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!laptop.inStock}
                      className="px-4 py-2"
                    >
                      -
                    </Button>
                    <span className="px-6 py-2 border-x text-lg font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!laptop.inStock}
                      className="px-4 py-2"
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWishlist(laptop.id)}
                    className="p-3"
                  >
                    <Heart className={`w-6 h-6 ${wishlist.includes(laptop.id) ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="flex-1 py-3 text-lg font-thai"
                    disabled={!laptop.inStock}
                    onClick={() => handleAddToCart(laptop, quantity)}
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    ໃສ່ຕະກ້າ
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 py-3 text-lg font-thai"
                    disabled={!laptop.inStock}
                    onClick={() => handleBuyNow(laptop)}
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    ຊື້ເລີ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 
              className="text-2xl font-bold text-gray-900 mb-6 font-thai"
              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
            >
              ສິນຄ້າທີ່ກ່ຽວຂ້ອງ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
      )}

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