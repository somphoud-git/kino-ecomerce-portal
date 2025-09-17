"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/hooks/use-cart"
import { getUserOrders, Order } from "@/lib/orders"
import { Package, Clock, CreditCard, ArrowRight, ShoppingBag } from "lucide-react"

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { getTotalItems } = useCart()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const userOrders = await getUserOrders(user.uid)
        setOrders(userOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header cartCount={getTotalItems()} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">ກໍາລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={getTotalItems()} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              ປະຫວັດການສັ່ງຊື້
            </h1>
            <p className="text-gray-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              ເບິ່ງປະຫວັດການສັ່ງຊື້ຂອງທ່ານທັງໝົດ
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
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
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          ເລກທີ່ສັ່ງຊື້: {order.id}
                        </CardTitle>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Items Preview */}
                      <div className="lg:col-span-2">
                        <h4 className="font-medium mb-3 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                          ລາຍການສິນຄ້າ
                        </h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                  No Image
                                </div>
                              )}
                              <div className="flex-grow min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  ຈໍານວນ: {item.quantity} × ${item.price.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-sm font-semibold">
                                ${(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Info & Actions */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            ຂໍ້ມູນການຈັດສົ່ງ
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{order.customerInfo.name} {order.customerInfo.surname}</p>
                            <p>{order.customerInfo.phoneNumber}</p>
                            <p className="truncate">{order.customerInfo.email}</p>
                            <p>{order.customerInfo.village}, {order.customerInfo.district}</p>
                          </div>
                        </div>

                        {order.paymentReceipt && (
                          <div>
                            <h4 className="font-medium mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                              ການຊໍາລະເງິນ
                            </h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <CreditCard className="w-4 h-4 mr-2" />
                              <span>{order.paymentReceipt.name}</span>
                            </div>
                          </div>
                        )}

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full font-thai" 
                          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                          asChild
                        >
                          <Link href={`/order-success?orderId=${order.id}`}>
                            ເບິ່ງລາຍລະອຽດ
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {order.comments && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-1 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                          ຄໍາເຫັນເພີ່ມເຕີມ:
                        </h4>
                        <p className="text-sm text-gray-600">{order.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 flex justify-center">
            <Button variant="outline" asChild className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              <Link href="/products">ກັບໄປຊື້ສິນຄ້າ</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}