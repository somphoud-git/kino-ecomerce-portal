"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
  actionType: "cart" | "buy" | null
}

export function LoginModal({ isOpen, onClose, onLogin, actionType }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
    setEmail("")
    setPassword("")
  }

  const getActionText = () => {
    if (actionType === "cart") return "add to cart"
    if (actionType === "buy") return "buy now"
    return "continue"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-bold text-center">{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Please {isSignUp ? "create an account" : "sign in"} to {getActionText()}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
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
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center space-y-2">
              <Button type="button" variant="link" className="text-sm" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </Button>
              <div className="text-sm text-gray-600">
                Or{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  create a full account
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
