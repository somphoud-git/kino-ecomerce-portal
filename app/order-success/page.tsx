"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/contexts/AuthContext"
// Assuming these imports are correct
import { getOrder, Order, hasDepositPayment, hasRemainingAmount, getPaymentStatus, getPaymentStatusText, getPaymentStatusValue } from "@/lib/orders" 
import { CheckCircle, Package, Clock, CreditCard, MapPin, Phone, Mail, Eye, X } from "lucide-react"


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
      <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
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
      case 'checking':
        return 'bg-blue-500'
      case 'delivered':
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
        return 'ລໍຖ້າກວດສອບ'
      case 'checking':
        return 'ກໍາລັງດໍາເນີນການ'
      case 'delivered':
        return 'ຈັດສົ່ງແລ້ວ'
      case 'cancelled':
        return 'ຖືກຍົກເລີກ'
      default:
        return status
    }
  }

  // Using the imported functions from lib/orders.ts

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <Header cartCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-thai">
              ສັ່ງຊື້ສໍາເລັດ!
            </h1>
            <p className="text-gray-600 font-thai">
              ຂໍ້ມູນການສັ່ງຊື້ຂອງທ່ານໄດ້ຖືກບັນທຶກແລ້ວ.
            </p>
          </div>

          {/* Grid Layout: Left column (3 cards, equal height) | Right column (1 card, height-filling with scroll) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column (3 cards, equal height) */}
            <div className="grid grid-cols-1 gap-6 auto-rows-fr"> 
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-thai" >
                    <Package className="w-5 h-5" />
                    <span>ສະຖານະການສັ່ງຊື້</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">ລະຫັດໃບບິນ:</p>
                      <p className="font-semibold">{order.id}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white font-thai`}>
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
                  <CardTitle className="flex items-center space-x-2 font-thai">
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
                      ເບີໂທ: <Phone className="w-4 h-4 mr-2" />
                      <span>{order.customerInfo.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      ອີເມວ: <Mail className="w-4 h-4 mr-2" />
                      <span>{order.customerInfo.email}</span>
                    </div>
                    {order.customerInfo.whatsapp && (
                      <div className="flex items-center text-sm text-gray-600">
                         WhatsApp: <Phone className="w-4 h-4 mr-2" />
                        <span>{order.customerInfo.whatsapp}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      ທີ່ຢູ່: {order.customerInfo.village}, {order.customerInfo.district}, {order.customerInfo.province}
                    </p>
                    {order.customerInfo.shippingBranch && (
                      <p className="text-sm text-gray-600">
                        ບໍລິສັດຂົນສົ່ງ: {order.customerInfo.shippingBranch}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {order.paymentReceipt ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                      <CreditCard className="w-5 h-5" />
                      <span>ຂໍ້ມູນການຊໍາລະເງິນ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">ໃບບິນການໂອນເງິນ:</p>
                      
                      {typeof order.paymentReceipt === 'string' ? (
                        // Handle new format: paymentReceipt is a URL string
                        <div className="flex items-center space-x-3">
                          {/* Small thumbnail image */}
                          <div className="flex-shrink-0">
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="border-2 border-gray-200 rounded-lg p-1 hover:border-orange-400 transition-colors bg-white">
                                  <img 
                                    src={`${order.paymentReceipt}?t=${Date.now()}`}
                                    alt="Payment Receipt Thumbnail" 
                                    className="w-16 h-16 object-cover rounded cursor-pointer"
                                    onLoad={() => console.log('✅ Thumbnail loaded successfully')}
                                    onError={(e) => {
                                      console.error('❌ Thumbnail failed to load:', order.paymentReceipt);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const errorDiv = target.nextElementSibling as HTMLElement;
                                      if (errorDiv) errorDiv.style.display = 'flex';
                                    }}
                                  />
                                  <div className="w-16 h-16 bg-red-100 border border-red-300 rounded items-center justify-center text-red-500 text-xs" style={{ display: 'none' }}>
                                    ❌ Error
                                  </div>
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl w-full">
                                <DialogHeader>
                                  <DialogTitle style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                                    ໃບບິນການຊໍາລະເງິນ
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center">
                                  <img 
                                    src={`${order.paymentReceipt}?t=${Date.now()}`}
                                    alt="Payment Receipt Full Size" 
                                    className="max-w-full max-h-[70vh] object-contain"
                                    onLoad={() => console.log('✅ Full image loaded successfully')}
                                    onError={(e) => {
                                      console.error('❌ Full image failed to load:', order.paymentReceipt);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const errorDiv = target.nextElementSibling as HTMLElement;
                                      if (errorDiv) errorDiv.style.display = 'block';
                                    }}
                                  />
                                  <div className="text-center p-8" style={{ display: 'none' }}>
                                    <p className="text-red-500 text-lg mb-2">❌ ບໍ່ສາມາດໂຫຼດຮູບໄດ້</p>
                                    <p className="text-sm text-gray-500 mb-4">URL: {order.paymentReceipt}</p>
                                    <a 
                                      href={order.paymentReceipt} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 underline text-sm"
                                    >
                                      ລອງເປີດໃນແທັບໃໝ່
                                    </a>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <div className="flex-grow">
                            <p className="font-medium">ໃບບິນການໂອນເງິນ</p>
                            <p className="text-sm text-gray-500">ຄລິກຮູບເພື່ອເບິ່ງຂະໜາດໃຫຍ່</p>
                          </div>

                        </div>
                      ) : (
                        // Handle old format: paymentReceipt is an object
                        <div className="flex items-center space-x-3">
                          {order.paymentReceipt.url && (
                            <div className="flex-shrink-0">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="border-2 border-gray-200 rounded-lg p-1 hover:border-orange-400 transition-colors bg-white">
                                    <img 
                                      src={`${order.paymentReceipt.url}?t=${Date.now()}`}
                                      alt="Payment Receipt Thumbnail" 
                                      className="w-16 h-16 object-cover rounded cursor-pointer"
                                    />
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl w-full">
                                  <DialogHeader>
                                    <DialogTitle style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                                      {order.paymentReceipt.name}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="flex justify-center">
                                    <img 
                                      src={`${order.paymentReceipt.url}?t=${Date.now()}`}
                                      alt="Payment Receipt Full Size" 
                                      className="max-w-full max-h-[70vh] object-contain"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                          
                          <div className="flex-grow">
                            <p className="font-medium">{order.paymentReceipt.name}</p>
                            <p className="text-sm text-gray-500">
                              ຂະໜາດ: {(order.paymentReceipt.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-sm text-gray-500">ຄລິກຮູບເພື່ອເບິ່ງຂະໜາດໃຫຍ່</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                      <CreditCard className="w-5 h-5" />
                      <span>ຂໍ້ມູນການຊໍາລະເງິນ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
                      <p className="text-yellow-700">ບໍ່ມີໃບບິນການຊໍາລະເງິນ</p>
                      <p className="text-sm text-yellow-600 mt-1">No payment receipt found</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Order Items (Height-filling with scroll) */}
            <Card className="flex flex-col h-full lg:col-start-2">
              <CardHeader>
                <CardTitle className="font-thai">
                  ລາຍການສິນຄ້າ
                </CardTitle>
                <CardDescription className="font-thai">
                  ທັງໝົດ {order.totalItems} ລາຍການ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                {/* Scrollable Container with Max Height */}
                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-100px)] p-6 pt-0">
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
                        <p className="text-sm text-gray-500">ລາຄາ: {item.price.toLocaleString()} ກີບ</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} ກີບ</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-white p-4 rounded-lg mt-4 border border-gray-200 space-y-4">
                    {/* Total Amount */}
                    <div className="text-center">
                      <p className="text-xl font-bold text-orange-600">ລວມທັງໝົດ {order.totalAmount.toLocaleString()} ກີບ</p>
                    </div>
                    
                    {/* Only show payment details if deposit exists */}
                    {hasDepositPayment(order) && (
                      <div className="mt-4 space-y-2">
                        {/* Deposit Amount */}
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">ເງິນມັດຈຳແລ້ວ:</p>
                          <p className="text-lg font-medium text-blue-600">{order.depositAmount!.toLocaleString()} ກີບ</p>
                        </div>
                        
                        {/* Remaining Amount - Only if it exists */}
                        {hasRemainingAmount(order) && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">ຈຳນວນເງິນເຫຼືອທີ່ຕ້ອງຊຳລະ:</p>
                            <p className="text-lg font-medium text-yellow-600">{order.remainingAmount!.toLocaleString()} ກີບ</p>
                          </div>
                        )}
                        
                        {/* Payment Status */}
                        <div className="text-center pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">ສະຖານະ:</p>
                          <p className={`text-lg font-medium ${
                            getPaymentStatus(order) === 'full' ? 'text-green-600' : 
                            getPaymentStatus(order) === 'deposit' ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {getPaymentStatusText(order)}
                          </p>
                          {/* Hidden field for paymentStatus value */}
                          <input type="hidden" name="paymentStatus" value={getPaymentStatusValue(order)} />
                        </div>
                      </div>
                    )}
                  </div>

                  {order.comments && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2 font-thai">
                        ຂໍ້ຄວາມເພີ່ມເຕີມ:
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
            <Button variant="outline" asChild className="font-thai">
              <Link href="/products">ກັບໄປຫນ້າສິນຄ້າ</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai">
              <Link href="/cart?tab=orders">
                <span className="hidden sm:inline">ປະຫວັດການສັ່ງຊື້</span>
                <span className="sm:hidden">ປະຫວັດ</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}