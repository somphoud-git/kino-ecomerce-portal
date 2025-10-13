"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/hooks/use-cart"
import { getUserProfile, updateUserProfile } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShoppingBag, MapPin, User, CreditCard, Save, ArrowLeft } from "lucide-react"

const checkoutSchema = z.object({
  name: z.string().min(2, "ກະລຸນາເບິ່ງຊື່ອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  surname: z.string().min(2, "ກະລຸນາເບິ່ງນາມສກຸນອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  email: z.string().email("ກະລຸນາໃສ່ອີເມວໃຫ້ຖືກຕ້ອງ"),
  phoneNumber: z.string().min(8, "ເລກໂທລະສັບຕ້ອງມີອຍ່າງນ້ອຍ 8 ຫນັກ"),
  whatsapp: z.string().optional(),
  village: z.string().min(1, "ກະລຸນາເບິ່ງຊື່ບ້ານ"),
  district: z.string().min(1, "ກະລຸນາເບິ່ງເມືອງ"),
  province: z.string().min(1, "ກະລຸນາເບິ່ງແຂວງ"),
  shippingBranch: z.string().min(1, "ກະລຸນາເລືອກບໍລິສັດຂົນສົ່ງກ່ອນດຳເນີນຕໍ່"),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      whatsapp: "",
      village: "",
      district: "",
      province: "",
      shippingBranch: "",
    },
  })

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid)
          if (profile) {
            form.reset({
              name: profile.name || "",
              surname: profile.surname || "",
              email: profile.email || "",
              phoneNumber: profile.phoneNumber || "",
              whatsapp: profile.whatsapp || "",
              village: profile.village || "",
              district: profile.district || "",
              province: profile.province || "",
              shippingBranch: profile.shippingBranch || "",
            })
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
      setIsLoadingProfile(false)
    }

    loadUserProfile()
  }, [user?.uid, form])

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && !isLoadingProfile && cartItems.length === 0) {
      router.push("/cart")
    }
  }, [cartItems.length, authLoading, isLoadingProfile, router])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user && !isLoadingProfile) {
      router.push("/login")
    }
  }, [user, authLoading, isLoadingProfile, router])

  const onSubmit = async (data: CheckoutFormData) => {
    // Validate shipping branch is selected
    if (!data.shippingBranch || data.shippingBranch.trim() === "") {
      toast({
        title: "ກະລຸນາເລືອກບໍລິສັດຂົນສົ່ງ",
        description: "ກະລຸນາເລືອກບໍລິສັດຂົນສົ່ງກ່ອນດຳເນີນຕໍ່",
        variant: "destructive",
        style: { 
          fontFamily: "'Noto Sans Lao Looped', sans-serif",
          background: "#FEE2E2", 
          border: "1px solid #FECACA",
          color: "#B91C1C"
        }
      })
      return
    }

    setIsLoading(true)
    try {
      // Store checkout data in session storage for payment page
      const checkoutData = {
        customerInfo: data,
        cartItems: cartItems,
        totalAmount: getTotalPrice(),
        totalItems: getTotalItems()
      }
      
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
      
      // Navigate to payment page
      router.push("/payment")
      
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "ເກີດຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດດໍາເນີນການຊື້ໄດ້",
        variant: "destructive",
        style: { fontFamily: "'Noto Sans Lao Looped', sans-serif" }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onUpdateProfile = async (data: CheckoutFormData) => {
    if (!user?.uid) return
    
    setIsUpdatingProfile(true)
    try {
      await updateUserProfile(user.uid, {
        name: data.name,
        surname: data.surname,
        email: data.email,
        phoneNumber: data.phoneNumber,
        whatsapp: data.whatsapp || null,
        village: data.village,
        district: data.district,
        province: data.province,
        shippingBranch: data.shippingBranch,
      })
      
      toast({
        title: "ອັບເດດສຳເລັດ",
        description: "ຂໍ້ມູນຂອງທ່ານໄດ້ຖືກອັບເດດແລ້ວ",
        variant: "default",
        style: { fontFamily: "'Noto Sans Lao Looped', sans-serif" }
      })
    } catch (error) {
      console.error("Update profile error:", error)
      toast({
        title: "ເກີດຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້",
        variant: "destructive",
        style: { fontFamily: "'Noto Sans Lao Looped', sans-serif" }
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-red-50" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
        <Header cartCount={getTotalItems()} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || cartItems.length === 0) {
    return null // Will redirect to login or cart
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <Header cartCount={getTotalItems()} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            ກັບໄປຫນ້າກ່ອນໜ້າ
          </Button>
        </div>

        {/* Progress Steps */}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Information */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r text-black">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6" />
                  ຂໍ້ມູນຂອງທ່ານ
                </CardTitle>
                <CardDescription className="text-black">
                  ກະລຸນາກວດສອບ ແລະ ແກ້ໄຂຂໍ້ມູນຂອງທ່ານ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                        <User className="w-5 h-5" />
                        ຂໍ້ມູນສ່ວນຕົວ
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">ຊື່ *</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-12" placeholder="ປ້ອນຊື່ຂອງທ່ານ" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="surname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">ນາມສະກຸນ *</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-12" placeholder="ປ້ອນນາມສະກຸນ" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5" />
                        ຂໍ້ມູນຕິດຕໍ່
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">ອີເມວ *</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} className="h-12" placeholder="example@email.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">ເລກໂທລະສັບ *</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} className="h-12" placeholder="020 XX XXX XXX" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">WhatsApp (ທາງເລືອກ)</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-12" placeholder="020 XX XXX XXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5" />
                        ທີ່ຢູ່ຈັດສົ່ງ
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="village"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">ບ້ານ *</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-12" placeholder="ປ້ອນຊື່ບ້ານ" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="district"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">ເມືອງ *</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-12" placeholder="ປ້ອນເມືອງ" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">ແຂວງ *</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-12" placeholder="ປ້ອນແຂວງ" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Shipping Branch Field */}
                      <FormField
                        control={form.control}
                        name="shippingBranch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">ເລືອກບໍລິສັດຂົນສົ່ງ *</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                                  <SelectValue placeholder="ເລືອກບໍລິສັດຂົນສົ່ງ" />
                                </SelectTrigger>
                                <SelectContent style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                                  <SelectItem value="ຂົນສົ່ງຮຸ່ງອາລຸນ">ຂົນສົ່ງຮຸ່ງອາລຸນ</SelectItem>
                                  <SelectItem value="ຂົນສົ່ງອານຸສິດ">ຂົນສົ່ງອານຸສິດ</SelectItem>
                                  <SelectItem value="ຂົນສົ່ງມີໄຊ">ຂົນສົ່ງມີໄຊ</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Update Button for Customer Information */}
                    <div className="pt-6 border-t border-gray-200">
                      <Button 
                        type="button"
                        onClick={form.handleSubmit(onUpdateProfile)}
                        disabled={isUpdatingProfile}
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-base"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ກຳລັງອັບເດດ...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            ອັບເດດຂໍ້ມູນລູກຄ້າ
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-4">
              <CardHeader className="bg-gradient-to-r text-black">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  ລາຍລະອຽດການສັ່ງຊື້
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-gray-100">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg border flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500">ຈຳນວນ: {item.quantity}</p>
                          <p className="text-xs text-gray-500">ລາຄາ: {item.price.toLocaleString()} ຕໍ່ອັນ</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-xs">{(item.price * item.quantity).toLocaleString()} ກີບ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="">
                    {/* <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ລວມ:</span>
                      <span>{getTotalPrice().toLocaleString()} ກີບ</span>
                    </div> */}
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                      <span>ລວມທັງໝົດ:</span>
                      <span className="text-orange-600">{getTotalPrice().toLocaleString()} ກີບ</span>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <Button 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium text-base shadow-lg mt-4"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ກຳລັງດຳເນີນການ...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        ດຳເນີນການຊຳລະເງິນ
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}