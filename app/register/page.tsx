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
import { registerWithPhoneNumber, RegisterData } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

const registerSchema = z.object({
  name: z.string().min(2, "ກະລຸນາເບິ່ງຊື່ອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  surname: z.string().min(2, "ກະລຸນາເບິ່ງນາມສກຸນອຍ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
  email: z.string().email("ກະລຸນາເບິ່ງອີເມນໃຫ້ຖືກຕ້ອງ").optional(),
  password: z.string().min(6, "ລະຫັດຜ່ານຕ້ອງມີອຍ່າງນ້ອຍ 6 ຕົວອັກສອນ"),
  confirmPassword: z.string(),
  phoneNumber: z.string().min(8, "ເລກໂທລະສັບຕ້ອງມີອຍ່າງນ້ອຍ 8 ຫນັກ"),
  whatsapp: z.string().optional(),
  village: z.string().min(1, "ກະລຸນາເບິ່ງຊື່ສີດະບານ"),
  district: z.string().min(1, "ກະລຸນາເບິ່ງເມວງ/ແຂວງ"),
  province: z.string().min(1, "ກະລຸນາເບິ່ງແຂວງ"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "ລະຫັດຜ່ານບໍ່ຕົງກັນ",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      whatsapp: "",
      village: "",
      district: "",
      province: "",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Prepare data for Firebase registration
      const registerData: RegisterData = {
        name: data.name,
        surname: data.surname,
        phoneNumber: data.phoneNumber,
        whatsapp: data.whatsapp || undefined,
        village: data.village,
        district: data.district,
        province: data.province,
        password: data.password,
        confirmPassword: data.confirmPassword
      }
      
      // Register with Firebase
      const userCredential = await registerWithPhoneNumber(registerData)
      
      toast({
        title: "ສະໝັກສະມາຊິກສໍາເລັດ!",
        description: "ພົມກັບເຂົ້າສູ່ລະບົບເພື່ອເລີ່ມຊົບປິ້ງ"
      })
      
      // Redirect to products page
      router.push("/products")
      
    } catch (error) {
      console.error("Registration error:", error)
      
      const errorMessage = error instanceof Error ? error.message : "ເກີດຂໍ້ຜິດພາດໃນການສະໝັກສະມາຊິກ"
      
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
        <div className="max-w-2xl mx-auto">
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
                ສະໝັກສະມາຊິກ
              </CardTitle>
              <CardDescription 
                className="text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ເບິ່ງຂໍ້ມູນເພື່ອສ້າງບັນຊີໃໝມ່
              </CardDescription>
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
                                placeholder="ເບິ່ງຊື່"
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
                                placeholder="ເບິ່ງນາມສກຸນ"
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

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel 
                            className="font-thai"
                            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                          >
                            ອີເມນ *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="ເບິ່ງອີເມນ"
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

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ຢືນຍັນລະຫັດຜ່ານ *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="ยืนยันรหัสผ่าน"
                                  {...field}
                                  className="pr-10 font-thai"
                                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
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
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel 
                              className="font-thai"
                              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                            >
                              ເລກໂທລະສັບ *
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
                                placeholder="ເບິ່ງເລກ WhatsApp"
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
                      ที่อยู่
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
                            ສີດະບານ *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ເບິ່ງຊື່ສີດະບານ"
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
                              ເມວງ/ແຂວງ *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ເບິ່ງເມວງ/ແຂວງ"
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
                                placeholder="ເບິ່ງແຂວງ"
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
                      {isLoading ? "ກໍາລັງສະໝັກສະມາຊິກ..." : "ສະໝັກສະມາຊິກ"}
                    </Button>

                    <div className="text-center">
                      <p 
                        className="text-sm text-gray-600 font-thai"
                        style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                      >
                        ມີບັນຊີອຢູ່ແລ້ວ?{" "}
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