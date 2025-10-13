import { ReactNode } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Generate static params for all products from Firebase
// This will pre-render all product detail pages at build time
export async function generateStaticParams() {
  try {
    // Fetch all products from Firebase
    const productsRef = collection(db, 'products')
    const querySnapshot = await getDocs(productsRef)
    
    const params = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Use Firebase document ID as the route param
    }))
    
    console.log(`Generating static pages for ${params.length} products`)
    
    // Always include a fallback 404 page
    return [...params, { id: '404' }]
    
  } catch (error) {
    console.error('Error fetching products for static generation:', error)
    // Fallback to just 404 page if Firebase fetch fails
    return [{ id: '404' }]
  }
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
