# Deposit Payment Handling Functions

This document describes the utility functions added to handle deposit payments (ເງິນມັດຈຳ) and remaining amounts (ຈຳນວນເງິນເຫຼືອທີ່ຕ້ອງຊຳລະ) in the order system.

## Utility Functions in `lib/orders.ts`

### 1. `hasDepositPayment(order: Order): boolean`
Checks if an order has deposit payment information.
- Returns `true` if `order.depositAmount` exists and is greater than 0
- Returns `false` otherwise

```typescript
// Example usage
if (hasDepositPayment(order)) {
  console.log('This order has deposit payment')
}
```

### 2. `hasRemainingAmount(order: Order): boolean`
Checks if an order has remaining amount to be paid.
- Returns `true` if `order.remainingAmount` exists and is greater than 0
- Returns `false` otherwise

```typescript
// Example usage
if (hasRemainingAmount(order)) {
  console.log('This order still has remaining amount to pay')
}
```

### 3. `calculateRemainingAmount(totalAmount: number, depositAmount?: number): number`
Calculates the remaining amount based on total and deposit amounts.
- Returns the difference between total and deposit amounts
- Returns total amount if no deposit is provided
- Ensures the result is never negative

```typescript
// Example usage
const remaining = calculateRemainingAmount(1000000, 300000) // Returns 700000
```

### 4. `isFullyPaid(order: Order): boolean`
Checks if an order is fully paid (has deposit but no remaining amount).

```typescript
// Example usage
if (isFullyPaid(order)) {
  console.log('Order is fully paid')
}
```

### 5. `getPaymentStatus(order: Order): 'full' | 'deposit' | 'none'`
Gets the payment status of an order.
- `'full'`: Has deposit and no remaining amount
- `'deposit'`: Has deposit but still has remaining amount
- `'none'`: No deposit payment

```typescript
// Example usage
const status = getPaymentStatus(order)
switch (status) {
  case 'full': console.log('Fully paid'); break
  case 'deposit': console.log('Partially paid'); break
  case 'none': console.log('Not paid'); break
}
```

### 6. `getOrdersWithDeposit(userId: string): Promise<Order[]>`
Retrieves only orders that have deposit payment information for a specific user.

```typescript
// Example usage
const depositOrders = await getOrdersWithDeposit(user.uid)
console.log(`User has ${depositOrders.length} orders with deposits`)
```

## UI Implementation

### Order Success Page (`app/order-success/page.tsx`)
- Uses `renderPaymentBreakdown()` function to display deposit and remaining amounts
- Only shows deposit information when `hasDepositPayment(order)` returns true
- Displays both deposit amount (ເງິນມັດຈຳແລ້ວ) and remaining amount (ຈຳນວນເງິນເຫຼືອທີ່ຕ້ອງຊຳລະ) with proper styling

### Orders List Page (`app/orders/page.tsx`)
- Added filter buttons to show:
  - All orders
  - Orders with deposits only
  - Orders with remaining amounts only
- Enhanced order cards to show deposit payment information
- Payment status indicators with color coding

## Database Schema
The Order interface includes these optional fields:
```typescript
interface Order {
  // ... other fields
  depositAmount?: number      // Amount paid as deposit
  remainingAmount?: number    // Amount remaining to be paid
  // ... other fields
}
```

## Visual Features
- **Blue theme** for deposit amounts (ເງິນມັດຈຳແລ້ວ)
- **Yellow theme** for remaining amounts (ຈຳນວນເງິນເຫຼືອທີ່ຕ້ອງຊຳລະ)
- **Orange theme** for total amounts
- Color-coded payment status indicators
- Conditional rendering based on data availability

## Usage Examples

### Displaying deposit information only when it exists:
```tsx
{hasDepositPayment(order) && (
  <div>
    <p>Deposit: ₭{order.depositAmount!.toLocaleString()}</p>
    {hasRemainingAmount(order) && (
      <p>Remaining: ₭{order.remainingAmount!.toLocaleString()}</p>
    )}
  </div>
)}
```

### Filtering orders by payment type:
```tsx
const depositOrders = orders.filter(order => hasDepositPayment(order))
const remainingOrders = orders.filter(order => hasRemainingAmount(order))
```

These functions ensure that deposit and remaining amount information is only displayed when the relevant fields exist in the order data, providing a clean and consistent user experience.