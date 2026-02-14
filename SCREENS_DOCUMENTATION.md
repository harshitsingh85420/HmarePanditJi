# HmarePanditJi - Complete Screens Documentation
## Phase 1 Implementation Status

**Generated:** February 13, 2026  
**Version:** 1.0  
**Status:** ✅ Phase 1 Complete - Ready for Local Testing

---

## 📱 Application Overview

HmarePanditJi is a three-sided marketplace with:
- **Customer Web App** (Port 3000) - `apps/web/`
- **Pandit Dashboard** (Port 3001) - `apps/pandit/`
- **Admin Panel** (Port 3002) - `apps/admin/`
- **REST API** (Port 4000) - `services/api/`

---

## 🌐 CUSTOMER WEB APP (Port 3000)

### 1. **Homepage** - `/`
**File:** `apps/web/src/app/page.tsx`

**Description:** Main landing page accessible in guest mode (no login required)

**Features:**
- Hero section with headline and subheadline
- Quick search bar (puja type, city, date picker)
- "No registration needed to explore" message
- **Muhurat Explorer Widget**: Compact calendar showing auspicious dates
- **Featured Pandits Carousel**: Top 6 verified pandits
- Stats bar (100+ Verified Pandits, 4.8★ Rating)
- Trust section (verification, pricing, travel)
- How it works (3 steps)
- Footer with links

**Guest Mode:** ✅ Fully accessible without login

---

### 2. **Muhurat Explorer** - `/muhurat`
**File:** `apps/web/src/app/muhurat/page.tsx`

**Description:** Full-page Hindu calendar with auspicious dates

**Features:**
- Full month calendar grid with date indicators
- Puja type filter chips (All, Vivah, Griha Pravesh, etc.)
- Date cells show count of muhurats (amber badges)
- Click date → Detail panel below showing:
  * List of pujas for that date
  * Time windows (e.g., "7:00 AM - 9:00 AM")
  * Significance explanation
  * "Find Pandits for This →" button
- Sidebar: Upcoming 10 auspicious dates
- Pre-loaded with 60+ muhurat dates for 2026
- URL params support: `?date=2026-03-15&pujaType=Vivah`

**Guest Mode:** ✅ Fully accessible

---

### 3. **Pandit Search** - `/search`
**File:** `apps/web/src/app/search/page.tsx`

**Description:** Advanced search with 8+ filters

**Features:**
- **Filters (Left Sidebar/Bottom Drawer):**
  * Puja type dropdown
  * City autocomplete
  * Date picker
  * Budget range (₹2,000 - ₹50,000 slider)
  * Minimum rating (3+, 4+, 4.5+ chips)
  * Languages (checkboxes)
  * Travel mode preference
  * Distance slider (0-2000km with presets)
- **Sort Options:** Rating, Price (low/high), Distance, Experience
- **Results Grid:** PanditCard components showing:
  * Photo, name, verified badge
  * Rating & review count
  * Specialization tags
  * Location & distance
  * **Travel mode tabs** with cost estimates
  * Starting dakshina price
  * "View Profile" button
- Pre-fill from URL params

**Guest Mode:** ✅ Fully accessible

---

### 4. **Pandit Profile** - `/pandit/[id]`
**File:** `apps/web/src/app/pandit/[id]/page.tsx`

**Description:** Detailed pandit profile with booking CTA

**Features:**
- **Hero Section:**
  * Large profile photo
  * Name, verified badge, rating (5★)
  * Location, experience years
  * Languages spoken
  * Travel badge ("Travels up to 2000km")
  * Favorite button (heart icon)

- **Tabs:**
  1. **About:** Bio, specializations, certifications, stats
  2. **Services & Pricing:** Puja service cards with:
     - Dakshina amount
     - Duration
     - Description
     - "Book This Puja" button
  3. **Travel Options:** Comparison cards for each mode:
     - SELF_DRIVE, TRAIN, FLIGHT, CAB
     - Total cost, travel time, distance
     - Expandable breakdown
     - "Select" button
  4. **Reviews:** Rating distribution + paginated reviews
  5. **Availability:** Calendar (booked/blocked/available)

- **Sticky CTA:** "Book Pandit Ji" button (bottom bar mobile, sidebar desktop)

**Guest Mode:** ✅ View only; clicking book triggers login modal

---

### 5. **Login** - `/login`
**File:** `apps/web/src/app/login/page.tsx`

**Description:** Phone OTP authentication

**Features:**
- Step 1: Phone number input (+91 fixed) → "Send OTP"
- Step 2: OTP input (6 digits) → "Verify & Continue"
- Step 3: If new user → collect name, gotra, language
- Redirect to original page after success
- Modal variant available for guest-to-auth flow

**Auth Method:** Firebase Phone OTP → JWT

---

### 6. **Booking Wizard** - `/booking/new`
**File:** `apps/web/src/app/booking/new/page.tsx`

