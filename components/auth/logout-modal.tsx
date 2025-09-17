"use client"

import { useState } from "react"
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

interface LogoutModalProps {
  isOpen: boolean
  onCloseAction: () => void
}

export function LogoutModal({ isOpen, onCloseAction }: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast({
        title: "ອອກຈາກລະບົບສໍາເລັດ",
        description: "ລາກຸນມາຊົມອີກ"
      })
      onCloseAction()
    } catch (error) {
      toast({
        title: "ເກີດຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດອອກຈາກລະບົບໄດ້",
        variant: "destructive"
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
            ຢືນຍັນການອອກຈາກລະບົບ
          </AlertDialogTitle>
          <AlertDialogDescription 
            className="font-thai"
            style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}
          >
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບ? ທ່ານຈະຕ້ອງເຂົ້າສູ່ລະບົບໃໝ່ເພື່ອເຂົ້າເຖິງບັນຊີຂອງທ່ານ.
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