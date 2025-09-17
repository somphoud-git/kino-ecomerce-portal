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
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/hooks/use-cart"
import { getUserProfile } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"

const checkoutSchema = z.object({
  name: z.string().min(2, "ກະລຸນາເບິ່ງຊື່ອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  surname: z.string().min(2, "ກະລຸນາເບິ່ງນາມສກຸນອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  email: z.string().email("ກະລຸນາໃສ່ອີເມວໃຫ້ຖືກຕ້ອງ"),
  phoneNumber: z.string().min(8, "ເລກໂທລະສັບຕ້ອງມີອຍ່າງນ້ອຍ 8 ຫນັກ"),
  whatsapp: z.string().optional(),
  village: z.string().min(1, "ກະລຸນາເບິ່ງຊື່ສີດະບານ"),
  district: z.string().min(1, "ກະລຸນາເບິ່ງເມວງ/ແຂວງ"),
  province: z.string().min(1, "ກະລຸນາເບິ່ງແຂວງ"),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const { cartItems, getTotalPrice, getTotalItems } = useCart()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
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
    if (!isLoadingProfile && cartItems.length === 0) {
      router.push("/cart")
    }
  }, [cartItems.length, isLoadingProfile, router])

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoadingProfile) {
      router.push("/login")
    }
  }, [user, isLoadingProfile, router])

  const onSubmit = async (data: CheckoutFormData) => {
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
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProfile) {
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

  if (!user) {
    return null // Will redirect to login
  }

  if (cartItems.length === 0) {
    return null // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={getTotalItems()} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
            ຢືນຍັນການສັ່ງຊື້
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ຂໍ້ມູນລູກຄ້າ
                </CardTitle>
                <CardDescription className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ກະລຸນາກວດສອບແລະແກ້ໄຂຂໍ້ມູນຂອງທ່ານ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                              ຊື່ *
                            </FormLabel>
                            <FormControl>
                              <Input {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="surname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                              ນາມສກຸນ *
                            </FormLabel>
                            <FormControl>
                              <Input {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                              ອີເມວ *
                            </FormLabel>
                            <FormControl>
                              <Input type="email" {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                              ເລກໂທລະສັບ *
                            </FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                            WhatsApp (ທາງເລືອກ)
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                          </FormControl>
                          <FormMessage className="font-thai" />
                        </FormItem>
                      )}
                    />

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                        ທີ່ຢູ່
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="village"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                              ບ້ານ *
                            </FormLabel>
                            <FormControl>
                              <Input {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="district"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                                ເມືອງ/ແຂວງ *
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                              </FormControl>
                              <FormMessage className="font-thai" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                                ແຂວງ *
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }} />
                              </FormControl>
                              <FormMessage className="font-thai" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                  ລາຍລະອຽດການສັ່ງຊື້
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-3 border-b">
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
                  
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ລວມຍ່ອຍ:</span>
                      <span>${getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ຄ່າສົ່ງ:</span>
                      <span className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ຟຣີ</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>ລວມທັງໝົດ:</span>
                      <span>${getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai"
                    style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                    {isLoading ? "ກໍາລັງດໍາເນີນການ..." : "ດໍາເນີນການຊໍາລະເງິນ"}
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