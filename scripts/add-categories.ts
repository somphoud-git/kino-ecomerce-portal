// This script adds sample categories to Firestore
// Run this once to populate the categories collection

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your config here
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample categories
const categories = [
  {
    name: 'laptops',
    displayName: 'ລາບທັອບ',
    description: 'ຄອມພິວເຕີແບບພົກພາ',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'phones',
    displayName: 'ໂທລະສັບ',
    description: 'ໂທລະສັບມືຖື ແລະ ສະມາດໂຟນ',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'headphones',
    displayName: 'ຫູຟັງ',
    description: 'ຫູຟັງ ແລະ ອຸປະກອນສຽງ',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'speakers',
    displayName: 'ລຳໂພງ',
    description: 'ລຳໂພງ ແລະ ລະບົບສຽງ',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'accessories',
    displayName: 'ອຸປະກອນເສີມ',
    description: 'ອຸປະກອນເສີມຕ່າງໆ',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
]

async function addCategories() {
  try {
    console.log('Adding sample categories to Firestore...')
    
    for (const category of categories) {
      const docRef = await addDoc(collection(db, 'categories'), category)
      console.log(`Category "${category.displayName}" added with ID: ${docRef.id}`)
    }
    
    console.log('All categories added successfully!')
  } catch (error) {
    console.error('Error adding categories:', error)
  }
}

// Uncomment the line below to run the script
// addCategories()

export { addCategories }