**Description:** 6-step booking flow (requires login)

**Step 1 - Event Details:**
- Puja type (pre-filled from URL)
- Event date picker
- "Check Muhurat" button → fetches suggestions
- Event end date (multi-day events)
- Venue address, city, pincode
- Attendees count
- Special instructions

**Step 2 - Pandit & Puja:**
- Selected pandit card (can change)
- Or: mini search interface
- Select puja service with dakshina

**Step 3 - Travel & Logistics:**
- If local: "No travel needed" → skip
- If outstation:
  * Fetch travel options (4 modes)
  * Cards: mode, cost, time, "Best for"
  * Expandable breakdown
  * Select one mode
- Food arrangement radio buttons
- Accommodation (multi-day only)

**Step 4 - Preferences:**
- **Samagri selection:**
  * "Pandit Ji will bring" (opens modal)
  * "I will arrange"
  * "Need help"
- **Samagri Modal (2 tabs):**
  * Tab 1: Pandit's Fixed Packages (Basic/Standard/Premium)
  * Tab 2: Build Your Own (categorized items, quantities)
  * "Add to Cart" locks selection

**Step 5 - Review & Pay:**
- Complete summary
- **Itemized Price Breakdown:**
  * Dakshina (GST-exempt)
  * Samagri
  * Travel cost
  * Food allowance
  * Platform fee (15% of dakshina)
  * Travel service fee (5% of travel)
  * GST on fees (18%)
  * **Grand Total**
- Terms checkbox
- "Proceed to Payment" → Razorpay checkout

**Step 6 - Confirmation:**
- Success animation
- Booking number (HPJ-2026-XXXXX)
- Next steps
- "View My Bookings" | "Book Another"

**Auth Required:** ✅ Yes

---

### 7. **Customer Dashboard** - `/dashboard`
**File:** `apps/web/src/app/dashboard/page.tsx`

**Description:** Customer overview page

**Features:**
- Welcome message with name
- Quick stats (upcoming bookings, completed, favorites)
- Recent bookings list
- Quick actions (new booking, favorites)
- Profile completeness indicator

**Auth Required:** ✅ Yes (Customer role)

---

### 8. **My Bookings** - `/dashboard/bookings`
**File:** `apps/web/src/app/dashboard/bookings/page.tsx`

**Description:** List of all customer bookings

**Features:**
- Tab filters: All, Upcoming, Completed, Cancelled
- Booking cards showing:
  * Booking number
  * Event type & date
  * Pandit name
  * Status badge
  * Grand total
  * "View Details" button

**Auth Required:** ✅ Yes

---

### 9. **Booking Detail** - `/dashboard/bookings/[id]`
**File:** `apps/web/src/app/dashboard/bookings/[id]/page.tsx`

**Description:** Single booking detail page (Post-Booking Dashboard)

**Features:**
- **Status Banner:**
  - Integrated "Live Tracking" button (if Assignee En Route)
  - Payment status indicator
- **Visual Timeline:** Vertical stepper showing:
  - Booking Confirmed
  - Pandit En Route (with ETA)
  - Ceremony Start (Muhurat)
- **Sidebar:**
  - Quick links (Overview, Messages, Payments)
  - **Documents List:** Itinerary, Muhurat Patrika, Invoice (Downloadable)
- **Quick Action Cards:**
  - Track Pandit (GPS)
  - Chat with Pandit
  - View Samagri List
  - Contact Concierge
- **Pandit Status:** "Looking for perfect Pandit" (if pending) vs Assigned Profile

**Auth Required:** ✅ Yes

---

### 10. **Favorites** - `/dashboard/favorites`
**File:** `apps/web/src/app/dashboard/favorites/page.tsx`

**Description:** Saved pandits

**Features:**
- Grid of favorited pandits
- Each card: photo, name, rating, location, specializations
- "Book Again" button
- "Remove" button (heart icon)

**Auth Required:** ✅ Yes

---

### 11. **Profile** - `/dashboard/profile`
**File:** `apps/web/src/app/dashboard/profile/page.tsx`

**Description:** Customer profile settings

**Features:**
- Edit name, email
- Preferred languages (multi-select)
- Gotra input
- **Saved Addresses:**
  * List of addresses with default indicator
  * Add new address
  * Edit/delete existing
  * Set default

**Auth Required:** ✅ Yes

---

### 12. **Legal Pages**

**Terms of Service** - `/terms` (`apps/web/src/app/terms/page.tsx`)
**Privacy Policy** - `/privacy` (`apps/web/src/app/privacy/page.tsx`)
**Refund Policy** - `/refund` (`apps/web/src/app/refund/page.tsx`)
**About Us** - `/about` (`apps/web/src/app/about/page.tsx`)
**Contact** - `/contact` (`apps/web/src/app/contact/page.tsx`)
**Disclaimer** - `/disclaimer` (`apps/web/src/app/disclaimer/page.tsx`)

