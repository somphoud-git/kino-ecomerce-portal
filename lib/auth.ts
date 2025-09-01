import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  AuthError
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'
import { auth, db } from './firebase'

export interface UserProfile {
  uid: string
  name: string
  surname: string
  phoneNumber: string
  whatsapp?: string
  village: string
  district: string
  province: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface RegisterData {
  name: string
  surname: string
  phoneNumber: string
  whatsapp?: string
  village: string
  district: string
  province: string
  password: string
  confirmPassword: string
}

export interface LoginData {
  phoneNumber: string
  password: string
}

// Create a unique email for phone number authentication
const createEmailFromPhone = (phoneNumber: string): string => {
  // Remove any non-digit characters and add domain
  const cleanPhone = phoneNumber.replace(/[^\d]/g, '')
  return `${cleanPhone}@phone.kino-ecommerce.com`
}

// Register new user with phone number
export const registerWithPhoneNumber = async (userData: RegisterData): Promise<UserCredential> => {
  try {
    // Check if phone number already exists
    const phoneQuery = query(
      collection(db, 'users'),
      where('phoneNumber', '==', userData.phoneNumber)
    )
    const phoneSnapshot = await getDocs(phoneQuery)
    
    if (!phoneSnapshot.empty) {
      throw new Error('ເລກໂທລະສັບນີ້ໄດ້ຖືກໃຊ້ແລ້ວ')
    }

    // Create email from phone number for Firebase Auth
    const email = createEmailFromPhone(userData.phoneNumber)
    
    // Create user with email/password in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      userData.password
    )

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      name: userData.name,
      surname: userData.surname,
      phoneNumber: userData.phoneNumber,
      whatsapp: userData.whatsapp,
      village: userData.village,
      district: userData.district,
      province: userData.province,
      email: email,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile)

    return userCredential
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('ເກີດຂໍ້ຜິດພາດໃນການສະໝັກສະມາຊິກ')
  }
}

// Login with phone number and password
export const loginWithPhoneNumber = async (loginData: LoginData): Promise<UserCredential> => {
  try {
    // Create email from phone number
    const email = createEmailFromPhone(loginData.phoneNumber)
    
    // Sign in with email/password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      loginData.password
    )

    return userCredential
  } catch (error) {
    console.error('Login error:', error)
    const authError = error as AuthError
    
    switch (authError.code) {
      case 'auth/user-not-found':
        throw new Error('ບໍ່ພົບຜູ້ໃຊ້ທີ່ມີເລກໂທລະສັບນີ້')
      case 'auth/wrong-password':
        throw new Error('ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ')
      case 'auth/too-many-requests':
        throw new Error('ມີການພະຍາຍາມເຂົ້າສູ່ລະບົບຫຼາຍເກີນໄປ ກະລຸນາລອງໃໝ່ອີກຄັ້ງໃນພາຍຫຼັງ')
      default:
        throw new Error('ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ')
    }
  }
}

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    }, { merge: true })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ')
  }
}

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