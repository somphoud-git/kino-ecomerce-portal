import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    console.log('Upload receipt request received:', { 
      fileSize: file?.size, 
      fileName: file?.name, 
      orderId,
      hasAWSKeyId: !!process.env.AWS_ACCESS_KEY_ID,
      hasAWSSecret: !!process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION || 'ap-southeast-2',
      s3Bucket: process.env.S3_BUCKET || 'kino-ecommerce-image'
    })

    if (!file || !orderId) {
      return NextResponse.json({ error: 'File and orderId are required' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename - save in products folder with receipt prefix
    // Note: Using /products/ folder instead of /receipts/ since /receipts/ folder doesn't exist in bucket
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `products/receipt_${orderId}_${timestamp}.${fileExtension}`

    // Check if AWS credentials are available
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('AWS credentials not found, using mock URL')
      // Generate the S3 URL (mock for now)
      const s3Bucket = process.env.S3_BUCKET || 'kino-ecommerce-image'
      const awsRegion = process.env.AWS_REGION || 'ap-southeast-2'
      const s3Url = `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/uploads/${fileName}`
      
      return NextResponse.json({ 
        success: true, 
        url: s3Url,
        fileName: fileName,
        mock: true
      })
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'kino-ecommerce-image',
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: file.type
    })

    await s3Client.send(uploadCommand)

    // Generate the S3 URL
    const s3Bucket = process.env.S3_BUCKET || 'kino-ecommerce-image'
    const awsRegion = process.env.AWS_REGION || 'ap-southeast-2'
    const s3Url = `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/uploads/${fileName}`

    console.log(`Receipt uploaded successfully for order ${orderId}: ${fileName}`)

    return NextResponse.json({ 
      success: true, 
      url: s3Url,
      fileName: fileName
    })

  } catch (error) {
    console.error('Error uploading receipt:', error)
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Detailed error:', { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}