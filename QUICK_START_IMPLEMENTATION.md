# Quick Start Guide - Implementation Phase

## 📁 What Was Built Today

### Shared Utilities Package (`packages/utils/src/`)

All foundational utilities are now ready to use across the entire codebase:

```typescript
import {
  // Constants
  PRICING,
  TRAVEL,
  CANCELLATION_POLICY,
  PUJA_TYPES,
  LANGUAGES,
  MAJOR_CITIES,
  
  // Pricing
  calculatePlatformFee,
  calculateTravelServiceFee,
  calculateGST,
  calculatePriceBreakdown,
  calculateRefundAmount,
  formatCurrency,
  
  // Booking
  generateBookingNumber,
  isValidBookingNumber,
  
  // Formatting
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  formatAddress,
  
  // Validation
  phoneSchema,
  createBookingSchema,
  searchPanditsSchema,
  // ... and many more schemas
  
} from '@hmarepanditji/utils';
```

## 🚀 Next Steps

### Immediate (Next 30 minutes):
1. Run seed script: `pnpm db:seed`
2. Verify database is populated

### Day 2 (Next 4-6 hours):
Create Travel Calculation Service:

**File:** `services/api/src/services/travel.service.ts`

```typescript
import { calculateSelfDriveCost, calculateTrainCost, calculateFlightCost } from '@hmarepanditji/utils';
import { prisma } from '../lib/prisma';

export class TravelService {
  async getDistance(fromCity: string, toCity: string) {
    // Query CityDistance table
  }
  
  async calculateOptions(fromCity, toCity, eventDays, foodArrangement) {
    // Use utils functions + distance data
    // Return all travel modes with costs
  }
}
```

### Day 3-4 (Next 8-12 hours):
Implement Authentication:
- JWT token service
- OTP service (mock mode)
- Auth middleware
- Auth endpoints

## 📋 Testing Utilities

### Example: Calculate Booking Price

```typescript
import { calculatePriceBreakdown } from '@hmarepanditji/utils';

const breakdown = calculatePriceBreakdown({
  dakshinaAmount: 21000,    // Vivah dakshina
  samagriCost: 8000,        // Premium package
  travelCost: 4800,         // Train Delhi-Varanasi
  foodAllowanceAmount: 2000, // 2 days
});

console.log(breakdown);
// {
//   dakshinaAmount: 21000,
//   platformFee: 3150,     // 15% of 21000
//   platformFeeGst: 567,   // 18% of 3150
//   travelServiceFee: 240, // 5% of 4800
//   travelServiceFeeGst: 43,
//   grandTotal: 39800,
//   panditPayout: 27800    // dakshina + travel + food
// }
```

### Example: Validate Phone Number

```typescript
import { phoneSchema } from '@hmarepanditji/utils';

const result = phoneSchema.safeParse('+919876543210');
if (result.success) {
  console.log('Valid phone:', result.data);
} else {
  console.log('Errors:', result.error);
}
```

### Example: Format Currency

```typescript
import { formatCurrency } from '@hmarepanditji/utils';

formatCurrency(21000);           // "₹21,000"
formatCurrency(150000, { compact: true }); // "₹1.50L"
```

## 🎯 Focus Areas

### This Week:
1. ✅ **Utilities** - DONE
2. **Travel Service** - Create complete service
3. **Authentication** - Full flow working
4. **Core APIs** - Pandit search, booking create

### Success Criteria:
- [ ] Can seed database
- [ ] Travel cost calculator returns accurate costs
- [ ] Can login with OTP (mock mode)
- [ ] Can search for pandits
- [ ] Can create a booking (payment pending)

## 📊 Progress Tracking

Update `IMPLEMENTATION_PROGRESS_TODAY.md` daily with:
- Files created
- Features completed
- Blockers encountered
- Next day plan

## 🐛 Common Issues & Solutions

### Issue: TypeScript errors on imports
**Solution:** Run `pnpm install` in root

### Issue: Prisma client not found
**Solution:** Run `pnpm db:generate`

### Issue: Seed fails
**Solution:** Check DATABASE_URL in .env, run `pnpm db:push` first

## 💡 Pro Tips

1. **Always use utils** - Don't hardcode pricing logic anywhere
2. **Use Zod schemas** - Validate all API inputs
3. **Use formatters** - Consistent display everywhere
4. **Test with seed data** - 10 pandits, 5 customers already created

## 📞 Quick Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to DB
pnpm db:push

# Seed database
pnpm db:seed

# Start all apps
pnpm dev

# Start specific app
pnpm dev --filter @hmarepanditji/web
```

---

**You're off to a great start! Keep the momentum going! 🚀**