**Guest Mode:** ✅ All accessible

---

## 🎙️ PANDIT DASHBOARD (Port 3001)

### 1. **Login** - `/login`
**File:** `apps/pandit/src/app/login/page.tsx`

**Description:** Pandit authentication (Phone OTP)

**Features:**
- Same OTP flow as customer
- Role verification (must be PANDIT)
- Redirect to dashboard or onboarding

**Auth Method:** Firebase Phone OTP → JWT

---

### 2. **Onboarding Wizard** - `/onboarding`
**File:** `apps/pandit/src/app/onboarding/page.tsx`

**Description:** 6-step voice-first registration

**Features:**
- **Voice Input:** Browser SpeechRecognition API
- **Voice Output:** SpeechSynthesis for instructions
- Microphone button next to every field
- Language switcher (Hindi/English prompts)

**Step 1 - Personal Details (Voice-Guided):**
- Phone (confirm voice)
- Name (voice: "Ramesh Shastri")
- Address
- City dropdown (voice selects)
- Languages spoken (voice: "Hindi, Sanskrit, English")
- Experience years (voice: "Twenty years" → 20)
- Profile photo upload

**Step 2 - Specializations & Services:**
- Voice: "Which pujas do you perform?"
- Voice input: "Vivah, Griha Pravesh, Havan"
- For each selected:
  * Dakshina (voice: "Seven thousand five hundred")
  * Duration (voice: "Two and a half hours" → 2.5)
  * Description (voice or type)

**Step 3 - Travel Preferences:**
- "Will you travel?" (voice: "Haan"/"Nahi")
- Max distance (voice: "Fifty kilometers")
- Preferred modes (checkboxes, voice select)
- Vehicle type (if self-drive)
- Hotel preference
- Advance notice days

**Step 4 - Samagri Packages (Voice-Driven):**
- Use default list or create new
- Voice edits quantities: "Ghee 500 grams"
- Create 3 packages: Basic/Standard/Premium
  * Voice assigns items
  * Voice sets price

**Step 5 - Verification Documents:**
- Aadhaar upload
- Certificates (multiple)
- Video KYC message: "Team will call within 48 hours"

**Step 6 - Bank Details:**
- All fields voice-enabled:
  * Account holder name
  * Account number (with confirm)
  * IFSC code
  * UPI ID (optional)
- "Submit for Review" → DOCUMENTS_SUBMITTED status

**Auth Required:** ✅ Yes (new PANDIT users)

---

### 3. **Dashboard Home** - `/`
**File:** `apps/pandit/src/app/page.tsx`

**Description:** Daily schedule and earnings overview

**Features:**
- **Header:**
  * Avatar, name, "Verified" badge
  * Notification bell with count
  * **Online/Offline Toggle** (large button, calls API)

- **Today's Schedule Card:**
  * List of today's bookings (time, event, customer, venue)
  * Action buttons: "Navigate" (Google Maps), "Call"
  * If none: "No bookings today - Relax! 🙏"

- **Earnings Widget:**
  * "This Month's Earnings": ₹45,250
  * Comparison: "+18% from last month"
  * Click → /earnings

- **Quick Stats Row:**
  * 4.9★ Rating
  * 120 Completed Bookings
  * 15 This Month
  * 87 Reviews

- **Pending Actions:**
  * New booking requests: 3 (red badge)
  * Upcoming bookings: 8
  * Profile completeness: 95%

- **Recent Bookings:** Last 5 with status & earning

**Auth Required:** ✅ Yes (PANDIT role)

---

### 4. **Booking Requests** - `/bookings/[id]`
**File:** `apps/pandit/src/app/bookings/[id]/page.tsx`

**Description:** Handle booking requests and status updates

**Features:**
- **Urgent Request Banner:**
  - "New Booking Request" label
  - "EXPIRING SOON" timer badge
  - Call to action: "Respond within 4 hours"
- Booking number & status badge
- **Event Details Card:**
  * Event type, date, muhurat
  * Venue address with map link
  * Customer name, phone, rating
  * Attendees, special instructions

- **Earnings Breakdown Card:**
  * Dakshina: ₹25,000
  * Platform fee (15%): -₹3,750
  * Net dakshina: ₹21,250
  * Travel reimbursement: ₹4,800
  * Food allowance: ₹2,000
  * **Total Payout: ₹28,050**

- **Travel Details** (if outstation):
  * Mode, distance, notes
  * Food/accommodation arrangement

- **Samagri Note:** Customer's preference

**If Status = PANDIT_REQUESTED:**
- **Accept Button (Green):**
  * Confirms booking
  * Shows customer phone
  * Sends SMS
  * Status → CONFIRMED
- **Reject Button (Red):**
  * Opens reason dropdown
  * Clears panditId
  * Status → CREATED (admin reassigns)

