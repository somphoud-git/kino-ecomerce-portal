import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  QueryConstraint 
} from 'firebase/firestore'
import { db } from './firebase'
import { mockLaptops } from './data'
import type { Laptop } from './types'

// Check if we should use mock data
const shouldUseMockData = () => {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
}

export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'popular' | 'newest'
  limit?: number
}

// Get all products with optional filters
export const getProducts = async (filters: ProductFilters = {}): Promise<Laptop[]> => {
  // Use mock data if configured
  if (shouldUseMockData()) {
    console.log('Using mock data for products')
    return getMockProducts(filters)
  }

  try {
    const productsRef = collection(db, 'products')
    const constraints: QueryConstraint[] = []

    // Apply filters
    if (filters.category) {
      constraints.push(where('category', '==', filters.category))
    }
    
    if (filters.brand) {
      constraints.push(where('brand', '==', filters.brand))
    }
    
    if (filters.inStock !== undefined) {
      constraints.push(where('inStock', '==', filters.inStock))
    }
    
    if (filters.minPrice !== undefined) {
      constraints.push(where('price', '>=', filters.minPrice))
    }
    
    if (filters.maxPrice !== undefined) {
      constraints.push(where('price', '<=', filters.maxPrice))
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          constraints.push(orderBy('price', 'asc'))
          break
        case 'price-high':
          constraints.push(orderBy('price', 'desc'))
          break
        case 'rating':
          constraints.push(orderBy('rating', 'desc'))
          break
        case 'popular':
          constraints.push(orderBy('sold', 'desc'))
          break
        case 'newest':
          constraints.push(orderBy('createdAt', 'desc'))
          break
      }
    }

    // Apply limit
    if (filters.limit) {
      constraints.push(firestoreLimit(filters.limit))
    }

    const q = query(productsRef, ...constraints)
    const querySnapshot = await getDocs(q)
    
    const products: Laptop[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      products.push({
        ...data,
        id: parseInt(doc.id),
        // Map imageUrl from Firebase to image field expected by frontend
        image: data.imageUrl || data.image || "/placeholder-image.jpg"
      } as unknown as Laptop)
    })

    return products
  } catch (error) {
    console.error('Error fetching products from Firebase:', error)
    console.log('Falling back to mock data due to Firebase error')
    // Fallback to mock data when Firebase fails
    return getMockProducts(filters)
  }
}

// Get single product by ID
export const getProductById = async (id: string): Promise<Laptop | null> => {
  // Use mock data if configured
  if (shouldUseMockData()) {
    console.log('Using mock data for product:', id)
    return getMockProductById(id)
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', id))
    
    if (productDoc.exists()) {
      const data = productDoc.data()
      return {
        ...data,
        id: parseInt(productDoc.id),
        // Map imageUrl from Firebase to image field expected by frontend
        image: data.imageUrl || data.image || "/placeholder-image.jpg"
      } as unknown as Laptop
    }
    
    return null
  } catch (error) {
    console.error('Error fetching product from Firebase:', error)
    console.log('Falling back to mock data for product:', id)
    // Fallback to mock data when Firebase fails
    return getMockProductById(id)
  }
}

// Get products by category
export const getProductsByCategory = async (category: string, limit?: number): Promise<Laptop[]> => {
  return getProducts({ category, limit })
}

// Get featured/popular products
export const getFeaturedProducts = async (limit: number = 8): Promise<Laptop[]> => {
  return getProducts({ sortBy: 'popular', limit })
}

