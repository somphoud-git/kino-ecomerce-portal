"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCart, CartItem } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getUserOrders, Order, hasDepositPayment, hasRemainingAmount, getPaymentStatus } from "@/lib/orders"
import { getProductById } from "@/lib/products"
import { 
  ShoppingCart, 
  History, 
  Plus, 
  Minus, 
  X, 
  Package, 
  Clock, 
  RefreshCw, 
  Truck,
  CheckCircle,
  AlertCircle,
  User,
  ArrowRight,
  CreditCard
} from "lucide-react"

export default function CartPage() {
  const searchParams = useSearchParams()
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [activeTab, setActiveTab] = useState("cart")

  // Check URL parameter for tab
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam === 'orders') {
      setActiveTab('orders')
    }
  }, [searchParams])

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

  const getStatusConfig = (status: string) => {
    const configs = {
      'pending': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, text: 'ລໍຖ້າເຈົ້າຂອງຮ້ານກວດສອບ' },
      'checking': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw, text: 'ກໍາລັງດໍາເນີນການ' },
      'delivered': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle, text: 'ຈັດສົ່ງສຳເລັດ' },
      'cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, text: 'ຖືກຍົກເລີກ' }
    }
    return configs[status as keyof typeof configs] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package, text: status }
  }

  const handleReorderItem = (item: any) => {
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

  const handleReorderAll = (order: Order) => {
    order.items.forEach(item => handleReorderItem(item))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-25 to-gray-100" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <Header cartCount={getTotalItems()} />
      
      <div className="flex-grow">
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 text-gray-600 mb-2 text-sm sm:text-base">
              <Link href="/" className="hover:text-orange-600 transition-colors">ໜ້າຫຼັກ</Link>
              <span>/</span>
              <span className="text-orange-600 font-medium">ກະຕ່າ & ປະຫວັດການສັ່ງຊື້</span>
            </div>
            <h1 className="pt-3 sm:pt-4 text-lg sm:text-xl font-bold text-gray-900 mb-2 font-thai">
              ກະຕ່າ & ປະຫວັດການສັ່ງຊື້
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-md">
              <TabsTrigger 
                value="cart" 
                className="flex items-center space-x-2 sm:space-x-3 font-thai data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-md py-2 sm:py-3 text-xs sm:text-sm"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-3 sm:-top-3 sm:-right-4 bg-orange-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">ກະຕ່າສິນຄ້າ</span>
                <span className="sm:hidden">ກະຕ່າ</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex items-center space-x-2 sm:space-x-3 font-thai data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 rounded-md py-2 sm:py-3 text-xs sm:text-sm"
              >
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">ປະຫວັດການສັ່ງຊື້</span>
                <span className="sm:hidden">ປະຫວັດ</span>
                {orders.length > 0 && (
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">
                    {orders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Cart Tab */}
            <TabsContent value="cart" className="mt-6 sm:mt-8">
              {cartItems.length === 0 ? (
                <Card className="text-center py-12 sm:py-16 border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                  <CardContent className="px-4 sm:px-6">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-orange-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 font-thai">
                      ກະຕ່າຍັງບໍ່ມີສິນຄ້າເທື່ອ
                    </h3>
                    <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto font-thai text-sm sm:text-base">
                      ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ. ສາມາດສັ່ງຊື້ສິນຄ້ານຳຮ້ານຂອງພວກເຮົາໄດ້ເລີຍ!
                    </p>
                    <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai px-6 sm:px-8 py-2 sm:py-3 h-auto rounded-lg text-sm sm:text-base">
                      <Link href="/products" className="flex items-center space-x-2">
                        <span>ຊື້ສິນຄ້າດຽວນີ້</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg font-thai">
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                          <span>ລາຍການສິນຄ້າ ({getTotalItems()} ລາຍການ)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 p-2 sm:p-4">
                        {cartItems.map((item: CartItem) => (
                          <div key={item.id} className="flex items-center p-2 sm:p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-1 sm:p-2 flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                ) : (
                                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{item.name}</h3>
                                <p className="text-orange-600 font-semibold text-xs sm:text-sm">ລາຄາ: {item.price.toLocaleString()} ກີບ</p>
                                <div className="flex items-center space-x-2 sm:space-x-4 mt-1 sm:mt-2">
                                  <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 rounded-lg px-1 sm:px-2 py-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-gray-200"
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
                                    </Button>
                                    <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">{item.quantity}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={async () => {
                                        try {
                                          // Use Firebase directly instead of API route
                                          const product = await getProductById(item.id.toString());
                                          
                                          if (product && product.quantity !== undefined) {
                                            if (item.quantity < product.quantity) {
                                              updateQuantity(item.id, item.quantity + 1);
                                            } else {
                                              toast({
                                                title: "⚠️ ຂໍ້ຈຳກັດສິນຄ້າ",
                                                description: `ບໍ່ສາມາດເພີ່ມສິນຄ້າໄດ້, ສິນຄ້າໃນສະຕ໊ອກມີພຽງແຕ່ ${product.quantity} ລາຍການເທົ່ານັ້ນ`,
                                                variant: "destructive",
                                                style: { 
                                                  fontFamily: "'Noto Sans Lao Looped', sans-serif",
                                                  background: "#FEE2E2", 
                                                  border: "1px solid #FECACA",
                                                  color: "#B91C1C"
                                                }
                                              });
                                            }
                                          } else {
                                            updateQuantity(item.id, item.quantity + 1);
                                          }
                                        } catch (error) {
                                          console.error("Error checking product quantity:", error);
                                          updateQuantity(item.id, item.quantity + 1);
                                        }
                                      }}
                                      className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-gray-200"
                                    >
                                      <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                                    </Button>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-500 hover:text-red-500 hover:bg-red-50 h-6 sm:h-8 px-1 sm:px-2 text-xs"
                                  >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                                    <span className="hidden sm:inline text-xs">ລຶບ</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                              <p className="font-bold text-xs sm:text-sm text-gray-900">ລວມ: {(item.price * item.quantity).toLocaleString()} ກີບ</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Summary */}
                  <div className="lg:col-span-1">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-white-900 to-white-800 text-black sticky top-4 sm:top-8">
                      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                        <CardTitle className="flex items-center space-x-2 font-thai text-black text-base sm:text-lg">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>ສະຫຼຸບການສັ່ງຊື້</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-700">
                            <span className="text-xs sm:text-sm text-black-300">ລາຄາລວມ</span>
                            <span className="text-xs sm:text-sm font-semibold">{getTotalPrice().toLocaleString()} ກີບ</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 sm:pt-4">
                          <span className="font-thai text-sm font-semibold">ລວມ</span>
                          <span className="text-sm font-bold text-orange-400">{getTotalPrice().toLocaleString()} ກີບ</span>
                        </div>
                        
                        <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai py-2 sm:py-3 rounded-lg mt-3 sm:mt-4 text-sm sm:text-base">
                          <Link href="/checkout" className="flex items-center justify-center space-x-2">
                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>ດໍາເນີນການຊໍາລະເງິນ</span>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Order History Tab */}
            <TabsContent value="orders" className="mt-6 sm:mt-8">
              {!user ? (
                <Card className="text-center py-12 sm:py-16 border-0 shadow-lg bg-white/50 backdrop-blur-sm max-w-2xl mx-auto">
                  <CardContent className="px-4 sm:px-6">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 font-thai">
                      ກະລຸນາເຂົ້າສູ່ລະບົບ
                    </h3>
                    <p className="text-gray-600 mb-6 sm:mb-8 font-thai text-sm sm:text-base">
                      ເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງປະຫວັດການສັ່ງຊື້ ແລະ ຂໍ້ມູນການຊື້ຂອງທ່ານ
                    </p>
                    <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-thai px-6 sm:px-8 py-2 sm:py-3 h-auto rounded-lg text-sm sm:text-base">
                      <Link href="/login" className="flex items-center space-x-2">
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>ເຂົ້າສູ່ລະບົບ</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : isLoadingOrders ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-gray-600 font-thai text-sm sm:text-base">ກໍາລັງໂຫຼດປະຫວັດການສັ່ງຊື້...</p>
                </div>
              ) : orders.length === 0 ? (
                <Card className="text-center py-12 sm:py-16 border-0 shadow-lg bg-white/50 backdrop-blur-sm max-w-2xl mx-auto">
                  <CardContent className="px-4 sm:px-6">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 font-thai">
                      ຍັງບໍ່ມີປະຫວັດການສັ່ງຊື້
                    </h3>
                    <p className="text-gray-600 mb-6 sm:mb-8 font-thai text-sm sm:text-base">
                      ທ່ານຍັງບໍ່ເຄີຍສັ່ງຊື້ສິນຄ້າຈາກພວກເຮົາ. ເລີ່ມຕົ້ນການຊື້ສິນຄ້າເພື່ອປະສົບກັບບໍລິການຂອງພວກເຮົາ
                    </p>
                    <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai px-6 sm:px-8 py-2 sm:py-3 h-auto rounded-lg text-sm sm:text-base">
                      <Link href="/products" className="flex items-center space-x-2">
                        <span>ເລີ່ມຊື້ສິນຄ້າ</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white/70 backdrop-blur-sm">
                        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                          <div className="flex flex-col space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                <CardTitle className="text-base sm:text-lg text-gray-900">ລະຫັດບິນ : {(order.id || '').slice(-8)}</CardTitle>
                                <Badge variant="outline" className={`${statusConfig.color} border font-thai flex items-center space-x-1 w-fit`}>
                                  <StatusIcon className="w-3 h-3" />
                                  <span className="text-xs sm:text-sm">{statusConfig.text}</span>
                                </Badge>
                              </div>
                              <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <span className="flex items-center space-x-1 text-gray-600">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span> ວັນທີ {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('lo-LA')}</span>
                                </span>
                                <span className="flex items-center space-x-1 text-gray-600">
                                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>{order.totalItems} ລາຍການ</span>
                                </span>
                              </CardDescription>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-lg sm:text-xl font-bold text-orange-600">ລວມທັງໝົດ {order.totalAmount.toLocaleString()} ກີບ</p>
                              
                              {/* Show deposit and remaining payment information if applicable */}
                              {hasDepositPayment(order) && (
                                <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-left sm:text-right">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">ເງິນມັດຈຳແລ້ວ:</span>
                                    <span className="text-xs font-medium text-blue-600">
                                      {order.depositAmount?.toLocaleString()} ກີບ
                                    </span>
                                  </div>
                                  
                                  {hasRemainingAmount(order) && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-600">ເງິນເຫຼືອທີ່ຕ້ອງຊຳລະ:</span>
                                      <span className="text-xs font-medium text-yellow-600">
                                        {order.remainingAmount?.toLocaleString()} ກີບ
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex justify-between items-center pt-1">
                                    <span className="text-xs text-gray-600">ສະຖານະ:</span>
                                    <span className={`text-xs font-medium ${
                                      getPaymentStatus(order) === 'full' ? 'text-green-600' : 
                                      getPaymentStatus(order) === 'deposit' ? 'text-yellow-600' : 'text-gray-600'
                                    }`}>
                                      {getPaymentStatus(order) === 'full' ? 'ຊໍາລະຄົບແລ້ວ' : 
                                       getPaymentStatus(order) === 'deposit' ? 'ຊໍາລະມັດຈຳແລ້ວ' : 'ຍັງບໍ່ຊໍາລະ'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                          <div className="space-y-2 sm:space-y-3 max-h-48 overflow-y-auto pr-1 sm:pr-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-200 rounded flex items-center justify-center p-1 flex-shrink-0">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                    ) : (
                                      <Package className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                      ຈໍານວນ: {item.quantity} × {item.price.toLocaleString()} ກີບ
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-3 ml-2 flex-shrink-0">
                                  <span className="font-semibold text-gray-900 text-xs sm:text-sm">{(item.price * item.quantity).toLocaleString()} ກີບ</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pt-3 sm:pt-4 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-thai border-gray-300 text-xs sm:text-sm"
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
                                onClick={() => handleReorderAll(order)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai text-xs sm:text-sm mt-2 sm:mt-0"
                              >
                                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                ສັ່ງຊື້ທັງໝົດຄືນ
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </div>
  )
}