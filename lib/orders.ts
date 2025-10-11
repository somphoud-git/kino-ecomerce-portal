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
import { db } from './firebase'

export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  barcode?: string
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
  depositAmount?: number
  remainingAmount?: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentStatus?: 'success' | 'deposit' | 'unpaid'
  paymentReceipt?: string | null
  urlpaymentreceipt?: string
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
    
    // Upload receipt file to S3 if provided
    let receiptUrl = null
    if (receiptFile) {
      try {
        console.log('Uploading receipt file to S3:', receiptFile.name)
        
        // Upload to S3 via API route
        const formData = new FormData()
        formData.append('file', receiptFile)
        formData.append('orderId', orderId)

        const uploadResponse = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: formData
        })

        console.log('Upload response status:', uploadResponse.status, uploadResponse.statusText)

        if (!uploadResponse.ok) {
          // Get error details from response
          let errorDetails = uploadResponse.statusText
          try {
            const errorResponse = await uploadResponse.json()
            errorDetails = errorResponse.details || errorResponse.error || uploadResponse.statusText
            console.error('Upload error details:', errorResponse)
          } catch (e) {
            console.error('Could not parse error response')
          }
          
          throw new Error(`S3 upload failed: ${errorDetails}`)
        }

        const uploadResult = await uploadResponse.json()
        receiptUrl = uploadResult.url
        console.log('Receipt uploaded successfully to S3:', receiptUrl)
        
        // Log if this was a mock upload
        if (uploadResult.mock) {
          console.warn('Receipt upload was mocked - AWS credentials not configured')
        }
      } catch (uploadError) {
        console.error('Error uploading receipt to S3:', uploadError)
        // Continue without receipt upload rather than failing entire order
        receiptUrl = null
      }
    }
    
    // Determine payment status
    let paymentStatus: 'success' | 'deposit' | 'unpaid' = 'unpaid';
    
    if (orderData.depositAmount && orderData.depositAmount > 0) {
      if (orderData.depositAmount >= orderData.totalAmount) {
        paymentStatus = 'success';
      } else {
        paymentStatus = 'deposit';
      }
    }
    
    // Create order document
    const order: Order = {
      ...orderData,
      id: orderId,
      paymentStatus,
      paymentReceipt: receiptUrl || null,
      ...(receiptUrl && { urlpaymentreceipt: receiptUrl }),
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

// Utility functions for deposit payment handling
export const hasDepositPayment = (order: Order): boolean => {
  return !!(order.depositAmount && order.depositAmount > 0)
}

export const hasRemainingAmount = (order: Order): boolean => {
  return !!(order.remainingAmount && order.remainingAmount > 0)
}

export const calculateRemainingAmount = (totalAmount: number, depositAmount?: number): number => {
  if (!depositAmount || depositAmount <= 0) {
    return totalAmount
  }
  return Math.max(0, totalAmount - depositAmount)
}

export const isFullyPaid = (order: Order): boolean => {
  return hasDepositPayment(order) && !hasRemainingAmount(order)
}

export const getPaymentStatus = (order: Order): 'full' | 'deposit' | 'none' => {
  // If the order already has the new paymentStatus field, map it to the old values
  if (order.paymentStatus) {
    switch (order.paymentStatus) {
      case 'success':
        return 'full';
      case 'deposit':
        return 'deposit';
      case 'unpaid':
        return 'none';
    }
  }
  
  // Legacy logic for older orders without the paymentStatus field
  if (!hasDepositPayment(order)) {
    return 'none'
  }
  
  if (hasRemainingAmount(order)) {
    return 'deposit'
  }
  
  return 'full'
}

// Utility functions for paymentStatus field
export const getPaymentStatusText = (order: Order): string => {
  // If the order has the new paymentStatus field, use it
  if (order.paymentStatus) {
    switch (order.paymentStatus) {
      case 'success':
        return 'ຊຳລະຄົບແລ້ວ';
      case 'deposit':
        return 'ຈ່າຍມັດຈຳແລ້ວ';
      case 'unpaid':
        return 'ຍັງບໍ່ຊໍາລະ';
    }
  }
  
  // Fallback to the original logic for backwards compatibility
  const status = getPaymentStatus(order);
  switch (status) {
    case 'full':
      return 'ຊຳລະຄົບແລ້ວ';
    case 'deposit':
      return 'ຈ່າຍມັດຈຳແລ້ວ';
    case 'none':
      return 'ຍັງບໍ່ຊໍາລະ';
  }
}

export const getPaymentStatusValue = (order: Order): 'success' | 'deposit' | 'unpaid' => {
  // If the order has the new paymentStatus field, use it
  if (order.paymentStatus) {
    return order.paymentStatus;
  }
  
  // Convert from old format to new format
  const status = getPaymentStatus(order);
  switch (status) {
    case 'full':
      return 'success';
    case 'deposit':
      return 'deposit';
    case 'none':
      return 'unpaid';
  }
}

// Get orders that have deposit payment information
export const getOrdersWithDeposit = async (userId: string): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(ordersQuery)
    const orders: Order[] = []
    
    querySnapshot.forEach((doc) => {
      const orderData = {
        id: doc.id,
        ...doc.data()
      } as Order
      
      // Only include orders that have deposit information
      if (hasDepositPayment(orderData)) {
        orders.push(orderData)
      }
    })
    
    return orders
  } catch (error) {
    console.error('Error getting orders with deposit:', error)
    throw new Error('Failed to get orders with deposit')
  }
}