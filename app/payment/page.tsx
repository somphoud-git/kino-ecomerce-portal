"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { createOrder } from "@/lib/orders"
import { getSettings } from "@/lib/firestore"
import { updateMultipleProductStock } from "@/lib/products"
import { Settings } from "@/lib/types"
import { useWhatsAppNotification } from "@/components/notifications/whatsapp-noti"
import { 
  Upload, 
  FileImage, 
  CreditCard, 
  User, 
  Package, 
  MapPin, 
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  Shield,
  ArrowLeft,
  Loader2
} from "lucide-react"

const paymentSchema = z.object({
  paymentReceipt: z.any().optional(),
  comments: z.string().max(500, "ຄໍາເຫັນຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ").optional(),
  depositAmount: z.number().min(0, "ຈໍານວນເງິນມັດຈໍາຕ້ອງເປັນຕົວເລກບວກ").optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface CheckoutData {
  customerInfo: {
    name: string
    surname: string
    email: string
    phoneNumber: string
    whatsapp?: string
    village: string
    district: string
    province: string
    shippingBranch: string
  }
  cartItems: any[]
  totalAmount: number
  totalItems: number
}

export default function PaymentPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { clearCart, getTotalItems } = useCart()
  const { toast } = useToast()
  const { sendNotification } = useWhatsAppNotification()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [remainingAmount, setRemainingAmount] = useState<number>(0)

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      comments: "",
      depositAmount: 0,
    },
  })

  // Load checkout data from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem('checkoutData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setCheckoutData(data)
      } catch (error) {
        console.error("Error parsing checkout data:", error)
        router.push("/checkout")
      }
    } else {
      router.push("/checkout")
    }
  }, [router])

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await getSettings()
        setSettings(settingsData)
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
    loadSettings()
  }, [])

  // Calculate remaining amount when deposit changes
  useEffect(() => {
    if (checkoutData && depositAmount > 0) {
      const remaining = checkoutData.totalAmount - depositAmount
      setRemainingAmount(remaining > 0 ? remaining : 0)
    } else {
      setRemainingAmount(0)
    }
  }, [depositAmount, checkoutData])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "ປະເພດຟາຍບໍ່ຖືກຕ້ອງ",
        description: "ກະລຸນາເລືອກຟາຍຮູບພາບ (JPG, PNG, GIF) ຫຼື PDF",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ຟາຍໃຫຍ່ເກີນໄປ",
        description: "ຂະໜາດຟາຍຕ້ອງນ້ອຍກວ່າ 5MB",
        variant: "destructive"
      })
      return
    }

    setUploadedFile(file)
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const onSubmit = async (data: PaymentFormData) => {
    if (!checkoutData || !user) return

    // Validate that payment receipt is uploaded
    if (!uploadedFile) {
      toast({
        title: "⚠️ຂາດໃບບິນການໂອນເງິນ",
        description: "ກະລຸນາອັບໂຫຼດໃບບິນການໂອນເງິນກ່ອນຢືນຢັນການສັ່ງຊື້",
        variant: "destructive",
        style: { 
          fontFamily: "'Noto Sans Lao Looped', sans-serif",
          color: "white"
        },
        className: "font-thai"
      })
      return
    }

    setIsLoading(true)
    try {
      // Create order data
      const orderData = {
        userId: user.uid,
        customerInfo: checkoutData.customerInfo,
        items: checkoutData.cartItems,
        totalAmount: checkoutData.totalAmount,
        totalItems: checkoutData.totalItems,
        ...(settings?.enableDeposit === 'on' && depositAmount > 0 && {
          depositAmount: depositAmount,
          remainingAmount: remainingAmount
        }),
        status: 'pending' as const,
        paymentReceipt: null, // Will be set after S3 upload
        comments: data.comments || ''
      }

      console.log('Submitting order data:', orderData)

      // Create order in Firebase
      const orderId = await createOrder(orderData, uploadedFile)
      
      // Update product stock after successful order creation
      try {
        const stockUpdateItems = checkoutData.cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
        await updateMultipleProductStock(stockUpdateItems)
        console.log('Stock updated successfully for all products')
      } catch (stockError) {
        console.error('Error updating stock:', stockError)
        // Note: Order was still created successfully, just stock update failed
        toast({
          title: "⚠️ ຄໍາເຕືອນ",
          description: "ການສັ່ງຊື້ສໍາເລັດແລ້ວ ແຕ່ການອັບເດດສະຕ໋ອກມີບັນຫາ",
          variant: "destructive"
        })
      }
      
      // Clear cart
      clearCart()
      
      // Clear checkout data from session storage
      sessionStorage.removeItem('checkoutData')
      
      // Send WhatsApp notification - COMMENTED OUT
      // try {
      //   const currentDate = new Date()
      //   const formattedDate = currentDate.toLocaleDateString('lo-LA', {
      //     year: 'numeric',
      //     month: 'long',
      //     day: 'numeric'
      //   })
      //   const formattedTime = currentDate.toLocaleTimeString('lo-LA', {
      //     hour: '2-digit',
      //     minute: '2-digit'
      //   })
      //   
      //   sendNotification('020 91482913', {
      //     orderId: orderId,
      //     customerName: checkoutData.customerInfo.name,
      //     customerSurname: checkoutData.customerInfo.surname,
      //     totalAmount: checkoutData.totalAmount,
      //     totalItems: checkoutData.totalItems,
      //     items: checkoutData.cartItems.map(item => ({
      //       name: item.name,
      //       quantity: item.quantity,
      //       price: item.price
      //     })),
      //     date: formattedDate,
      //     time: formattedTime
      //   })
      // } catch (whatsappError) {
      //   console.error('WhatsApp notification error:', whatsappError)
      //   // Don't block order completion if WhatsApp fails
      // }
      
      toast({
        title: "🎉 ສັ່ງຊື້ສໍາເລັດ!",
        description: "ຂໍ້ມູນການສັ່ງຊື້ຂອງທ່ານໄດ້ຖືກບັນທຶກແລ້ວ",
        style: { 
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          fontFamily: "'Noto Sans Lao Looped', sans-serif"
        }
      })
      
      // Navigate to order success page
      router.push(`/order-success?orderId=${orderId}`)
      
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "❌ ເກີດຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດສັ່ງຊື້ໄດ້ ກະລຸນາລອງໃຫມ່ອີກຄັ້ງ",
        variant: "destructive",
        style: { 
          fontFamily: "'Noto Sans Lao Looped', sans-serif",
          color: "white"
        },
        className: "font-thai"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !checkoutData || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-25 to-gray-100">
        <Header cartCount={getTotalItems()} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-thai">ກໍາລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Generate order ID for display
  const orderId = `ORD${Date.now().toString().slice(-8)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-25 to-gray-100" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <Header cartCount={getTotalItems()} />
      
      <div className="flex-grow">
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="mb-3 sm:mb-4 flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-thai px-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">ກັບໄປຫນ້າການສັ່ງຊື້</span>
            </Button>
            
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 font-thai truncate">
                  ການຊໍາລະເງິນ
                </h1>
                <p className="text-gray-600 font-thai mt-1 text-xs sm:text-sm">
                  ເພື່ອຢືນຢັນການສັ່ງຊື້ ກາລຸນາອັບໂຫຼດໃບບິນໂອນເງິນ.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile View: Order Summary First */}
          <div className="block xl:hidden mb-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 px-3">
                <CardTitle className="flex items-center space-x-2 font-thai text-base">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span>ລາຍລະອຽດການສັ່ງຊື້</span>
                </CardTitle>
                <CardDescription className="font-thai flex items-center space-x-2 text-xs">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>ລະຫັດໃບບິນ: {orderId}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-3">
                {/* Customer Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-medium text-gray-700">
                    <User className="w-3 h-3" />
                    <span className="font-thai">ຂໍ້ມູນຂອງທ່ານ</span>
                  </div>
                  <div className="bg-gray-50/80 rounded-lg p-2 space-y-1">
                    <p className="text-xs font-medium">
                      {checkoutData.customerInfo.name} {checkoutData.customerInfo.surname}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{checkoutData.customerInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{checkoutData.customerInfo.phoneNumber}</span>
                    </div>
                    {checkoutData.customerInfo.whatsapp && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <MessageCircle className="w-3 h-3" />
                        <span className="truncate">WhatsApp: {checkoutData.customerInfo.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="break-words">
                        {checkoutData.customerInfo.village}, {checkoutData.customerInfo.district}, {checkoutData.customerInfo.province}
                      </span>
                    </div>
                    {checkoutData.customerInfo.shippingBranch && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Package className="w-3 h-3" />
                        <span className="truncate">ສາຂາຂົນສົ່ງ: {checkoutData.customerInfo.shippingBranch}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-medium text-gray-700">
                    <Package className="w-3 h-3" />
                    <span className="font-thai">ສິນຄ້າ ({checkoutData.totalItems} ລາຍການ)</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {checkoutData.cartItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            ຈຳນວນ {item.quantity} × {item.price.toLocaleString()} ກີບ
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold">{(item.price * item.quantity).toLocaleString()} ກີບ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deposit Payment - Mobile View - Only show if enabled in settings */}
                {settings?.enableDeposit === 'on' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex flex-col space-y-2">
                      <span className="font-semibold font-thai text-blue-900 text-sm">ຈ່າຍເງິນມັດຈຳ:</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={depositAmount === 0 ? '' : depositAmount.toLocaleString('en-US')}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^\d]/g, '')
                            const value = numericValue === '' ? 0 : Number(numericValue)
                            if (value <= checkoutData.totalAmount) {
                              setDepositAmount(value)
                            }
                          }}
                          onFocus={(e) => {
                            if (depositAmount > 0) {
                              e.target.value = depositAmount.toString()
                            }
                          }}
                          onBlur={(e) => {
                            if (depositAmount > 0) {
                              e.target.value = depositAmount.toLocaleString('en-US')
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-blue-300 rounded text-right font-bold text-blue-600 text-sm"
                          placeholder="0"
                        />
                        <span className="text-blue-600 font-bold text-sm">ກີບ</span>
                      </div>
                      <p className="text-xs text-blue-600 font-thai">
                        ສາມາດຈ່າຍໄດ້ສູງສຸດ: {checkoutData.totalAmount.toLocaleString()} ກີບ
                      </p>
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold font-thai text-green-900 text-sm">ລວມທັງໝົດ:</span>
                    <span className="text-lg font-bold text-green-600">{checkoutData.totalAmount.toLocaleString()} ກີບ</span>
                  </div>
                </div>

                {/* Remaining Amount - Mobile View - Only show if deposit is enabled and > 0 */}
                {settings?.enableDeposit === 'on' && depositAmount > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold font-thai text-orange-900 text-sm">ຈຳນວນເຫຼືອທີ່ຕ້ອງຊຳລະ:</span>
                      <span className="text-lg font-bold text-orange-600">{remainingAmount.toLocaleString()} ກີບ</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Order Summary Sidebar - Desktop */}
            <div className="xl:col-span-1 space-y-4 sm:space-y-6 order-2 xl:order-1 hidden xl:block">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <CardTitle className="flex items-center space-x-2 font-thai text-base sm:text-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    <span>ລາຍລະອຽດການສັ່ງຊື້</span>
                  </CardTitle>
                  <CardDescription className="font-thai flex items-center space-x-2 text-xs sm:text-sm">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>ລະຫັດໃບບິນ: {orderId}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                  {/* Customer Info */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-gray-700">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-thai">ຂໍ້ມູນຂອງທ່ານ</span>
                    </div>
                    <div className="bg-gray-50/80 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium">
                        {checkoutData.customerInfo.name} {checkoutData.customerInfo.surname}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{checkoutData.customerInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{checkoutData.customerInfo.phoneNumber}</span>
                      </div>
                      {checkoutData.customerInfo.whatsapp && (
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <MessageCircle className="w-3 h-3" />
                          <span className="truncate">WhatsApp: {checkoutData.customerInfo.whatsapp}</span>
                        </div>
                      )}
                      <div className="flex items-start space-x-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="break-words">
                          {checkoutData.customerInfo.village}, {checkoutData.customerInfo.district}, {checkoutData.customerInfo.province}
                        </span>
                      </div>
                      {checkoutData.customerInfo.shippingBranch && (
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Package className="w-3 h-3" />
                          <span className="truncate">ສາຂາຂົນສົ່ງ: {checkoutData.customerInfo.shippingBranch}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-gray-700">
                      <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-thai">ສິນຄ້າ ({checkoutData.totalItems} ລາຍການ)</span>
                    </div>
                    <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                      {checkoutData.cartItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 bg-white rounded border">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                            ) : (
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              ຈຳນວນ {item.quantity} × {item.price.toLocaleString()} ກີບ
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs sm:text-sm font-semibold">{(item.price * item.quantity).toLocaleString()} ກີບ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deposit Payment - Only show if enabled in settings */}
                  {settings?.enableDeposit === 'on' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <span className="font-semibold font-thai text-blue-900 text-sm">ຈ່າຍເງິນມັດຈຳ:</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={depositAmount === 0 ? '' : depositAmount.toLocaleString('en-US')}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/[^\d]/g, '')
                              const value = numericValue === '' ? 0 : Number(numericValue)
                              if (value <= checkoutData.totalAmount) {
                                setDepositAmount(value)
                              }
                            }}
                            onFocus={(e) => {
                              if (depositAmount > 0) {
                                e.target.value = depositAmount.toString()
                              }
                            }}
                            onBlur={(e) => {
                              if (depositAmount > 0) {
                                e.target.value = depositAmount.toLocaleString('en-US')
                              }
                            }}
                            className="px-2 sm:px-3 py-1 border border-blue-300 rounded text-right font-bold text-blue-600 w-24 sm:w-32 text-sm"
                            placeholder="0"
                          />
                          <span className="text-blue-600 font-bold text-sm">ກີບ</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 font-thai mt-1">
                        ສາມາດຈ່າຍໄດ້ສູງສຸດ: {checkoutData.totalAmount.toLocaleString()} ກີບ
                      </p>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold font-thai text-green-900 text-sm sm:text-base">ລວມທັງໝົດ:</span>
                      <span className="text-lg sm:text-xl font-bold text-green-600">{checkoutData.totalAmount.toLocaleString()} ກີບ</span>
                    </div>
                  </div>

                  {/* Remaining Amount - Only show if deposit is enabled and > 0 */}
                  {settings?.enableDeposit === 'on' && depositAmount > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold font-thai text-orange-900 text-sm sm:text-base">ຈຳນວນເຫຼືອທີ່ຕ້ອງຊຳລະ:</span>
                        <span className="text-lg sm:text-xl font-bold text-orange-600">{remainingAmount.toLocaleString()} ກີບ</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="xl:col-span-2 order-1 xl:order-2">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">

                      {/* File Upload Section */}
                      <div className="space-y-3 sm:space-y-4">
                        <FormLabel className="text-sm sm:text-base font-semibold font-thai">
                          ອັບໂຫຼດໃບບິນໂອນເງິນ <span className="text-red-500">*</span>
                        </FormLabel>
                        
                        {/* UPDATED: Flex layout for laptop, stacked for mobile */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          {/* QR Code Image - Only show if qrCodeImageUrl exists */}
                          {settings?.qrCodeImageUrl && (
                            <div className="space-y-2 order-2 lg:order-1">
                              <p className="text-sm font-medium text-gray-700 font-thai">QR ໂຄດສໍາລັບການໂອນເງິນ</p>
                              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
                                <div className="w-full max-w-xs mx-auto h-48 sm:h-64 flex items-center justify-center">
                                  <img 
                                    src={settings.qrCodeImageUrl} 
                                    alt="QR Code for Payment" 
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* File Upload Area */}
                          <div className="space-y-2 order-1 lg:order-2">
                            <p className="text-sm font-medium text-gray-700 font-thai">ອັບໂຫຼດໃບບິນ</p>
                            {!uploadedFile ? (
                              <div
                                className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-300 ${
                                  isDragging 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-300 hover:border-green-500 hover:bg-green-50/50'
                                }`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                              >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                  <Upload className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
                                </div>
                                <p className="text-sm sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2 font-thai">
                                  ກົດເພື່ອອັບໂຫຼດໃບບິນ
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 font-thai">
                                  ຮອງຮັບ: JPG, PNG, GIF, PDF (ຂະໜາດສູງສຸດ 5MB)
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="font-thai border-green-500 text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                                  onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                  <FileImage className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  ເລືອກຮູບ
                                </Button>
                                <input
                                  id="file-upload"
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </div>
                            ) : (
                              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
                                <div className="flex flex-col items-center space-y-2">
                                  {previewUrl ? (
                                    <div className="w-full max-w-xs mx-auto h-48 sm:h-64 flex items-center justify-center">
                                      <img 
                                        src={previewUrl} 
                                        alt="Payment receipt" 
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full max-w-xs mx-auto h-48 sm:h-64 bg-green-100 rounded-lg flex items-center justify-center">
                                      <FileImage className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
                                    </div>
                                  )}
                                  <div className="text-center">
                                    <p className="text-xs text-green-700">
                                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={removeFile}
                                    className="font-thai border-red-300 text-red-600 hover:bg-red-50 text-xs"
                                  >
                                    ລຶບ
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <FormField
                        control={form.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base font-semibold font-thai">
                              ຄໍາເຫັນເພີ່ມເຕີມ (ທາງເລືອກ)
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  placeholder="ລາຍລະອຽດເພີ່ມເຕີມສໍາລັບການສັ່ງຊື້, ຂໍ້ມູນການຊໍາລະເງິນ, ຫຼື ຄວາມຕ້ອງການພິເສດ..."
                                  {...field}
                                  className="font-thai min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                  {field.value?.length || 0}/500
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="font-thai text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Submit Button */}
                      <div className="space-y-3 sm:space-y-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-thai py-2 sm:py-3 rounded-xl text-sm sm:text-lg shadow-lg transition-all duration-300"
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                              ກໍາລັງດໍາເນີນການ...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              ຢືນຍັນການສັ່ງຊື້
                            </>
                          )}
                        </Button>

                        <p className="text-center text-xs sm:text-sm text-gray-500 font-thai">
                          ກົດຢືນຍັນເພື່ອສັ່ງຊື້ສິນຄ້າ
                        </p>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}