/**
 * Migration Script for Products Data to Firebase
 * 
 * This script helps migrate the existing mock data to Firebase Firestore.
 * Run this script once to populate your Firebase products collection.
 * 
 * Usage:
 * 1. Ensure Firebase is properly configured
 * 2. Run: node scripts/migrate-products.js
 * 3. Or call migrateProductsToFirebase() from your admin panel
 */

import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Laptop } from '../lib/types'

// Your existing mock data
const mockProducts: Omit<Laptop, 'id'>[] = [
  {
    name: "ZenBook Pro 14 Duo OLED UX8402, 11th Gen Intel",
    price: 1854,
    originalPrice: 2479,
    image: "/asus-zenbook-pro.png",
    rating: 4.5,
    sold: 100,
    brand: "ASUS",
    processor: "Intel i7",
    ram: "16GB",
    storage: "512GB SSD",
    screen: "14 inch",
    inStock: true,
    freeShipping: true,
    category: "Gaming",
    description: "Powerful dual-screen laptop with OLED display for creative professionals",
    features: ["Dual OLED Display", "Intel i7 11th Gen", "NVIDIA RTX Graphics", "Thunderbolt 4"],
  },
  {
    name: "VivoBook S 16X OLED M5602, AMD Ryzen 5000H",
    price: 1439,
    originalPrice: 1879,
    image: "/asus-vivobook-laptop.png",
    rating: 4.3,
    sold: 89,
    brand: "ASUS",
    processor: "AMD Ryzen 5",
    ram: "8GB",
    storage: "256GB SSD",
    screen: "16 inch",
    inStock: true,
    freeShipping: true,
    category: "Business",
    description: "Sleek and powerful laptop with stunning OLED display",
    features: ["16-inch OLED Display", "AMD Ryzen 5000H", "Fast SSD Storage", "All-day Battery"],
  },
  {
    name: "VivoBook 13 Slate OLED T3300, 11th Gen Intel",
    price: 575,
    originalPrice: 799,
    image: "/asus-vivobook-slate.png",
    rating: 4.2,
    sold: 156,
    brand: "ASUS",
    processor: "Intel i5",
    ram: "8GB",
    storage: "128GB SSD",
    screen: "13 inch",
    inStock: false,
    freeShipping: false,
    category: "Ultrabook",
    description: "Versatile 2-in-1 tablet laptop with detachable keyboard",
    features: ["Detachable Design", "OLED Touchscreen", "Lightweight", "Windows 11"],
  },
  {
    name: "ZenBook Pro 16X OLED UX7602, 11th Gen Intel",
    price: 2237,
    originalPrice: 2849,
    image: "/asus-zenbook-pro-16x.png",
    rating: 4.6,
    sold: 67,
    brand: "ASUS",
    processor: "Intel i9",
    ram: "32GB",
    storage: "1TB SSD",
    screen: "16 inch",
    inStock: true,
    freeShipping: true,
    category: "Professional",
    description: "Ultimate creative workstation with massive OLED display",
    features: ["16-inch 4K OLED", "Intel i9 Processor", "32GB RAM", "Professional Graphics"],
  },
  {
    name: "ROG Strix Scar 15 G533QS, AMD Ryzen 9",
    price: 5081,
    originalPrice: null,
    image: "/asus-rog-strix-laptop.png",
    rating: 4.7,
    sold: 34,
    brand: "ASUS",
    processor: "AMD Ryzen 9",
    ram: "32GB",
    storage: "2TB SSD",
    screen: "15 inch",
    inStock: true,
    freeShipping: true,
    category: "Gaming",
    description: "High-performance gaming laptop with RGB lighting",
    features: ["AMD Ryzen 9", "RTX 3080", "300Hz Display", "RGB Keyboard"],
  },
  {
    name: "VivoBook Go 14 E410 (TP1400, 11th Gen Intel)",
    price: 409,
    originalPrice: null,
    image: "/asus-vivobook-go.png",
    rating: 4.1,
    sold: 203,
    brand: "ASUS",
    processor: "Intel i3",
    ram: "4GB",
    storage: "128GB eMMC",
    screen: "14 inch",
    inStock: true,
    freeShipping: false,
    category: "Budget",
    description: "Affordable laptop for everyday computing needs",
    features: ["Lightweight Design", "All-day Battery", "Windows 11", "Affordable Price"],
  },
  {
    name: "ZenBook 14 Flip OLED UP3404, 11th Gen Intel",
    price: 1450,
    originalPrice: null,
    image: "/asus-zenbook-flip.png",
    rating: 4.4,
    sold: 78,
    brand: "ASUS",
    processor: "Intel i7",
    ram: "16GB",
    storage: "512GB SSD",
    screen: "14 inch",
    inStock: true,
    freeShipping: true,
    category: "2-in-1",
    description: "Convertible laptop with 360-degree hinge and OLED display",
    features: ["360° Flip Design", "OLED Touchscreen", "Intel i7", "Stylus Support"],
  },
  {
    name: "ProArt StudioBook 16 OLED H7600, 11th Gen Intel",
    price: 2890,
    originalPrice: null,
    image: "/asus-proart-studiobook.png",
    rating: 4.8,
    sold: 23,
    brand: "ASUS",
    processor: "Intel i9",
    ram: "32GB",
    storage: "1TB SSD",
    screen: "16 inch",
    inStock: true,
    freeShipping: true,
    category: "Professional",
    description: "Professional workstation for content creators and designers",
    features: ["Pantone Validated Display", "Intel i9", "Quadro Graphics", "Creator Software"],
  },
]

