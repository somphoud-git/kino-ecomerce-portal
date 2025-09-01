export interface Laptop {
  id: number
  name: string
  price: number
  originalPrice?: number
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
}

export interface CartItem {
  id: number
  laptop: Laptop
  quantity: number
}
