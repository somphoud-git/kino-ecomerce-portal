"use client"

interface WhatsAppNotificationProps {
  phoneNumber: string
  orderData: {
    orderId: string
    customerName: string
    customerSurname: string
    totalAmount: number
    totalItems: number
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
    date: string
    time: string
  }
}

export function sendWhatsAppNotification({ phoneNumber, orderData }: WhatsAppNotificationProps) {
  // Format phone number (remove spaces and add country code if needed)
  const formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/^0/, '856')
  
  // Create order items list
  const itemsList = orderData.items
    .map((item, index) => `${index + 1}. ${item.name} - ຈຳນວນ: ${item.quantity} x ${item.price.toLocaleString()} ກີບ`)
    .join('\n')
  
  // Create the WhatsApp message
  const message = `🛒 *ມີອໍເດີໃຫມ່ສັ່ງເຂົ້າມາ!*

📋 *ເລກທີ່ອໍເດີ:* ${orderData.orderId}
👤 *ຊື່ລູກຄ້າ:* ${orderData.customerName} ${orderData.customerSurname}
📅 *ວັນທີ:* ${orderData.date}
⏰ *ເວລາ:* ${orderData.time} ນາທີ

📦 *ລາຍການສິນຄ້າ:*
${itemsList}

💰 *ຍອດລວມທັງໝົດ:* ${orderData.totalAmount.toLocaleString()} ກີບ
📊 *ຈຳນວນສິນຄ້າທັງໝົດ:* ${orderData.totalItems} ລາຍການ

✅ ກະລຸນາກວດສອບອໍເດີນີ້ໃນລະບົບ`

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message)
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  
  // Open WhatsApp in a new window/tab
  window.open(whatsappUrl, '_blank')
}

export function useWhatsAppNotification() {
  const sendNotification = (phoneNumber: string, orderData: WhatsAppNotificationProps['orderData']) => {
    sendWhatsAppNotification({ phoneNumber, orderData })
  }

  return { sendNotification }
}
