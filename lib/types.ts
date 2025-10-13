export interface Laptop {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  discountPrice?: number | null
  image: string
  rating: number
  sold: number
  brand: string
  processor: string
  ram: string
  storage: string
  screen: string
  inStock: boolean
  quantity?: number
  freeShipping: boolean
  category: string
  description?: string
  features?: string[]
  barcode?: string
  zone?: string
  createdAt?: Date
  updatedAt?: Date
  status?: string
  recommend?: string
  Active?: boolean
}

export interface Category {
  id: string
  name: string
  displayName: string
  description?: string
  Active?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  discountPrice?: number
  quantity: number
  barcode?: string
  zone?: string
}

export interface Settings {
  id?: string
  qrCodeImageUrl?: string
  enableDeposit: boolean
  createdAt?: Date
  updatedAt?: Date
}
