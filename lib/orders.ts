import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'
import { db, storage } from './firebase'

export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export interface CustomerInfo {
  name: string
  surname: string
  email: string
  phoneNumber: string
  whatsapp?: string
  village: string
  district: string
  province: string
}

export interface Order {
  id?: string
  userId: string
  customerInfo: CustomerInfo
  items: OrderItem[]
  totalAmount: number
  totalItems: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentReceipt?: {
    name: string
    size: number
    type: string
    url?: string
  } | null
  comments?: string
  createdAt: any
  updatedAt: any
}

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, receiptFile?: File | null): Promise<string> => {
  try {
    console.log('Creating order with data:', orderData)
    
    // Validate required data
    if (!orderData.userId) {
      throw new Error('User ID is required')
    }
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order items are required')
    }
    if (!orderData.customerInfo) {
      throw new Error('Customer information is required')
    }
    
    // Generate order ID
    const orderId = `ORD${Date.now()}`
    console.log('Generated order ID:', orderId)
    
    // Upload receipt file if provided
    let receiptUrl = null
    if (receiptFile && orderData.paymentReceipt) {
      try {
        console.log('Uploading receipt file:', receiptFile.name)
        
        // Check if storage is available
        if (!storage) {
          throw new Error('Firebase Storage is not properly configured')
        }
        
        const receiptRef = ref(storage, `payment-receipts/${orderId}/${receiptFile.name}`)
        const uploadResult = await uploadBytes(receiptRef, receiptFile)
        receiptUrl = await getDownloadURL(uploadResult.ref)
        console.log('Receipt uploaded successfully:', receiptUrl)
      } catch (uploadError) {
        console.error('Error uploading receipt:', uploadError)
        // Continue without receipt upload rather than failing entire order
        receiptUrl = null
      }
    }
    
    // Create order document
    const order: Order = {
      ...orderData,
      id: orderId,
      paymentReceipt: orderData.paymentReceipt ? {
        ...orderData.paymentReceipt,
        url: receiptUrl || undefined
      } : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    console.log('Saving order to Firestore:', order)
    
    // Check if db is available
    if (!db) {
      throw new Error('Firebase Firestore is not properly configured')
    }
    
    // Save to Firestore
    const orderRef = doc(db, 'orders', orderId)
    await setDoc(orderRef, order)
    
    console.log('Order created successfully:', orderId)
    return orderId
  } catch (error) {
    console.error('Error creating order:', error)
    
    // Provide more specific error information
    if (error instanceof Error) {
      throw new Error(`Failed to create order: ${error.message}`)
    } else {
      throw new Error(`Failed to create order: ${JSON.stringify(error)}`)
    }
  }
}

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    const orderSnap = await getDoc(orderRef)
    
    if (orderSnap.exists()) {
      return orderSnap.data() as Order
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting order:', error)
    throw new Error('Failed to get order')
  }
}

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(ordersQuery)
    const orders: Order[] = []
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as Order)
    })
    
    // Sort manually by createdAt in JavaScript (temporary solution)
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt)
      const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt)
      return timeB.getTime() - timeA.getTime() // DESC order (newest first)
    })
    
    return orders
  } catch (error) {
    console.error('Error getting user orders:', error)
    throw new Error('Failed to get user orders')
  }
}

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    })
    
    console.log('Order status updated successfully')
  } catch (error) {
    console.error('Error updating order status:', error)
    throw new Error('Failed to update order status')
  }
}

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(ordersQuery)
    const orders: Order[] = []
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as Order)
    })
    
    return orders
  } catch (error) {
    console.error('Error getting all orders:', error)
    throw new Error('Failed to get all orders')
  }
}