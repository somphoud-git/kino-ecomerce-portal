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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { loginWithEmailAndPassword, LoginData, logout } from "@/lib/auth"
import { getUserProfile } from "@/lib/firestore" // Add this import
import { useToast } from "@/hooks/use-toast"

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "ກາລຸນາປ້ອນອີເມວ ຫຼື ເບີໂທລະສັບ"),
  password: z.string().min(1, "ກາລະນາກວດສອບລະຫັດຜ່ານ"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Prepare data for Firebase login
      const loginData: LoginData = {
        emailOrPhone: data.emailOrPhone,
        password: data.password
      }
      
      // Login with Firebase Auth
      const userCredential = await loginWithEmailAndPassword(loginData)
      
      // Fetch user profile from Firestore and check status
      try {
        const userProfile = await getUserProfile(userCredential.user.uid)
        if (userProfile) {
          console.log("User profile loaded:", userProfile)
          
          // Check if user is blocked
          if (userProfile.status === 'Blocked') {
            // Sign out the blocked user immediately
            await logout()
            
            toast({
              title: "🔒 ບໍ່ສາມາດເຂົ້າສູ່ລະບົບໄດ້",
              description: "User ຂອງທ່ານຖືກບ໊ອກ",
              variant: "destructive",
              style: { 
                fontFamily: "'Noto Sans Lao Looped', sans-serif",
                color: 'white'
              }
            })
            
            setIsLoading(false)
            return // Stop the login process
          }
          // You can store this in context or state management if needed
        }
      } catch (profileError) {
        console.warn("Could not fetch user profile:", profileError)
        // Continue with login even if profile fetch fails
      }
      
      toast({
        title: "ເຂົ້າສູ່ລະບົບສໍາເລັດ!",
        description: "ຍິນດີຕ້ອນເຂົ້າສູ່ເວັບໄຊທ໌ຂອງຮ້ານ NoRacing",
        style: { fontFamily: "'Noto Sans Lao Looped', sans-serif" }
      })
      
      // Redirect to products page
      router.push("/products")
      
    } catch (error) {
      console.error("Login error:", error)
      
      let errorMessage = "ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ"
      
      if (error instanceof Error) {
        // Handle specific Firebase Auth errors
        if (error.message.includes("user-not-found")) {
          errorMessage = "ບໍ່ພົບຜູ້ໃຊ້ນີ້ໃນລະບົບ"
        } else if (error.message.includes("wrong-password")) {
          errorMessage = "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"
        } else if (error.message.includes("invalid-phone-number")) {
          errorMessage = "ເລກໂທລະສັບບໍ່ຖືກຕ້ອງ"
        } else if (error.message.includes("too-many-requests")) {
          errorMessage = "ພະຍາຍາມເຂົ້າສູ່ລະບົບຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າ"
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
    <div className="min-h-screen bg-gray-50">
      <Header wishlistCount={0} cartCount={0} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
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
                ເຂົ້າສູ່ລະບົບ
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"                          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  >
                  <FormField
                    control={form.control}
                    name="emailOrPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel 
                          className="font-thai"
                        >
                          ອີເມວ ຫຼື ເບີໂທລະສັບ
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="ປ້ອນອີເມວ ຫຼື ເບີໂທລະສັບ"
                            {...field}
                            className="font-thai"
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
                        >
                          ລະຫັດຜ່ານ
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="ປ້ອນລະຫັດຜ່ານ"
                              {...field}
                              className="pr-10 font-thai"
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

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      disabled={isLoading}
                    >
                      {isLoading ? "ກໍາລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
                    </Button>

                    <div className="text-center">
                      <p 
                        className="text-sm text-gray-600 font-thai"
                        style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      >
                        ຍັງບໍ່ມີບັນຊີ?{" "}
                        <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                          ສະໝັກສະມາຊິກ
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