"use client"

import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/lib/types"

interface CartDrawerProps {
  cartItems: CartItem[]
  updateQuantity: (itemId: number, quantity: number) => void
  removeFromCart: (itemId: number) => void
  getTotalItems: () => number
  getTotalPrice: () => number
  clearCart: () => void
}

export function CartDrawer({
  cartItems,
  updateQuantity,
  removeFromCart,
  getTotalItems,
  getTotalPrice,
  clearCart,
}: CartDrawerProps) {
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="w-4 h-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping Cart ({totalItems})
            </SheetTitle>
            {cartItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600">
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add some laptops to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.laptop.image || "/placeholder.svg"}
                      alt={item.laptop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{item.laptop.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{item.laptop.brand}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 p-1"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium">${item.laptop.price.toLocaleString()}</span>
                      <span className="text-sm font-bold text-orange-600">
                        ${(item.laptop.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium">${totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
