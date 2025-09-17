"use client"

import type React from "react"

import { useState } from "react"
import { X, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { loginWithPhoneNumber, LoginData } from "@/lib/auth"
import { getUserProfile } from "@/lib/firestore" // Add this import
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "cart" | "buy" | null
  onLoginSuccess?: () => void
}

export function LoginModal({ isOpen, onClose, actionType, onLoginSuccess }: LoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const loginData: LoginData = {
        phoneNumber,
        password
      }
      
      // Login with Firebase Auth
      const userCredential = await loginWithPhoneNumber(loginData)
      
      // Fetch user profile from Firestore
      try {
        const userProfile = await getUserProfile(userCredential.user.uid)
        if (userProfile) {
          console.log("User profile loaded:", userProfile)
          // You can store this in context or state management if needed
        }
      } catch (profileError) {
        console.warn("Could not fetch user profile:", profileError)
        // Continue with login even if profile fetch fails
      }
      
      toast({
        title: "ເຂົ້າສູ່ລະບົບສໍ່າເລັດ!",
        description: "ຍິນດີຕ້ອນຮັບກັບມາ"
      })
      
      // Close modal and call success callback if provided
      onClose()
      
      // Call success callback to handle pending cart/buy actions
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        // If no callback provided, just reload the page to update auth state
        window.location.reload()
      }
      
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
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getActionText = () => {
    if (actionType === "cart") return "ໃສ່ກະຕ່າ"
    if (actionType === "buy") return "ຊື້ດຽວນີ້"
    return "ສືບຕໍ່"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <CardTitle 
            className="text-xl font-bold text-center font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            ເຂົ້າສູ່ລະບົບ
          </CardTitle>
          <p 
            className="text-sm text-gray-600 text-center font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອ {getActionText()}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="phoneNumber" 
                className="font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ເລກໂທລະສັບ
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="ເບິ່ງເລກໂທລະສັບ"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password"
                className="font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ລະຫັດຜ່ານ
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ເບິ່ງລະຫັດຜ່ານ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 font-thai"
                  style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-thai"
              style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              disabled={isLoading}
            >
              {isLoading ? "ກໍາລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
            </Button>

            <div className="text-center space-y-2">
              <div 
                className="text-sm text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ຍັງບໍ່ມີບັນຊີ?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  ສະໝັກສະມາຊິກ
                </Link>
              </div>
              <div 
                className="text-sm text-gray-600 font-thai"
                style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
              >
                ຫຼື{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  ໄປຫນ້າເຂົ້າສູ່ລະບົບ
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
