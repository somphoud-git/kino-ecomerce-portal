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
import { loginWithPhoneNumber, LoginData } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

const loginSchema = z.object({
  phoneNumber: z.string().min(8, "ກະລຸນາເບິ່ງເລກໂທລະສັບໃຫ້ຖືກຕ້ອງ"),
  password: z.string().min(1, "ກະລຸນາເບິ່ງລະຫັດຜ່ານ"),
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
      phoneNumber: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Prepare data for Firebase login
      const loginData: LoginData = {
        phoneNumber: data.phoneNumber,
        password: data.password
      }
      
      // Login with Firebase
      const userCredential = await loginWithPhoneNumber(loginData)
      
      toast({
        title: "ເຂົ້າສູ່ລະບົບສໍາເລັດ!",
        description: "ຍິນດີຕ້ອນຮັບກັບມາຊົບປິ້ງ"
      })
      
      // Redirect to products page
      router.push("/products")
      
    } catch (error) {
      console.error("Login error:", error)
      
      const errorMessage = error instanceof Error ? error.message : "ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ"
      
      toast({
        title: "ເກີດຂໍ້ຜິດພາດ",
        description: errorMessage,
        variant: "destructive"
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
                ກັບໄປໝັ່ງສິນຄ້າ
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
              <CardDescription 
                className="text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ເບິ່ງຂໍ້ມູນເພື່ອເຂົ້າສູ່ລະບົບ
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel 
                          className="font-thai"
                          style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                        >
                          ເລກໂທລະສັບ
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="ເບິ່ງເລກໂທລະສັບ"
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
                          ລະຫັດຜ່ານ
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="ເບິ່ງລະຫັດຜ່ານ"
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

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-thai"
                      style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      disabled={isLoading}
                    >
                      {isLoading ? "ກໍາລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
                    </Button>

                    <div className="text-center">
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-blue-600 hover:text-blue-800 font-thai"
                        style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      >
                        ລືມລະຫັດຜ່ານ?
                      </Link>
                    </div>

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