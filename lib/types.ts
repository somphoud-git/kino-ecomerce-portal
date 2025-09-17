export interface Laptop {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  image: string
  rating: number
  sold: number
  brand: string
  processor: string
  ram: string
  storage: string
  screen: string
  inStock: boolean
  freeShipping: boolean
  category: string
  description?: string
  features?: string[]
  createdAt?: Date
  updatedAt?: Date
  isActive?: boolean
}

export interface CartItem {
  id: number
  laptop: Laptop
  quantity: number
}
