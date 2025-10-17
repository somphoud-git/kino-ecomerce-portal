// Firebase Storage utility for receipt image uploads
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Upload receipt image to Firebase Storage
 * @param file - The image file to upload
 * @param orderId - The order ID to create a unique filename
 * @returns Promise<string> - The download URL of the uploaded file
 */
export const uploadReceiptToFirebase = async (file: File, orderId: string): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file type (only images)
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validImageTypes.includes(file.type)) {
      throw new Error('ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ (JPEG, PNG, GIF, WebP)')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('ຂະໜາດໄຟລ໌ໃຫຍ່ເກີນໄປ (ສູງສຸດ 5MB)')
    }

    // Create a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${orderId}_${timestamp}.${fileExtension}`
    const filePath = `receipts/${fileName}`

    console.log('Uploading receipt to Firebase Storage:', {
      path: filePath,
      size: file.size,
      type: file.type
    })

    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, filePath)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        orderId: orderId,
        uploadedAt: new Date().toISOString()
      }
    })

    console.log('Receipt uploaded successfully:', snapshot)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('Receipt download URL:', downloadURL)

    return downloadURL

  } catch (error) {
    console.error('Error uploading receipt to Firebase Storage:', error)
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      throw new Error(`ບໍ່ສາມາດອັບໂຫຼດໃບບິນໄດ້: ${error.message}`)
    }
    throw new Error('ບໍ່ສາມາດອັບໂຫຼດໃບບິນໄດ້')
  }
}

/**
 * Delete receipt from Firebase Storage (optional - for cleanup)
 * @param receiptUrl - The download URL or path of the receipt to delete
 */
export const deleteReceiptFromFirebase = async (receiptUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const url = new URL(receiptUrl)
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/)
    
    if (!pathMatch) {
      throw new Error('Invalid receipt URL')
    }
    
    const filePath = decodeURIComponent(pathMatch[1])
    const storageRef = ref(storage, filePath)
    
    // Note: deleteObject requires Firebase Storage rules to allow deletion
    // For now, we'll just log it
    console.log('Would delete receipt:', filePath)
    
    // Uncomment when you want to enable deletion:
    // await deleteObject(storageRef)
    
  } catch (error) {
    console.error('Error deleting receipt:', error)
    throw error
  }
}
