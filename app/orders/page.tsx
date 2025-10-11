"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to cart page with orders tab active
    router.replace("/cart?tab=orders")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
          ກາລງໂຫດ...
        </p>
      </div>
    </div>
  )
}
