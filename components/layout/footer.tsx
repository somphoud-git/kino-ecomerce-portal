"use client"

import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCategories } from "@/hooks/use-categories"

export function Footer() {
  const { categories, loading } = useCategories()
  
  // Get only first 6 categories
  const displayCategories = categories.slice(0, 6)

  return (
    <footer className="bg-gray-900 text-white" style={{ fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold">ຮ້ານ NoRacing</span>
            </div>
            <p className="text-gray-400 text-sm ">
              ພວກເຮົາມີຄວາມຊ່ຽວຊານໃນການຂາຍແລະຕົກແຕ່ງອາໄຫຼ່ລົດຈັກ, ຕອບສະໜອງຄວາມຕ້ອງການຂອງລູກຄ້າທີ່ມັກການແຕ່ງລົດ. ພວກເຮົາຮັບສັ່ງອາໄຫຼ່ລົດຈັກທຸກປະເພດ, ທັງເຄື່ອງຈັກແລະອຸປະກອນເສີມ. ສໍາລັບຜູ້ທີ່ຊອກຫາອາໄຫຼ່ແທ້, ພວກເຮົາສາມາດເບີກສູນໄດ້ໂດຍກົງຈາກ Honda ແລະ Yamaha ເພື່ອຮັບປະກັນຄຸນນະພາບ. ນອກຈາກນີ້, ພວກເຮົາຍັງມີເຄື່ອງຕົກແຕ່ງສວຍງາມຫຼາກຫຼາຍຊະນິດ ເພື່ອໃຫ້ລົດຈັກຂອງທ່ານມີສະຕາຍເປັນເອກະລັກສະເພາະຕົວ.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/1BNng47ksV/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Facebook className="w-4 h-4" />
                </Button>
              </a>
              <a 
                href="https://www.tiktok.com/@no_racing1?_t=ZS-8zugSBEpjd2&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-4.59v16.38a2.92 2.92 0 01-5.83 0 2.92 2.92 0 012.92-2.92V11.69a6.7 6.7 0 000 13.39A6.7 6.7 0 0015 18.38V9.85a8.48 8.48 0 004.59 1.33V6.69z"/>
                  </svg>
                </Button>
              </a>
              <a 
                href="https://wa.me/8562096364948" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
              >
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Phone className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>

        {/* Categories */}
        <div className="space-y-4 text-left sm:text-center"> {/* <-- Parent sets default to 'text-left' */}
            <h3 className="text-lg font-semibold">ປະເພດສິນຄ້າ</h3> {/* <-- Removed text-center here */}
            <ul className="space-y-2 text-sm"> 
                {loading ? (
                    // Loading state
                    Array.from({ length: 6 }).map((_, index) => (
                        <li key={index}>
                            <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                        </li>
                    ))
                ) : displayCategories.length > 0 ? (
                    // Display categories from database
                    displayCategories.map((category) => (
                        <li key={category.id}>
                            <a 
                              href={`/products?category=${encodeURIComponent(category.name)}`} 
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                                {category.displayName}
                            </a>
                        </li>
                    ))
                ) : (
                    // No data message
                    <li className="text-gray-400">
                        ບໍ່ມີປະເພດສິນຄ້າ
                    </li>
                )}
            </ul>
        </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ຕິດຕໍ່ຫາຮ້ານຂອງພວກເຮົາ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <a 
                  href="https://wa.me/8562096364948" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>020 96364948</span>
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>ຮ້ານຢູ່ບ້ານຫົວຂົວ, ເມືອງນາຊາຍທອງ, ນະຄອນຫຼວງວຽງຈັນ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
