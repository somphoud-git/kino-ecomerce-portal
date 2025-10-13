// S3 Upload utility for receipt images - Client-side implementation
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

interface UploadConfig {
  bucketName: string
  region: string
  accessKeyId?: string
  secretAccessKey?: string
}

// Configuration - these should be in environment variables
const S3_CONFIG: UploadConfig = {
  bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'kino-ecommerce-image',
  region: process.env.NEXT_PUBLIC_S3_REGION || 'ap-southeast-2',
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
}

// Client-side direct S3 upload using AWS SDK
export const uploadReceiptToS3 = async (file: File, orderId: string): Promise<string> => {
  try {
    // Validate AWS credentials
    if (!S3_CONFIG.accessKeyId || !S3_CONFIG.secretAccessKey) {
      console.warn('AWS credentials not configured. Receipt will not be uploaded.')
      throw new Error('AWS credentials not configured')
    }

    // Create a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `receipts/${orderId}_${timestamp}.${fileExtension}`

    console.log('Uploading to S3:', {
      bucket: S3_CONFIG.bucketName,
      region: S3_CONFIG.region,
      fileName: fileName
    })

    // Initialize S3 client
    const s3Client = new S3Client({
      region: S3_CONFIG.region,
      credentials: {
        accessKeyId: S3_CONFIG.accessKeyId,
        secretAccessKey: S3_CONFIG.secretAccessKey
      }
    })

    // Convert File to Buffer for upload
    const fileBuffer = await file.arrayBuffer()

    // Upload to S3 (without ACL - use bucket policy for public access instead)
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: fileName,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
      // Removed ACL parameter - use bucket policy for public access
    })

    const response = await s3Client.send(command)
    console.log('S3 upload response:', response)

    // Generate public URL
    const fileUrl = `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${fileName}`
    console.log('Receipt uploaded successfully to S3:', fileUrl)

    return fileUrl

  } catch (error) {
    console.error('Error uploading receipt to S3:', error)
    throw error
  }
}

// Alternative: Direct browser upload using presigned URL
export const uploadReceiptDirectToS3 = async (file: File, orderId: string): Promise<string> => {
  try {
    // Step 1: Get presigned URL from your backend
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `receipts/${orderId}_${timestamp}.${fileExtension}`

    const presignedResponse = await fetch('/api/get-presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: fileName,
        fileType: file.type
      })
    })

    if (!presignedResponse.ok) {
      throw new Error('Failed to get presigned URL')
    }

    const { presignedUrl, fileUrl } = await presignedResponse.json()

    // Step 2: Upload file directly to S3 using presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3')
    }

    return fileUrl

  } catch (error) {
    console.error('Error uploading receipt directly to S3:', error)
    throw error
  }
}

// Fallback: Use the existing image URL pattern
export const generateS3ReceiptUrl = (orderId: string, fileName: string): string => {
  const timestamp = Date.now()
  const fileExtension = fileName.split('.').pop()
  const s3FileName = `receipts/${orderId}_${timestamp}.${fileExtension}`
  
  return `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/uploads/${s3FileName}`
}