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
import { Upload, FileImage } from "lucide-react"

const paymentSchema = z.object({
  paymentReceipt: z.any().optional(),
  comments: z.string().optional(),
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
  }
  cartItems: any[]
  totalAmount: number
  totalItems: number
}

export default function PaymentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { clearCart, getTotalItems } = useCart()
  const { toast } = useToast()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      comments: "",
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

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "ຟາຍບໍ່ຖືກຕ້ອງ",
          description: "ກະລຸນາເລືອກຟາຍຮູບພາບ (JPG, PNG, GIF)",
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
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
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

    setIsLoading(true)
    try {
      // Create order data
      const orderData = {
        userId: user.uid,
        customerInfo: checkoutData.customerInfo,
        items: checkoutData.cartItems,
        totalAmount: checkoutData.totalAmount,
        totalItems: checkoutData.totalItems,
        status: 'pending' as const,
        paymentReceipt: uploadedFile ? {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type
        } : null,
        comments: data.comments || ''
      }

      console.log('Submitting order data:', orderData)

      // Create order in Firebase
      const orderId = await createOrder(orderData, uploadedFile)
      
      // Clear cart
      clearCart()
      
      // Clear checkout data from session storage
      sessionStorage.removeItem('checkoutData')
      
      toast({
        title: "ສັ່ງຊື້ສໍາເລັດ!",
        description: "ຂໍ້ມູນການສັ່ງຊື້ຂອງທ່ານໄດ້ຖືກບັນທຶກແລ້ວ",
      })
      
      // Navigate to order success page
      router.push(`/order-success?orderId=${orderId}`)
      
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "ເກີດຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດສ້າງຄໍາສັ່ງຊື້ໄດ້",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!checkoutData || !user) {
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

  // Generate order ID for display
  const orderId = `ORD${Date.now()}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={getTotalItems()} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
            ການຊໍາລະເງິນ
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ລາຍລະອຽດການສັ່ງຊື້
                </CardTitle>
                <CardDescription className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ເລກທີ່ສັ່ງຊື້: {orderId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                      ຂໍ້ມູນລູກຄ້າ
                    </h3>
                    <p className="text-sm">
                      <strong>ຊື່:</strong> {checkoutData.customerInfo.name} {checkoutData.customerInfo.surname}
                    </p>
                    <p className="text-sm">
                      <strong>ອີເມວ:</strong> {checkoutData.customerInfo.email}
                    </p>
                    <p className="text-sm">
                      <strong>ໂທ:</strong> {checkoutData.customerInfo.phoneNumber}
                    </p>
                    {checkoutData.customerInfo.whatsapp && (
                      <p className="text-sm">
                        <strong>WhatsApp:</strong> {checkoutData.customerInfo.whatsapp}
                      </p>
                    )}
                    <p className="text-sm">
                      <strong>ທີ່ຢູ່:</strong> {checkoutData.customerInfo.village}, {checkoutData.customerInfo.district}, {checkoutData.customerInfo.province}
                    </p>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="font-semibold mb-3 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                      ສິນຄ້າທີ່ສັ່ງ
                    </h3>
                    {checkoutData.cartItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 py-3 border-b">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Image</div>
                        )}
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium">{item.name}</h4>
                          <p className="text-xs text-gray-500">ຈໍານວນ: {item.quantity} × ${item.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        ລວມທັງໝົດ:
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${checkoutData.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ອັບໂຫຼດໃບເສັດ (ທາງເລືອກ)
                </CardTitle>
                <CardDescription className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ທ່ານສາມາດອັບໂຫຼດໃບເສັດການຊໍາລະເງິນ ຫຼື ຂ້າມຂັ້ນຕອນນີ້ເພື່ອດໍາເນີນການສັ່ງຊື້
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            ຂໍ້ມູນກ່ຽວກັບການຊໍາລະເງິນ
                          </h4>
                          <p className="text-sm text-blue-700 mt-1 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            ທ່ານສາມາດສັ່ງຊື້ກ່ອນແລ້ວອັບໂຫຼດໃບເສັດຫຼັງຈາກການຊໍາລະເງິນ ຫຼື ຕິດຕໍ່ພວກເຮົາຜ່ານ WhatsApp ເພື່ອຈັດການຊໍາລະເງິນ
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        ໃບເສັດການຊໍາລະເງິນ (ທາງເລືອກ)
                      </label>
                      
                      {!uploadedFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            ຄລິກເພື່ອເລືອກໄຟລ໌ ຫຼື ລາກວາງໄຟລ໌ມາທີ່ນີ້ (ທາງເລືອກ)
                          </p>
                          <p className="text-xs text-gray-500 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            ຮອງຮັບ: JPG, PNG, GIF (ຂະໜາດສູງສຸດ 5MB) - ສາມາດຂ້າມໄດ້
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center space-x-4">
                            {previewUrl && (
                              <img src={previewUrl} alt="Payment receipt" className="w-20 h-20 object-cover rounded" />
                            )}
                            <div className="flex-grow">
                              <p className="text-sm font-medium">{uploadedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={removeFile}
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ລຶບ
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comments */}
                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            ຄໍາເຫັນເພີ່ມເຕີມ (ທາງເລືອກ)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="ລາຍລະອຽດເພີ່ມເຕີມສໍາລັບການສັ່ງຊື້..."
                              {...field}
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            />
                          </FormControl>
                          <FormMessage className="font-thai" />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    >
                      {isLoading ? "ກໍາລັງດໍາເນີນການ..." : "ຢືນຍັນການສັ່ງຊື້"}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center mt-2 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                      * ທ່ານສາມາດສັ່ງຊື້ໂດຍບໍ່ຕ້ອງອັບໂຫຼດໃບເສັດກ່ອນ
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}