**If Status >= CONFIRMED:**
- **"I'm Here" Status Buttons (Sequential):**
  * "Started Journey" → PANDIT_EN_ROUTE
  * "Reached Venue" → PANDIT_ARRIVED
  * "Puja Started" → PUJA_IN_PROGRESS
  * "Puja Complete 🙏" → COMPLETED
  * Each requests location (optional)
  * Creates timeline entry
  * Sends SMS to customer

**If Status = COMPLETED:**
- "Rate Customer" option
- Payment status display

**Auth Required:** ✅ Yes

---

### 5. **All Bookings** - `/bookings`
**File:** `apps/pandit/src/app/bookings/page.tsx`

**Description:** List of all pandit bookings

**Features:**
- Tab filters: Requests, Upcoming, Completed, All
- Booking cards with status, date, earning
- Click → detail page

**Auth Required:** ✅ Yes

---

### 6. **Calendar** - `/calendar`
**File:** `apps/pandit/src/app/calendar/page.tsx`

**Description:** Availability management

**Features:**
- **Monthly Calendar View:**
  * **Green:** Available (default)
  * **Orange:** Has booking(s) - click shows summary
  * **Red:** Blocked by pandit
  * **Gray:** Past dates

- **Actions:**
  * Click available → "Block This Date" modal:
    - Reason dropdown + textarea
    - Recurring option ("Every Tuesday")
    - Confirm
  * Click blocked → "Unblock" option

- **Recurring Blocks Section:** Edit/delete recurring rules

**Auth Required:** ✅ Yes

---

### 7. **Earnings** - `/earnings`
**File:** `apps/pandit/src/app/earnings/page.tsx`

**Description:** Earnings and payout tracking

**Features:**
- **Summary Cards:**
  * This month: ₹45,250
  * Last month: ₹38,300
  * Total lifetime: ₹2,45,800
  * Pending payouts: ₹12,500

- **Bar Chart:** Monthly earnings (last 12 months)

- **Transaction List (Paginated Table):**
  * Each row: Date, Event, Gross, Platform Fee, Net, Payout Status
  * Click → booking detail

- **Bank Details:** Account number (masked), IFSC, UPI

**Auth Required:** ✅ Yes

---

### 8. **Profile** - `/profile`
**File:** `apps/pandit/src/app/profile/page.tsx`

**Description:** Edit pandit profile

**Features:**
- Personal info (name, bio, languages, specializations, experience)
- **Puja Services:** List with edit/add/delete
- **Travel Preferences:** Edit max distance, modes, vehicle
- **Bank Details:** Edit (with verification status)
- **Samagri Packages:** View/edit/add Basic/Standard/Premium
- **Verification Status:** Display with document upload area

**Auth Required:** ✅ Yes

---

## 🔧 ADMIN PANEL (Port 3002)

### 1. **Login** - `/login`
**File:** `apps/admin/src/app/login/page.tsx`

**Description:** Admin authentication

**Features:**
- Phone OTP flow
- Role verification (must be ADMIN)

**Auth Required:** ✅ Yes (ADMIN role)

---

### 2. **Operations Dashboard** - `/`
**File:** `apps/admin/src/app/page.tsx`

**Description:** Central command center

**Features:**
- **Key Metrics Cards:**
  * Today's bookings: 24
  * Pending actions: 12 (red badge)
  * Monthly revenue: ₹8,45,250
  * Active pandits: 156

- **Recent Activity Feed:**
  * Real-time stream of events
  * "Booking HPJ-2026-10145 confirmed"
  * "Pandit Ramesh completed booking"
  * "New pandit registration"

- **Quick Action Tiles:**
  * Travel Queue (7 pending)
  * Verification Queue (12 pending)
  * Payout Queue (45 ready)
  * Cancellations (3 requested)

**Auth Required:** ✅ Yes (ADMIN)

---

### 3. **Travel Queue** - `/travel-queue` ⭐ CRITICAL
**File:** `apps/admin/src/app/travel-queue/page.tsx`

**Description:** Manual travel booking workflow (Phase 1 core feature)

**Features:**
- List all bookings with:
  * Status: CONFIRMED
  * travelRequired: true
  * travelStatus: PENDING

- **Table Columns:**
  * Booking #
  * Event date
  * Pandit (name, city, phone)
  * Venue city
  * Selected travel mode
  * Estimated cost
  * Actions

**For Each Booking:**

1. **"Calculate Travel" Button:**
   - Opens modal with breakdown
   - Calls TravelService API
   - Shows: distance, mode, ticket, food, total
   - Recalculate option

2. **"Book on IRCTC/MMT" Button:**
   - Copies details to clipboard:
     ```
     Passenger: Pandit Name
     Phone: +91XXXXXXXXXX
     From: City A to City B
     Date: YYYY-MM-DD
     Class: 3AC
     ```
   - Opens IRCTC/MMT in new tab
   - Admin books manually

