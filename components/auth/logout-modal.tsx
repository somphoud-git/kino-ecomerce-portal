"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { logout } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"

interface LogoutModalProps {
  isOpen: boolean
  onCloseAction: () => void
}

export function LogoutModal({ isOpen, onCloseAction }: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { clearCart } = useCart()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      
      // Clear the cart when user logs out
      clearCart()
      
      toast({
        title: "ອອກຈາກລະບົບສໍາເລັດ",
        description: "",
        style: { fontFamily: "'Noto Sans Lao Looped', sans-serif" }
      })
      onCloseAction()
      
      // Navigate to products page after successful logout
      router.push('/products')
      
    } catch (error) {
      toast({
        title: "ເກີດຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດອອກຈາກລະບົບໄດ້",
        variant: "destructive",
        style: { fontFamily: "'Noto Sans Lao Looped', sans-serif" }
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onCloseAction}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle 
            className="font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            ຕ້ອງການອອກຈາກເວັບໄຊທ໌ແທ້ບໍ່?
          </AlertDialogTitle>
          <AlertDialogDescription 
            className="font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            ກົດ "ອອກຈາກລະບົບ" ເພື່ອຢືນຢັນ. 
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
            disabled={isLoggingOut}
          >
            ຍົກເລີກ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            {isLoggingOut ? "ກໍາລັງອອກ..." : "ອອກຈາກລະບົບ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}