// Get products on sale
export const getSaleProducts = async (limit?: number): Promise<Laptop[]> => {
  // Use mock data if configured
  if (shouldUseMockData()) {
    console.log('Using mock data for sale products')
    let products = mockLaptops.filter(p => p.originalPrice && p.originalPrice > 0)
    if (limit) {
      products = products.slice(0, limit)
    }
    return products
  }

  try {
    const productsRef = collection(db, 'products')
    const constraints: QueryConstraint[] = [
      where('originalPrice', '>', 0)
    ]
    
    if (limit) {
      constraints.push(firestoreLimit(limit))
    }
    
    const q = query(productsRef, ...constraints)
    const querySnapshot = await getDocs(q)
    
    const products: Laptop[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      products.push({
        ...data,
        id: parseInt(doc.id),
        // Map imageUrl from Firebase to image field expected by frontend
        image: data.imageUrl || data.image || "/placeholder-image.jpg"
      } as unknown as Laptop)
    })

    return products
  } catch (error) {
    console.error('Error fetching sale products from Firebase:', error)
    console.log('Falling back to mock data for sale products')
    // Fallback to mock data
    let products = mockLaptops.filter(p => p.originalPrice && p.originalPrice > 0)
    if (limit) {
      products = products.slice(0, limit)
    }
    return products
  }
}

// Get available brands
export const getAvailableBrands = async (): Promise<string[]> => {
  // Use mock data if configured
  if (shouldUseMockData()) {
    console.log('Using mock data for brands')
    const brands = new Set<string>()
    mockLaptops.forEach(product => {
      if (product.brand) brands.add(product.brand)
    })
    return Array.from(brands).sort()
  }

  try {
    const productsSnapshot = await getDocs(collection(db, 'products'))
    const brands = new Set<string>()
    
    productsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.brand) {
        brands.add(data.brand)
      }
    })
    
    return Array.from(brands).sort()
  } catch (error) {
    console.error('Error fetching brands from Firebase:', error)
    console.log('Falling back to mock data for brands')
    // Fallback to mock data
    const brands = new Set<string>()
    mockLaptops.forEach(product => {
      if (product.brand) brands.add(product.brand)
    })
    return Array.from(brands).sort()
  }
}

// Get available categories
export const getAvailableCategories = async (): Promise<string[]> => {
  // Use mock data if configured
  if (shouldUseMockData()) {
    console.log('Using mock data for categories')
    const categories = new Set<string>()
    mockLaptops.forEach(product => {
      if (product.category) categories.add(product.category)
    })
    return Array.from(categories).sort()
  }

  try {
    const productsSnapshot = await getDocs(collection(db, 'products'))
    const categories = new Set<string>()
    
    productsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.category) {
        categories.add(data.category)
      }
    })
    
    return Array.from(categories).sort()
  } catch (error) {
    console.error('Error fetching categories from Firebase:', error)
    console.log('Falling back to mock data for categories')
    // Fallback to mock data
    const categories = new Set<string>()
    mockLaptops.forEach(product => {
      if (product.category) categories.add(product.category)
    })
    return Array.from(categories).sort()
  }
}

// Search products by name or description
export const searchProducts = async (searchTerm: string, filters: ProductFilters = {}): Promise<Laptop[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that fetches all products and filters client-side
    // For production, consider using Algolia, Elasticsearch, or Firestore's limited text search
    
    const products = await getProducts(filters)
    
    const searchTermLower = searchTerm.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTermLower) ||
      product.brand.toLowerCase().includes(searchTermLower) ||
      product.category.toLowerCase().includes(searchTermLower) ||
      (product.description && product.description.toLowerCase().includes(searchTermLower))
    )
  } catch (error) {
    console.error('Error searching products:', error)
    throw new Error('ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາສິນຄ້າ')
  }
}

// Mock data helper functions for fallback
const getMockProducts = (filters: ProductFilters = {}): Laptop[] => {
  let products = [...mockLaptops]

  // Apply filters
  if (filters.category) {
    products = products.filter(p => p.category === filters.category)
  }
  
  if (filters.brand) {
    products = products.filter(p => p.brand === filters.brand)
  }
  
  if (filters.inStock !== undefined) {
    products = products.filter(p => p.inStock === filters.inStock)
  }
  
  if (filters.minPrice !== undefined) {
    products = products.filter(p => p.price >= filters.minPrice!)
  }
  
  if (filters.maxPrice !== undefined) {
    products = products.filter(p => p.price <= filters.maxPrice!)
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        products.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        products.sort((a, b) => b.rating - a.rating)
        break
      case 'popular':
        products.sort((a, b) => b.sold - a.sold)
        break
    }
  }

  // Apply limit
  if (filters.limit) {
    products = products.slice(0, filters.limit)
  }

  return products
}

