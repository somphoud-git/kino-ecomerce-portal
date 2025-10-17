"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { registerWithEmailAndPassword, RegisterData } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { generateRandomEmail } from "@/lib/email-utils"

const registerSchema = z.object({
  name: z.string().min(2, "ກະລຸນາເບິ່ງຊື່ອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  surname: z.string().min(2, "ກະລຸນາເບິ່ງນາມສກຸນອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  email: z.string().optional(), // Email is now optional
  phoneNumber: z.string().min(8, "ເລກໂທລະສັບຕ້ອງມີອຍ່າງນ້ອຍ 8 ຫນັກ"),
  password: z.string().min(6, "ລະຫັດຜ່ານຕ້ອງມີອຍ່າງນ້ອຍ 6 ຕົວອັກສອນ"),
  whatsapp: z.string().optional(),
  village: z.string().min(1, "ກະລຸນາເບິ່ງຊື່ບ້ານ"),
  district: z.string().min(1, "ກະລຸນາເບິ່ງເມວງ/ແຂວງ"),
  province: z.string().min(1, "ກະລຸນາເບິ່ງແຂວງ"),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setUserProfile } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      password: "",
      whatsapp: "",
      village: "",
      district: "",
      province: "",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Generate random email if user didn't provide one
      // Uses utility function to create consistent format
      const emailToUse = data.email && data.email.trim() !== "" 
        ? data.email 
        : generateRandomEmail(data.phoneNumber)
      
      console.log('Email for registration:', emailToUse)
      
      // Prepare data for Firebase registration
      const registerData: RegisterData = {
        name: data.name,
        surname: data.surname,
        email: emailToUse, // Use provided email or generated one
        phoneNumber: data.phoneNumber,
        whatsapp: data.whatsapp || undefined,
        village: data.village,
        district: data.district,
        province: data.province,
        password: data.password,
      }
      
      // Register with Firebase Auth - this creates the user account and customer profile
      // User is automatically logged in after successful registration
      const userCredential = await registerWithEmailAndPassword(registerData)
      
      // Manually set the user profile in the auth context
      const profile = {
        uid: userCredential.user.uid,
        name: data.name,
        surname: data.surname,
        phoneNumber: data.phoneNumber,
        whatsapp: data.whatsapp || undefined,
        village: data.village,
        district: data.district,
        province: data.province,
        email: emailToUse,
        userType: 'customer' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setUserProfile(profile)
      
      toast({
        title: "ລົງທະບຽນສຳເລັດ!",
        description: "ຍິນດີຕ້ອນຮັບສູ່ລະບົບ",
        style: { 
          fontFamily: "'Noto Sans Lao Looped', sans-serif",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white"
        }
      })
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        router.push("/products")
      }, 500)
      
    } catch (error) {
      console.error("Registration error:", error)
      
      let errorMessage = "ເກີດຂໍ້ຜິດພາດໃນການລົງທະບຽນ"
      
      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes("email-already-in-use") || error.message.includes("ອີເມວນີ້ໄດ້ຖືກໃຊ້ແລ້ວ")) {
          errorMessage = "ອີເມວນີ້ມີໃນລະບົບແລ້ວ"
        } else if (error.message.includes("phone-number-already-exists") || error.message.includes("ເລກໂທລະສັບນີ້ໄດ້ຖືກໃຊ້ແລ້ວ")) {
          errorMessage = "ເບີໂທລະສັບນີ້ມີໃນລະບົບແລ້ວ"
        } else if (error.message.includes("weak-password")) {
          errorMessage = "ລະຫັດຜ່ານອ່ອນແອເກີນໄປ"
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "ອີເມວບໍ່ຖືກຕ້ອງ"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "ເກີດຂໍ້ຜິດພາດ",
        description: errorMessage,
        variant: "destructive",
        style: { 
          fontFamily: "'Noto Sans Lao Looped', sans-serif",
          color: 'white'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <Header wishlistCount={0} cartCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/products">
              <Button variant="ghost" className="font-thai" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ກັບໄປຫນ້າສິນຄ້າ
              </Button>
            </Link>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle 
                className="text-3xl font-bold text-gray-900 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
              ລົງທະບຽນ
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 
                      className="text-lg font-semibold text-gray-900 font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    >
                      ຂໍ້ມູນສ່ວນຕົວ
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ຊື່ *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ປ້ອນຊື່"
                                {...field}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              />
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
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ນາມສກຸນ *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ປ້ອນນາມສະກຸນ"
                                {...field}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 
                      className="text-lg font-semibold text-gray-900 font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    >
                      ຂໍ້ມູນຕິດຕໍ່
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ອີເມວ (ຖ້າມີ)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="ປ້ອນອີເມວ (ຖ້າມີ)"
                                {...field}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
                              ຖ້າບໍ່ໃສ່ອີເມວ, ທ່ານສາມາດເຂົ້າສູ່ລະບົບດ້ວຍເບີໂທລະສັບ
                            </p>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ເບີໂທລະສັບ *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="ປ້ອນເບີໂທລະສັບ"
                                {...field}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ລະຫັດຜ່ານ *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="ປ້ອນລະຫັດຜ່ານ"
                                  {...field}
                                  className="pr-10 font-thai"
                                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              WhatsApp (ຖ້າມີ)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="ປ້ອນເບີ WhatsApp"
                                {...field}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 
                      className="text-lg font-semibold text-gray-900 font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                    >
                      ທີ່ຢູ່
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="village"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel 
                            className="font-thai"
                            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                          >
                            ບ້ານ *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ປ້ອນຊື່ບ້ານ"
                              {...field}
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            />
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
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ເມືອງ *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ປ້ອນເມືອງ"
                                {...field}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              />
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
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ແຂວງ *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ປ້ອນຊື່ແຂວງ"
                                {...field}
                                className="font-thai"
                                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                              />
                            </FormControl>
                            <FormMessage className="font-thai" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      disabled={isLoading}
                    >
                      {isLoading ? "ກໍາລັງລົງທະບຽນ..." : "ລົງທະບຽນ"}
                    </Button>

                    <div className="text-center">
                      <p 
                        className="text-sm text-gray-600 font-thai"
                        style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      >
                        ມີບັນບັນຊີແລ້ວ?{" "}
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                          ເຂົ້າສູ່ລະບົບ
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}