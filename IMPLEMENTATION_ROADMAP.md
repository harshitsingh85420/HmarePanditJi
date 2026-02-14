# Phase 1 Implementation Roadmap
**Started:** 2026-02-14  
**Target:** 4-6 weeks to 95% completion

---

## 🚀 Week 1: Foundation & Core APIs (Days 1-7)

### ✅ Day 1: Database & Utilities (DONE)
- [x] Seed script exists
- [ ] Run seed: `pnpm db:seed`
- [ ] Create shared utilities

### Day 2: Shared Utilities & Constants
**Files to create:**
1. `packages/utils/src/pricing.ts` - All pricing calculations
2.  `packages/utils/src/constants.ts` - Platform constants
3. `packages/utils/src/validation.ts` - Zod schemas
4. `packages/utils/src/formatting.ts` - Formatters
5. `packages/utils/src/bookingNumber.ts` - Booking number generator

### Days 3-4: Authentication System
**Files to create:**
1. `services/api/src/services/auth.service.ts` - OTP & JWT logic
2. `services/api/src/middleware/auth.ts` - Auth middleware
3. `services/api/src/controllers/auth.controller.ts` - Auth endpoints
4. `services/api/src/routes/auth.routes.ts` - Auth routes
5. Frontend: Auth context & login UI integration

### Days 5-6: Travel Calculation Service
**Files to create:**
1. `services/api/src/services/travel.service.ts` - All travel calculations
2. `services/api/src/controllers/travel.controller.ts` - Travel endpoints
3. `services/api/src/routes/travel.routes.ts` - Travel routes

### Day 7: Core Customer APIs
**Files to implement:**
1. `services/api/src/controllers/pandit.controller.ts` - Search, profile, availability
2. `services/api/src/controllers/customer.controller.ts` - Favorites, addresses
3. `services/api/src/controllers/muhurat.controller.ts` - Muhurat dates
4. `services/api/src/routes/*` - Hook up all routes

---

## 🚀 Week 2: Bookings & Payments (Days 8-14)

### Days 8-9: Booking System
**Implement:**
1. Booking creation with full price calculation
2. Booking status management
3. Pandit accept/reject endpoints
4. Status update endpoints with geolocation

### Days 10-11: Payment Integration
**Implement:**
1. Razorpay SDK setup
2. Order creation endpoint
3. Payment verification
4. Webhook handling
5. Refund API

### Days 12-13: Notification System
**Implement:**
1. Twilio integration (mock mode)
2. All notification templates
3. Trigger points in booking flow
4. Email service (optional)

### Day 14: Frontend Integration Phase 1
**Connect:**
1. Homepage to search API
2. Search page to pandit API
3. Pandit profile to real data
4. Login flow to auth API

---

## 🚀 Week 3: Pandit & Admin Features (Days 15-21)

### Days 15-16: Pandit APIs
**Implement:**
1. Onboarding endpoints (profile, services, samagri, documents)
2. Calendar & blocked dates
3. Earnings endpoints
4. File upload for documents

### Days 17-18: Admin APIs
**Implement:**
1. Travel queue endpoints (CRITICAL)
2. Verification queue
3. Payout queue
4. Cancellation/refund processing

### Days 19-20: Voice Features
**Implement:**
1. SpeechRecognition integration
2. Text-to-Speech forpandit dashboard
3. Voice input handlers

### Day 21: Frontend Integration Phase 2
**Connect:**
1. Booking wizard to booking API
2. Payment flow to Razorpay
3. Pandit dashboard to pandit APIs
4. Admin panel to admin APIs

---

## 🚀 Week 4: Polish & Testing (Days 22-28)

### Days 22-23: Complete Shared Components
**Build:**
1. PanditCard (composite)
2. PriceBreakdown (itemized)
3. StatusTimeline (vertical)
4. Toast system
5. EmptyState
6. Advanced DatePicker

### Days 24-25: Error Handling & Validation
**Add:**
1. Zod validation on all endpoints
2. Comprehensive error messages
3. Loading states in all UIs
4. Error boundaries

### Days 26-27: End-to-End Testing
**Test:**
1. Complete customer booking flow
2. Complete pandit onboarding flow
3. Complete admin travel ops flow
4. Payment flow (Razorpay test mode)

### Day 28: Documentation & Cleanup
**Finalize:**
1. API documentation
2. README updates
3. Environment variables guide
4. Deployment checklist

---

## 📊 Success Metrics

**By Week 4 End:**
- [ ] 100% of critical APIs implemented
- [ ] Auth working across all 3 apps
- [ ] Customer can complete full booking
- [ ] Pandit can accept & update booking
- [ ] Admin can process travel
- [ ] Payment integration working
- [ ] Notifications sending (console logs OK)
- [ ] No critical bugs

---

## 🔥 STARTING NOW

**Current Task:** Day 2 - Shared Utilities

**Next 3 Actions:**
1. Create pricing utilities
2. Create constants file  
3. Create validation schemas

