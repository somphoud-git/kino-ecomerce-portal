"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/contexts/AuthContext"
import { getOrder, Order } from "@/lib/orders"
import { CheckCircle, Package, Clock, CreditCard, MapPin, Phone, Mail } from "lucide-react"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const orderId = searchParams?.get('orderId')

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        router.push('/products')
        return
      }

      try {
        const orderData = await getOrder(orderId)
        if (orderData) {
          setOrder(orderData)
        } else {
          router.push('/products')
        }
      } catch (error) {
        console.error('Error loading order:', error)
        router.push('/products')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [orderId, router])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header cartCount={0} />
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

  if (!order || !user) {
    return null // Will redirect
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
      <Header cartCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              ສັ່ງຊື້ສໍາເລັດ!
            </h1>
            <p className="text-gray-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              ຂໍ້ມູນການສັ່ງຊື້ຂອງທ່ານໄດ້ຖືກບັນທຶກແລ້ວ ແລະ ກໍາລັງຢູ່ໃນຂະບວນການອະນຸມັດ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Information */}
            <div className="space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                    <Package className="w-5 h-5" />
                    <span>ສະຖານະການສັ່ງຊື້</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">ເລກທີ່ສັ່ງຊື້:</p>
                      <p className="font-semibold">{order.id}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white font-thai`} style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>ວັນທີ່ສັ່ງ: {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('lo-LA')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                    <MapPin className="w-5 h-5" />
                    <span>ຂໍ້ມູນການຈັດສົ່ງ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {order.customerInfo.name} {order.customerInfo.surname}
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{order.customerInfo.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{order.customerInfo.email}</span>
                    </div>
                    {order.customerInfo.whatsapp && (
                      <p className="text-sm text-gray-600">
                        WhatsApp: {order.customerInfo.whatsapp}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {order.customerInfo.village}, {order.customerInfo.district}, {order.customerInfo.province}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.paymentReceipt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                      <CreditCard className="w-5 h-5" />
                      <span>ຂໍ້ມູນການຊໍາລະເງິນ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">ໄຟລ໌ໃບເສັດ:</p>
                      <p className="font-medium">{order.paymentReceipt.name}</p>
                      <p className="text-sm text-gray-500">
                        ຂະໜາດ: {(order.paymentReceipt.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {order.paymentReceipt.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={order.paymentReceipt.url} target="_blank" rel="noopener noreferrer">
                            ເບິ່ງໃບເສັດ
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ລາຍການສິນຄ້າ
                </CardTitle>
                <CardDescription className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ທັງໝົດ {order.totalItems} ລາຍການ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 py-3 border-b">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Image</div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">ຈໍານວນ: {item.quantity}</p>
                        <p className="text-sm text-gray-500">${item.price.toLocaleString()} ຕໍ່ຊິ້ນ</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-orange-50 p-4 rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        ລວມທັງໝົດ:
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {order.comments && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        ຄໍາເຫັນເພີ່ມເຕີມ:
                      </h4>
                      <p className="text-sm text-gray-600">{order.comments}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              <Link href="/products">ສືບຕໍ່ການຊື້ສິນຄ້າ</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
              <Link href="/orders">ເບິ່ງປະຫວັດການສັ່ງຊື້</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}