const getMockProductById = (id: string): Laptop | null => {
  const productId = parseInt(id)
  return mockLaptops.find(p => p.id === productId) || null
}

// Check product stock availability
export const checkProductStock = async (productId: number, requestedQuantity: number): Promise<{ available: boolean; availableStock: number }> => {
  if (shouldUseMockData()) {
    const product = mockLaptops.find(p => p.id === productId)
    const availableStock = product?.quantity || 0
    return {
      available: availableStock >= requestedQuantity,
      availableStock
    }
  }

  try {
    const productRef = doc(db, 'products', productId.toString())
    const productSnap = await getDoc(productRef)
    
    if (!productSnap.exists()) {
      return { available: false, availableStock: 0 }
    }
    
    const product = productSnap.data() as Laptop
    const availableStock = product.quantity || 0
    
    return {
      available: availableStock >= requestedQuantity,
      availableStock
    }
  } catch (error) {
    console.error('Error checking product stock:', error)
    return { available: false, availableStock: 0 }
  }
}

// Update product stock after purchase
export const updateProductStock = async (productId: number, quantityPurchased: number): Promise<void> => {
  if (shouldUseMockData()) {
    console.log(`Mock: Would update product ${productId} stock by -${quantityPurchased}`)
    return
  }

  try {
    const productRef = doc(db, 'products', productId.toString())
    const productSnap = await getDoc(productRef)
    
    if (!productSnap.exists()) {
      throw new Error(`Product ${productId} not found`)
    }
    
    const product = productSnap.data() as Laptop
    const currentStock = product.quantity || 0
    const newStock = Math.max(0, currentStock - quantityPurchased)
    
    await updateDoc(productRef, {
      quantity: newStock
    })
    
    console.log(`Updated product ${productId} stock from ${currentStock} to ${newStock}`)
  } catch (error) {
    console.error('Error updating product stock:', error)
    throw error
  }
}

// Validate cart item against available stock
export const validateCartQuantity = async (productId: number, requestedQuantity: number, currentCartQuantity: number = 0): Promise<{ valid: boolean; maxAllowed: number; message?: string }> => {
  try {
    const stockCheck = await checkProductStock(productId, requestedQuantity + currentCartQuantity)
    
    if (!stockCheck.available) {
      return {
        valid: false,
        maxAllowed: Math.max(0, stockCheck.availableStock - currentCartQuantity),
        message: `ສິນຄ້າມີຈໍານວນພຽງ ${stockCheck.availableStock} ເທົ່ານີ້`
      }
    }
    
    return {
      valid: true,
      maxAllowed: stockCheck.availableStock
    }
  } catch (error) {
    console.error('Error validating cart quantity:', error)
    return {
      valid: false,
      maxAllowed: 0,
      message: "ບໍ່ສາມາດກວດສອບສະຕ໋ອກໄດ້"
    }
  }
}

// Update stock for multiple products (for order processing)
export const updateMultipleProductStock = async (orderItems: { id: number; quantity: number }[]): Promise<void> => {
  if (shouldUseMockData()) {
    console.log('Mock: Would update stock for multiple products:', orderItems)
    return
  }

  try {
    const updatePromises = orderItems.map(item => 
      updateProductStock(item.id, item.quantity)
    )
    
    await Promise.all(updatePromises)
    console.log('Successfully updated stock for all products in order')
  } catch (error) {
    console.error('Error updating stock for multiple products:', error)
    throw error
  }
}