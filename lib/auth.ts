import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface CustomerProfile {
  uid: string
  name: string
  surname: string
  phoneNumber: string
  whatsapp?: string
  village: string
  district: string
  province: string
  email: string
  password?: string // Store password in customers table
  userType: 'customer' // Explicitly mark as customer
  createdAt: any // Changed to any to accommodate serverTimestamp
  updatedAt: any // Changed to any to accommodate serverTimestamp
}

export interface RegisterData {
  name: string
  surname: string
  email: string
  phoneNumber: string
  whatsapp?: string
  village: string
  district: string
  province: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

// Register new customer with email and password
export const registerWithEmailAndPassword = async (userData: RegisterData): Promise<UserCredential> => {
  try {
    // Check if email already exists by trying to create user first
    // Firebase will throw error if email exists
    
    // Check if phone number already exists in customers collection
    const phoneQuery = query(
      collection(db, 'customers'),
      where('phoneNumber', '==', userData.phoneNumber)
    )
    const phoneSnapshot = await getDocs(phoneQuery)
    
    if (!phoneSnapshot.empty) {
      throw new Error('ເລກໂທລະສັບນີ້ໄດ້ຖືກໃຊ້ແລ້ວ')
    }
    
    // Create user with email/password in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    )

    // Create customer profile in Firestore customers collection
    const customerProfile = {
      uid: userCredential.user.uid,
      name: userData.name,
      surname: userData.surname,
      phoneNumber: userData.phoneNumber,
      whatsapp: userData.whatsapp,
      village: userData.village,
      district: userData.district,
      province: userData.province,
      email: userData.email,
      password: userData.password, // Store password in customers table
      userType: 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    await setDoc(doc(db, 'customers', userCredential.user.uid), customerProfile)

    // Sign out the user immediately after registration to prevent auto-login
    await signOut(auth)

    return userCredential
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('ເກີດຂໍ້ຜິດພາດໃນການສະໝັກສະມາຊິກ')
  }
}

// Login with email and password
export const loginWithEmailAndPassword = async (loginData: LoginData): Promise<UserCredential> => {
  try {
    // Sign in with email/password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginData.email,
      loginData.password
    )

    return userCredential
  } catch (error) {
    console.error('Login error:', error)
    const authError = error as AuthError
    
    switch (authError.code) {
      case 'auth/user-not-found':
        throw new Error('ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີອີເມວນີ້')
      case 'auth/wrong-password':
        throw new Error('ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ')
      case 'auth/too-many-requests':
        throw new Error('ມີການພະຍາຍາມເຂົ້າສູ່ລະບົບຫຼາຍເກີນໄປ ກະລຸນາລອງໃໝ່ອີກຄັ້ງໃນພາຍຫຼັງ')
      default:
        throw new Error('ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ')
    }
  }
}

// Get customer profile
export const getCustomerProfile = async (uid: string): Promise<CustomerProfile | null> => {
  try {
    const customerDoc = await getDoc(doc(db, 'customers', uid))
    if (customerDoc.exists()) {
      return customerDoc.data() as CustomerProfile
    }
    return null
  } catch (error) {
    console.error('Error getting customer profile:', error)
    return null
  }
}

// Update customer profile
export const updateCustomerProfile = async (uid: string, updates: Partial<CustomerProfile>): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', uid)
    await setDoc(customerRef, {
      ...updates,
      updatedAt: new Date()
    }, { merge: true })
  } catch (error) {
    console.error('Error updating customer profile:', error)
    throw new Error('ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ')
  }
}

// Legacy function names for backward compatibility
export const getUserProfile = getCustomerProfile
export const updateUserProfile = updateCustomerProfile

// Type alias for backward compatibility
export type UserProfile = CustomerProfile

// Logout
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Logout error:', error)
    throw new Error('ເກີດຂໍ້ຜິດພາດໃນການອອກຈາກລະບົບ')
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}