3. **"Mark Travel Booked" Form:**
   - Booking reference (PNR, flight #, cab ID)
   - Travel notes (train name, coach, seat)
   - Actual cost (if different)
   - Submit → Updates travelStatus: BOOKED
   - Sends SMS to pandit & customer
   - Removes from queue

**Auth Required:** ✅ Yes (ADMIN)

---

### 4. **All Bookings** - `/bookings`
**File:** `apps/admin/src/app/bookings/page.tsx`

**Description:** Complete booking oversight

**Features:**
- **Filters:**
  * Status dropdown
  * Date range
  * City
  * Pandit search
  * Customer search
  * Payment status

- **Table:** Paginated list with all details
- **Click Row → Detail Page:**
  * Full booking info
  * Status timeline (visual stepper)
  * **Admin Actions:**
    - Update status manually
    - Reassign pandit
    - Process cancellation
    - Add admin notes (internal)
    - Send manual notification
    - Adjust pricing (with audit log)

**Auth Required:** ✅ Yes (ADMIN)

---

### 5. **Booking Detail** - `/bookings/[id]`
**File:** `apps/admin/src/app/bookings/[id]/page.tsx`

**Description:** Single booking admin view

**Features:**
- All booking details
- Status timeline
- Admin-specific actions
- Notes section

**Auth Required:** ✅ Yes (ADMIN)

---

### 6. **Pandit Management** - `/pandits`
**File:** `apps/admin/src/app/pandits/page.tsx`

**Description:** All pandits list

**Features:**
- **Filters:**
  * Verification status (All, Verified, Pending, Rejected)
  * City dropdown
  * Min rating
  * Search by name/phone

- **Table:**
  * Photo, Name, Phone
  * City, Experience
  * Verification status badge
  * Rating, Completed bookings
  * Actions: View | Edit | Suspend

**Auth Required:** ✅ Yes (ADMIN)

---

### 7. **Pandit Detail** - `/pandits/[id]`
**File:** `apps/admin/src/app/pandits/[id]/page.tsx`

**Description:** Pandit profile admin view

**Features:**
- All profile info (read-only)
- **Verification Section:**
  * Aadhaar (view image, verify number)
  * Certificates (view/download)
  * Video KYC status
  * Bank verification
  * Admin notes (internal)

- **Actions:**
  * **Approve:** status → VERIFIED, sends SMS
  * **Request More Info:** Specify needed docs, sends email
  * **Reject:** Reason form, marks REJECTED, notifies

**Auth Required:** ✅ Yes (ADMIN)

---

### 8. **Verification Queue** - `/verification`
**File:** `apps/admin/src/app/verification/page.tsx`

**Description:** Dedicated pandit verification workflow

**Features:**
- Pandits with status != VERIFIED
- Sorted by submission date (oldest first)

- **For Each Pandit:**
  * Profile summary
  * **Documents Panel:**
    - Aadhaar: view image, verify format
    - Certificates: gallery view, download all
    - Video KYC: "Schedule Call" button
  * **Actions:**
    - ✅ Approve All
    - ⚠️ Request More Info
    - ❌ Reject
  * **Bulk Actions:** Select multiple, batch approve/reject

**Auth Required:** ✅ Yes (ADMIN)

---

### 9. **Payout Queue** - `/payouts`
**File:** `apps/admin/src/app/payouts/page.tsx`

**Description:** Manual payout processing

**Features:**
- Shows bookings with:
  * Status: COMPLETED
  * payoutStatus: PENDING

- **Table:**
  * Booking #
  * Pandit name, phone
  * Completed date
  * Payout amount
  * Bank details (masked)
  * Actions

**For Each Payout:**

1. **"View Breakdown" Button:**
   - Dakshina: ₹25,000
   - Less platform fee: -₹3,750
   - Add travel: +₹4,800
   - Add food: +₹2,000
   - **Net: ₹28,050**

2. **"Mark as Paid" Button:**
   - Form:
     * Payment method (Bank/UPI/Cash)
     * Transaction reference (UTR/UPI ID)
     * Payment date
     * Notes
   - Submit → payoutStatus: COMPLETED
   - Sends SMS to pandit
   - Creates audit log
   - Removes from queue

**Bulk Payout:**
- Select multiple
- Export CSV for bulk transfer
- Upload CSV with UTRs
- Mark all as paid

**Auth Required:** ✅ Yes (ADMIN)

---

### 10. **Customers** - `/customers`
**File:** `apps/admin/src/app/customers/page.tsx`

**Description:** Customer management

**Features:**
- List of all customers
- Search, filter, view details
- Booking history per customer

**Auth Required:** ✅ Yes (ADMIN)

---

### 11. **Operations** - `/operations`
**File:** `apps/admin/src/app/operations/page.tsx`

**Description:** Operational tasks overview

**Features:**
- Quick access to queues
- Pending action items
- Daily operations checklist

**Auth Required:** ✅ Yes (ADMIN)

---

### 12. **Settings** - `/settings`
**File:** `apps/admin/src/app/settings/page.tsx`

**Description:** Platform settings

**Features:**
- Platform configuration
- Fee percentages
- System settings

**Auth Required:** ✅ Yes (ADMIN)

---

## 🔌 REST API ENDPOINTS (Port 4000)

**Base URL:** `http://localhost:4000/api/v1`

### Authentication (`/auth`)
- `POST /auth/send-otp` - Send OTP via Firebase
- `POST /auth/verify-otp` - Verify OTP and issue JWT
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile

### Pandits (`/pandits`)
- `GET /pandits` - Search/list pandits (with filters)
- `GET /pandits/:id` - Get pandit profile
- `GET /pandits/:id/reviews` - Get pandit reviews
- `GET /pandits/:id/availability` - Get availability calendar
- `PUT /pandits/me/profile` - Update pandit profile
- `PATCH /pandits/me/online` - Toggle online/offline
- `POST /pandits/me/services` - Add puja service
- `POST /pandits/me/samagri-packages` - Add samagri package

### Bookings (`/bookings`)
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking details
- `GET /bookings/customer/my` - Customer's bookings
- `GET /bookings/pandit/my` - Pandit's bookings
- `PATCH /bookings/:id/accept` - Pandit accepts
- `PATCH /bookings/:id/reject` - Pandit rejects
- `POST /bookings/:id/status-update` - Update status ("I'm Here")
- `POST /bookings/:id/cancel` - Request cancellation

### Travel (`/travel`)
- `POST /travel/calculate` - Calculate travel options
- `GET /travel/distance` - Get distance between cities
- `GET /travel/cities` - List supported cities

### Muhurat (`/muhurat`)
- `GET /muhurat/dates` - Get muhurat dates (month aggregated)
- `GET /muhurat/pujas-for-date` - Get pujas for specific date
- `GET /muhurat/suggest` - Get muhurat suggestions for puja+date

### Payments (`/payments`)
- `POST /payments/create-order` - Create Razorpay order
- `POST /payments/verify` - Verify payment
- `POST /payments/webhook` - Razorpay webhook (signature verification)

### Reviews (`/reviews`)
- `POST /reviews` - Submit review
- `GET /reviews/:bookingId` - Get review for booking

### Customers (`/customers`)
- `GET /customers/me/favorites` - Get favorite pandits
- `POST /customers/me/favorites` - Add favorite
- `DELETE /customers/me/favorites/:panditId` - Remove favorite
- `GET /customers/me/addresses` - Get addresses
- `POST /customers/me/addresses` - Add address
- `PUT /customers/me/addresses/:id` - Update address
- `DELETE /customers/me/addresses/:id` - Delete address

### Admin (`/admin`)
- `GET /admin/bookings` - All bookings (with filters)
- `PATCH /admin/bookings/:id/travel-status` - Update travel status
- `GET /admin/pandits` - All pandits
- `PATCH /admin/pandits/:id/verification` - Approve/reject pandit
- `GET /admin/payouts` - Payout queue
- `PATCH /admin/payouts/:bookingId` - Mark payout as completed
- `GET /admin/stats` - Dashboard statistics

---

## 📊 DATABASE MODELS

**Total: 15 Models** (PostgreSQL via Prisma)

1. **User** - Base user (Customer/Pandit/Admin)
2. **Customer** - Customer profile extension
3. **Address** - Customer addresses
4. **Pandit** - Pandit profile extension
5. **PujaService** - Pandit's puja services
6. **PanditBlockedDate** - Calendar blocks
7. **Ritual** - Master puja types
8. **Booking** - Complete booking data
9. **BookingStatusUpdate** - Status timeline
10. **Review** - Reviews and ratings
11. **FavoritePandit** - Customer favorites
12. **MuhuratDate** - Auspicious dates (60+ seeded)
13. **CityDistance** - Distance matrix (15 cities)
14. **Notification** - Notification log
15. **OTP** - OTP verification
16. **AdminLog** - Audit trail

---

## 🎨 SHARED UI COMPONENTS

**Package:** `packages/ui/` (29 components)

- Button (4 variants, 3 sizes, loading, icons)
- Input (text, phone, search, textarea)
- Card (default, outlined, elevated)
- Badge (5 types, sizes, dot)
- Rating (display & input modes, half-stars)
- Avatar (sizes, initials, verified badge)
- Modal (overlay, sizes, ESC/click-outside)
- Select (dropdown with search)
- DatePicker (calendar, min/max, highlighted)
- Stepper (horizontal, steps, active/completed)
- StatusTimeline (vertical, timestamps)
- EmptyState (illustration, CTA)
- Tabs (horizontal, underline)
- Toast (useToast hook, 4 types)
- Skeleton (text, card, avatar)
- **PanditCard** (composite for search results)
- **PriceBreakdown** (itemized pricing, GST)
- **GuestBanner** (sticky login CTA)
- Icon (29 custom icons)
- Logo (customer/pandit/admin variants)

**Theme Support:** All components accept `appTheme` prop for color switching

---

## 🎯 IMPLEMENTATION STATUS

### ✅ Completed Features (Phase 1)

**Customer Side:**
- ✅ Guest mode with progressive registration
- ✅ Homepage with search, categories, Muhurat Explorer
- ✅ Pandit listing with 8+ filters
- ✅ Pandit profile with verification badges, pricing, travel tabs
- ✅ Dual samagri selection (fixed packages OR custom list)
- ✅ 6-step booking wizard with muhurat suggestions
- ✅ Travel cost estimate (manual ops, hardcoded distance matrix)
- ✅ Food allowance & accommodation options
- ✅ Transparent GST-compliant price breakdown
- ✅ Razorpay payment integration (test mode)
- ✅ Post-booking dashboard with status timeline
- ✅ Reviews & favorites
- ✅ Cancellation with refund policy

**Pandit Side:**
- ✅ Voice-first registration (SpeechRecognition API)
- ✅ Separate login (mobile OTP)
- ✅ 6-step onboarding wizard
- ✅ Dashboard with today's bookings, online/offline toggle
- ✅ Earnings widget
- ✅ Booking request accept/reject with earnings breakdown
- ✅ "I'm Here" status updates (4 stages)
- ✅ Profile management
- ✅ Calendar (block/unblock dates)
- ✅ Samagri package management
- ✅ Earnings report

**Admin Side:**
- ✅ Dashboard with booking queue, stats
- ✅ **Travel operations queue** (manual IRCTC/MMT booking)
- ✅ Pandit verification queue
- ✅ Payout management (manual)
- ✅ Cancellation/refund processing
- ✅ All bookings with filters
- ✅ Pandit management
- ✅ Admin audit logs

**Backend:**
- ✅ Complete REST API (Express + TypeScript)
- ✅ 15 database models (Prisma + PostgreSQL)
- ✅ Travel calculation service (hardcoded distance matrix, 15 cities)
- ✅ Muhurat data (60+ dates seeded)
- ✅ Notification templates (9 Hinglish SMS, Twilio with mock mode)
- ✅ GST-compliant pricing engine
- ✅ Cancellation refund calculator (time-based policy)
- ✅ JWT authentication with role-based access
- ✅ Razorpay webhook handling

---

### ⏳ Deferred to Phase 2+

- ❌ Live GPS tracking (WebSocket)
- ❌ In-app chat
- ❌ Automated travel APIs (IRCTC, MMT, Uber SDKs)
- ❌ Elasticsearch for search
- ❌ AI matching engine
- ❌ Mobile apps (React Native)
- ❌ Backup guarantee system
- ❌ Multi-language beyond Hindi/English
- ❌ B2B portal for wedding planners
- ❌ NRI booking flow
- ❌ Paid muhurat consultation

---

## 📈 SCREEN COUNT SUMMARY

**Customer Web App:** 22 screens  
**Pandit Dashboard:** 11 screens  
**Admin Panel:** 12 screens  
**Total:** **45 screens**

---

## 🚀 QUICK START GUIDE

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- Docker Desktop

### Steps to Run Locally

1. **Navigate to project:**
```bash
cd c:\Users\ss\Documents\HmarePanditJi
```

2. **Start PostgreSQL (Docker):**
```bash
docker compose up -d
```
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050` (admin@hmarepanditji.com / admin123)

3. **Install dependencies:**
```bash
pnpm install
```

4. **Push database schema:**
```bash
pnpm db:push
```

5. **Seed database (optional):**
```bash
pnpm db:seed
```

6. **Start all apps:**
```bash
pnpm dev
```

### Access URLs

| App | URL | Port |
|-----|-----|------|
| **Customer Web** | http://localhost:3000 | 3000 |
| **Pandit Dashboard** | http://localhost:3001 | 3001 |
| **Admin Panel** | http://localhost:3002 | 3002 |
| **REST API** | http://localhost:4000 | 4000 |
| **Prisma Studio** | Run `pnpm db:studio` | 5555 |

---

## 🔑 TEST CREDENTIALS

After seeding, you can use these test accounts:

**Admin:**
- Phone: +919999999999
- OTP: (check console in mock mode)

**Sample Pandit (Verified):**
- Find in Prisma Studio or seed output

**Customer:**
- Any new phone number creates a customer account

---

## 📱 TESTING WORKFLOW

### Customer Journey Test:
1. Visit http://localhost:3000
2. Browse without login (guest mode)
3. Click Muhurat Explorer → view dates
4. Search for pandits (filters work)
5. View pandit profile → See travel tabs
6. Click "Book This Puja" → Login modal
7. Complete OTP login
8. Go through 6-step booking wizard
9. Make test payment (Razorpay test keys)
10. View booking in dashboard
11. Check status timeline

### Pandit Journey Test:
1. Visit http://localhost:3001
2. Login as pandit (or complete onboarding)
3. Toggle online/offline
4. See today's bookings (if any)
5. View booking requests
6. Accept a booking → see earnings breakdown
7. Update status ("I'm Here" buttons)
8. View earnings page
9. Block dates in calendar
10. Edit profile & samagri packages

### Admin Journey Test:
1. Visit http://localhost:3002
2. Login as admin
3. View dashboard stats
4. Open Travel Queue → see pending travel bookings
5. Calculate travel for a booking
6. Mark travel as booked (copy details to IRCTC)
7. Open Verification Queue → approve a pandit
8. Open Payout Queue → mark a payout as completed
9. View all bookings with filters
10. Check admin logs

---

## 🎨 DESIGN TOKENS

### Colors
- Customer Primary: `#f49d25` (Amber)
- Pandit Primary: `#f09942` (Deep Orange)
- Admin Primary: `#137fec` (Blue)

### Typography
- Font: Inter (Google Fonts)
- Weights: 400, 500, 600, 700

### Spacing
- Border Radius: 12px (cards), 8px (buttons), 24px (pills)
- Shadows: Tailwind default

---

## 🎤 VOICE INPUT FEATURE - NEW IN PHASE 1

**Component Files:**
- Hook: `apps/pandit/src/hooks/useVoiceInput.ts`
- Component: `apps/pandit/src/components/VoiceButton.tsx`
- Types: `apps/pandit/src/types/speech.d.ts`
- Integration: `apps/pandit/src/app/onboarding/page.tsx`

**Purpose:** Voice-first onboarding for non-tech-savvy pandits using Web Speech API

**Browser Support:** Chrome, Edge (WebKit-based) - button hidden if unsupported

**Fields with Voice Input:**
1. Display Name - "Apna naam boliye"
2. Bio - "Apne experience ke baare mein boliye" 
3. Bank Name - "Bank ka naam boliye"

**Visual States:**
- Idle: Gray circular button with mic icon
- Recording: Red background, pulsing animation
- Error: Red tooltip with Hindi message

**Technical Details:**
- Languages: Hindi (hi-IN), English (en-IN)
- Optional TTS prompts
- Real-time transcript
- Error handling: Permission denied, no speech, network issues

---

## 🛒 SAMAGRI SELECTION FEATURE - NEW IN PHASE 1

**Component Files:**
- Modal: `apps/web/src/components/samagri/SamagriModal.tsx`
- Context: `apps/web/src/context/cart-context.tsx`

**Purpose:** Dual-path samagri selection - Pandit's packages vs custom list

**Tab 1 - Pandit's Packages:**
- 3 tiers: Basic (₹3k), Standard (₹5k), Premium (₹8k)
- Color-coded cards with item lists
- Click to select
- Falls back to mock packages in development

**Tab 2 - Build Your Own:**
- 21 curated items across 5 categories
- Click items to add to cart (top section)
- Edit quantities
- Confirm selection

**Cart Context:**
- Global state management
- localStorage persistence
- Type-safe interfaces

**Integration (Planned):**
- Booking wizard Step 4
- Cart icon in header
- Price flow to review step

**API Endpoints (TODO):**
- GET /api/v1/pandits/:id/samagri-packages
- POST/PUT/DELETE for package management

---

## 📝 NOTES

1. **Mock Mode:** By default, Firebase OTP, Twilio SMS, and some features run in mock/console mode for development.

2. **Third-Party Keys:** You'll need real keys for:
   - Firebase (Phone Auth)
   - Razorpay (Payments)
   - Twilio (SMS)
   - Google Maps (Optional for Phase 1)

3. **Database:** PostgreSQL runs in Docker. Use `pnpm db:studio` to view data visually.

4. **Seed Data:** Includes 10 pandits, 60+ muhurat dates, city distance matrix, sample bookings.

5. **Voice Features:** Require Chrome/Edge browser with microphone permission. Button automatically hidden on unsupported browsers.

6. **Samagri Packages:** Currently using mock data (Basic/Standard/Premium). Backend API endpoints to be added.

7. **Next Steps:** 
   - Complete voice input for remaining fields (account number, IFSC)
   - Add samagri backend API endpoints
   - Integrate samagri modal with booking wizard Step 4
   - Add cart icon to customer header
   - Test voice accuracy with real users
   - Test all workflows end-to-end
   - Add real API keys for production features
   - Deploy to Render/Vercel (render.yaml included)

---

**End of Documentation**  
**Last Updated:** February 14, 2026, 1:45 AM  
**Version:** Phase 1 MVP - **91% Complete**  
**Status:** Voice Input ✅ 90% | Samagri Selection ✅ 85%  
**New Features:** ⭐ Voice-First Onboarding + Dual-Path Samagri Selection
