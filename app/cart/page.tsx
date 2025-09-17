"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCart, CartItem } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getUserOrders, Order } from "@/lib/orders"
import { ShoppingCart, History, Plus, Minus, X, Package, Clock, RefreshCw } from "lucide-react"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, addToCart } = useCart()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  useEffect(() => {
    const loadUserOrders = async () => {
      if (!user) return
      
      setIsLoadingOrders(true)
      try {
        const userOrders = await getUserOrders(user.uid)
        setOrders(userOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    loadUserOrders()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'processing':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ລໍຖ້າການອະນຸມັດ'
      case 'processing':
        return 'ກໍາລັງດໍາເນີນການ'
      case 'completed':
        return 'ສໍາເລັດແລ້ວ'
      case 'cancelled':
        return 'ຍົກເລີກແລ້ວ'
      default:
        return status
    }
  }

  const handleReorderItem = (item: any) => {
    // Create a proper Laptop object for addToCart
    const laptopItem: any = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      rating: 0,
      sold: 0,
      brand: "Unknown",
      processor: "Unknown",
      ram: "Unknown",
      storage: "Unknown",
      graphics: "Unknown",
      display: "Unknown",
      weight: "Unknown"
    }
    addToCart(laptopItem)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header cartCount={getTotalItems()} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold mb-6 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
          ກະຕ່າ & ປະຫວັດການສັ່ງຊື້
        </h1>

        <Tabs defaultValue="cart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cart" className="flex items-center space-x-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              <ShoppingCart className="w-4 h-4" />
              <span>ກະຕ່າ ({getTotalItems()})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              <History className="w-4 h-4" />
              <span>ປະຫວັດການສັ່ງຊື້ ({orders.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Cart Tab */}
          <TabsContent value="cart" className="mt-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ກະຕ່າຂອງທ່ານຫວ່າງເປົ່າ
                </h3>
                <p className="text-gray-500 mb-6 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ເພີ່ມສິນຄ້າໃສ່ກະຕ່າເພື່ອເລີ່ມການຊື້
                </p>
                <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  <Link href="/products">ເລີ່ມຊື້ສິນຄ້າ</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item: CartItem) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-contain" />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center">
                              No Image
                            </div>
                          )}
                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-orange-600 font-medium">${item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right w-24">
                            <p className="font-bold text-lg">${(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-500 hover:text-red-500 h-8 w-8" 
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        ສະຫຼຸບການສັ່ງຊື້
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ລາຄາລວມ</span>
                        <span>${getTotalPrice().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ຄ່າຈັດສົ່ງ</span>
                        <span className="text-green-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ຟຣີ</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold text-lg">
                        <span className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ລວມທັງໝົດ</span>
                        <span className="text-orange-600">${getTotalPrice().toLocaleString()}</span>
                      </div>
                      <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        <Link href="/checkout">ດໍາເນີນການຊໍາລະເງິນ</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders" className="mt-6">
            {!user ? (
              <div className="text-center py-12">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ກະລຸນາເຂົ້າສູ່ລະບົບ
                </h3>
                <p className="text-gray-500 mb-6 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງປະຫວັດການສັ່ງຊື້ຂອງທ່ານ
                </p>
                <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  <Link href="/login">ເຂົ້າສູ່ລະບົບ</Link>
                </Button>
              </div>
            ) : isLoadingOrders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">ກໍາລັງໂຫຼດຂໍ້ມູນ...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ຍັງບໍ່ມີການສັ່ງຊື້
                </h3>
                <p className="text-gray-500 mb-6 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ທ່ານຍັງບໍ່ໄດ້ສັ່ງຊື້ສິນຄ້າ ເລີ່ມສັ່ງຊື້ກັບພວກເຮົາແລ້ວ!
                </p>
                <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  <Link href="/products">ເລີ່ມຊື້ສິນຄ້າ</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <CardTitle className="text-lg">ເລກທີ່ສັ່ງຊື້: {order.id}</CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('lo-LA')}
                            </span>
                            <span className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              {order.totalItems} ລາຍການ
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(order.status)} text-white font-thai`} style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            {getStatusText(order.status)}
                          </Badge>
                          <span className="text-xl font-bold text-orange-600">
                            ${order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                  No Image
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  ຈໍານວນ: {item.quantity} × ${item.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">${(item.price * item.quantity).toLocaleString()}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReorderItem(item)}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                ສັ່ງຊື້ຄືນ
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-thai"
                          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                          asChild
                        >
                          <Link href={`/order-success?orderId=${order.id}`}>
                            ເບິ່ງລາຍລະອຽດ
                          </Link>
                        </Button>
                        
                        {order.status === 'completed' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              order.items.forEach(item => handleReorderItem(item))
                            }}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai"
                            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            ສັ່ງຊື້ທັງໝົດຄືນ
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}