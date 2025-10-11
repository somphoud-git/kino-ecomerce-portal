// S3 Upload utility for receipt images
// Note: This assumes AWS SDK is installed. If not, install with: npm install @aws-sdk/client-s3

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
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
}

export const uploadReceiptToS3 = async (file: File, orderId: string): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `receipts/${orderId}_${timestamp}.${fileExtension}`

    // For client-side upload, we'll use a presigned URL approach or FormData
    // Since we don't have AWS SDK setup, let's create a simple upload function
    // that sends the file to an API endpoint that handles S3 upload

    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', fileName)
    formData.append('orderId', orderId)

    const response = await fetch('/api/upload-receipt', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.url

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