/**
 * Migrate products to Firebase Firestore
 */
export async function migrateProductsToFirebase(): Promise<void> {
  try {
    console.log('Starting product migration to Firebase...')
    
    // Check if products already exist
    const existingProducts = await getDocs(collection(db, 'products'))
    if (!existingProducts.empty) {
      console.log(`Found ${existingProducts.size} existing products. Skipping migration.`)
      console.log('Delete existing products first if you want to re-migrate.')
      return
    }

    const batch = []
    
    for (let i = 0; i < mockProducts.length; i++) {
      const product = mockProducts[i]
      const productId = (i + 1).toString() // Use sequential IDs
      
      const productWithMetadata = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
      
      // Add to Firestore
      const docRef = doc(db, 'products', productId)
      batch.push(setDoc(docRef, productWithMetadata))
      
      console.log(`Preparing product ${productId}: ${product.name}`)
    }
    
    // Execute all writes
    await Promise.all(batch)
    
    console.log(`✅ Successfully migrated ${mockProducts.length} products to Firebase!`)
    console.log('Products are now available in the Firestore "products" collection.')
    
  } catch (error) {
    console.error('❌ Error migrating products:', error)
    throw error
  }
}

/**
 * Delete all products (for testing/re-migration)
 */
export async function clearAllProducts(): Promise<void> {
  try {
    console.log('🗑️  Clearing all products...')
    
    const snapshot = await getDocs(collection(db, 'products'))
    const deletePromises = snapshot.docs.map(doc => doc.ref.delete())
    
    await Promise.all(deletePromises)
    
    console.log(`✅ Deleted ${snapshot.size} products from Firebase`)
  } catch (error) {
    console.error('❌ Error clearing products:', error)
    throw error
  }
}

/**
 * Sample Firebase document structure for reference:
 * 
 * Collection: products
 * Document ID: 1, 2, 3, etc.
 * Document Structure:
 * {
 *   name: "Product name",
 *   price: 1000,
 *   originalPrice: 1200, // optional
 *   image: "/path/to/image.png",
 *   rating: 4.5,
 *   sold: 100,
 *   brand: "Brand Name",
 *   processor: "Intel i7",
 *   ram: "16GB",
 *   storage: "512GB SSD",
 *   screen: "14 inch",
 *   inStock: true,
 *   freeShipping: true,
 *   category: "Gaming",
 *   description: "Product description",
 *   features: ["Feature 1", "Feature 2"],
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp,
 *   isActive: true
 * }
 */

// For development/testing - uncomment to run migration
// migrateProductsToFirebase().catch(console.error)