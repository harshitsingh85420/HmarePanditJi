# HMAREPANDITJI — PHASE 1 PROMPT LIBRARY: PART 4
## Admin Operations Center + Customer Post-Booking + Notifications + Launch
### Prompts 6.1 – 7.3 | Sprint 6 | Weeks 11–12

---

## 🔍 GAP ANALYSIS: What Bhaag 12 & Idea Doc Require That Parts 1–3 Haven't Built

Before diving into the prompts, here's my thorough analysis of what's missing from Phase 1 after reading all source documents — Bhaag 12 especially, the SRS, the Architecture Doc, the API doc, and the UI directory index. Some of these were explicitly listed in the "Next" notes at the end of Part 3. Others are gaps I identified by cross-referencing Bhaag 12's detailed walkthrough against what's actually been built.

### A. Critical Missing (Must Build — Covered in This Part)

| # | Feature | Source | Why Critical |
|---|---------|--------|-------------|
| 1 | **Admin Operations Dashboard** | SRS §4.1.3, UI #41 | Zero admin screens exist. Nobody can verify pandits, process payouts, or manage travel. Platform is non-operational without this. |
| 2 | **Admin Travel Desk** | Bhaag 12 ("manual travel ops"), UI #42 | The entire Phase 1 travel model is MANUAL. Admin needs a queue to calculate travel, paste booking references, and mark travel as booked. |
| 3 | **Admin Pandit Verification Queue** | SRS FR-1.5, UI #44-45 | No pandit can go live without admin reviewing Aadhaar, certificates, and video KYC. |
| 4 | **Admin Payout Processing** | Bhaag 12 ("Payment Screen"), UI #43 | Pandits don't get paid without admin marking payouts as completed. |
| 5 | **Customer Post-Booking Dashboard** | Bhaag 12 ("Post-Booking Management Screen"), UI #18 | After paying, customers see… nothing. Need unified itinerary, status timeline, documents tab. |
| 6 | **Customer Reviews + Favorites** | Bhaag 12, SRS FR-2.6, FR-10 | Cannot rate pandits or save favorites. Core marketplace loop is broken without reviews. |
| 7 | **Notification Service** | SRS §4.3.7, API Doc §7 | Zero SMS/WhatsApp notifications exist. Neither party knows what's happening after a booking. |
| 8 | **Cancellation + Refund Flow** | Bhaag 12 ("Cancellation/Refund Screen"), SRS FR-3 | Customers can't cancel. Admin can't process refunds. Razorpay refund API not wired. |
| 9 | **SEO + Legal Pages** | SRS §6.1, UI #54 | No Terms, Privacy Policy, Cancellation Policy, robots.txt, sitemap — legally non-compliant for launch. |

### B. Smart Additions I Recommend for Phase 1 (Not Explicitly Listed But Necessary)

| # | Feature | My Reasoning |
|---|---------|-------------|
| 1 | **Booking Confirmation Page** | Bhaag 12 lists "Booking Confirmation Screen" with booking ID, next steps, share options. Part 2's payment flow ends at Razorpay callback but there's no dedicated confirmation page with social share (WhatsApp) and "What happens next" steps. |
| 2 | **Digital Muhurat Patrika Certificate** | Bhaag 12 explicitly says Documents tab includes "downloadable Muhurat Patrika (auspicious timing certificate) for the booked puja." UI #22 has a design for this. It's a PDF/image certificate — a delighter feature that costs almost nothing to build but creates massive shareability. |
| 3 | **Customer Family & Gotra Setup** | Bhaag 12: "Family member details" in customer profile. UI #24 has `family_gotra_&_lineage_setup`. Pandits need gotra info for certain pujas. Without this, booking flow has a gap for specific rituals like Vivah. |
| 4 | **Puja Completion + Digital Blessings Flow** | Bhaag 12 describes post-puja: "Triggers automatic payment process." UI #21 has `puja_completion_&_digital_blessings`. When puja completes, customer should see a celebration screen with a digital blessing message from the pandit, receipt, and review prompt. |
| 5 | **Admin Helpline Agent Dashboard** | UI #46 has this design. Even if Phase 1 is manual ops, admin needs a basic screen to log customer/pandit support requests and track resolution. Without this, support requests disappear into WhatsApp messages. |
| 6 | **Admin Booking Reassignment** | When a pandit declines, Part 3's code sets status to CANCELLATION_REQUESTED. But there's no admin UI to reassign the booking to another pandit. The booking is dead in the water. |
| 7 | **Customer Notification Center** | SRS §4.1.1 Screen 11: "Notification Center — Categorized notifications, Mark as read/unread." Customers need an in-app page to see all notifications (booking updates, pandit status, payment receipts) — not just rely on SMS. |
| 8 | **Pandit-Side Customer Rating** | Bhaag 12: "Pandit can rate the customer (for future Pandits' reference) on punctuality, hospitality, and food arrangements." Part 3's completion flow doesn't include pandit-to-customer review. |
| 9 | **Basic Error Boundaries + 404 Pages** | All 3 apps need proper error boundaries, 404 pages, and loading skeletons. Currently none exist. |
| 10 | **Complete Seed Data for E2E Testing** | Parts 1-3 seed one pandit. For admin + customer testing, we need: 5+ pandits (mix of verified, pending, rejected), 10+ bookings (across all statuses), sample reviews, sample payouts. |

### C. Explicitly Deferred (Confirmed NOT in Phase 1)

These are from the idea doc but confirmed deferred:
- Live GPS tracking via WebSocket (Phase 2 — use polling + manual "I'm Here" updates)
- In-app chat between customer and pandit (Phase 2)
- Automated travel APIs (IRCTC, MMT, Uber) (Phase 3)
- Elasticsearch for search (Phase 2)
- AI matching engine (Phase 2)
- Mobile apps (Phase 2)
- Backup guarantee system (Phase 2)
- B2B/Wedding planner portal (Phase 2)
- NRI booking flow (Phase 2)
- Muhurat paid consultation (Phase 2)
- Insurance coverage (arranged offline)
- Multi-language beyond Hindi/English (Phase 2)

---

## PROMPT STRUCTURE FOR PART 4

Based on the gap analysis, here are the 7 prompts in this part:

| Prompt | Sprint | Covers |
|--------|--------|--------|
| **6.1** | 6A | Admin Dashboard + Travel Operations Desk |
| **6.2** | 6A | Admin Pandit Verification Queue + Detail Page |
| **6.3** | 6A | Admin Payout Processing + Cancellation/Refund + Booking Management |
| **6.4** | 6B | Customer Post-Booking Dashboard + Booking Confirmation + Status Timeline |
| **6.5** | 6B | Customer Reviews + Favorites + Profile + Family/Gotra + Notification Center |
| **7.1** | 6C | Notification Service (SMS Templates + Triggers) + Puja Completion Flow + Muhurat Patrika |
| **7.2** | 6C | SEO + Legal Pages + Error Boundaries + Complete Seed Data + Launch Checklist |

> **Architecture Reminder:** The Admin app lives at `apps/admin/` (running on `localhost:3003`). It redirects unauthenticated users to `http://localhost:3000/login?redirect=admin&next=<path>`. Only users with `role: 'ADMIN'` can access. Theme color: `#137fec` (blue). The admin panel is internal-only — no SEO, no guest mode, no mobile optimization beyond basic responsiveness.

---

## SPRINT 6A: ADMIN OPERATIONS CENTER (Week 11)

---

### PROMPT 6.1 — ADMIN DASHBOARD + TRAVEL OPERATIONS DESK

```
Build the Admin Operations Center home dashboard and the Travel Operations 
Desk — the single most important admin page in Phase 1, since ALL travel 
booking is manual.

════════════════════════════════════════════════════════════════
ROUTE & FILE STRUCTURE
════════════════════════════════════════════════════════════════

apps/admin/app/
├── layout.tsx                    # Admin shell with sidebar
├── page.tsx                      # Dashboard home
├── travel-desk/
│   └── page.tsx                  # Travel operations queue
├── bookings/
│   ├── page.tsx                  # All bookings list
│   └── [bookingId]/
│       └── page.tsx              # Single booking detail
├── pandits/
│   ├── page.tsx                  # Pandit list
│   └── [panditId]/
│       └── page.tsx              # Verification detail
├── payouts/
│   └── page.tsx                  # Payout queue
├── cancellations/
│   └── page.tsx                  # Cancellation/refund queue
├── support/
│   └── page.tsx                  # Helpline log
├── settings/
│   └── page.tsx                  # Platform settings
├── components/
│   ├── AdminLayout.tsx           # Sidebar + header shell
│   ├── AdminSidebar.tsx          # Navigation sidebar
│   ├── MetricCard.tsx            # Dashboard stat card
│   ├── ActivityFeed.tsx          # Recent activity log
│   ├── TravelCalculatorModal.tsx # Travel cost calculator
│   └── BookingDetailPanel.tsx    # Shared booking detail view
└── hooks/
    └── useAdminAuth.ts           # Admin auth check hook

════════════════════════════════════════════════════════════════
ADMIN LAYOUT SHELL (AdminLayout.tsx)
════════════════════════════════════════════════════════════════

This wraps all admin pages.

Sidebar (fixed left, 260px, white background, blue accent):
  Logo: "🙏 HPJ Admin" (blue, 20px bold)
  
  Navigation items (icon + label, blue-highlight on active):
    📊 Dashboard          → /
    ✈️ Travel Desk        → /travel-desk     + badge (pending count)
    📋 All Bookings       → /bookings
    👳 Pandits            → /pandits          + badge (unverified count)
    💰 Payouts            → /payouts          + badge (pending count)
    ❌ Cancellations      → /cancellations    + badge (pending count)
    📞 Support Log        → /support
    ⚙️ Settings           → /settings
  
  Bottom of sidebar:
    Logged in as: [Admin Name]
    [Logout] button

Header bar (top, full width minus sidebar):
  Left: Page title (dynamic based on route)
  Right: 
    🔔 Notification bell with unread count
    Quick search input (search bookings by ID, pandit name, customer phone)

════════════════════════════════════════════════════════════════
DASHBOARD HOME PAGE (/)
════════════════════════════════════════════════════════════════

apps/admin/app/page.tsx

Fetches: GET /api/admin/dashboard-stats (new endpoint)

SECTION A — Key Metrics Row (4 cards):
  Card 1: "Today's Bookings"
    Large number: count of bookings where event date = today
    Subtitle: "X confirmed, Y in progress"
    Color accent: green
  
  Card 2: "Pending Actions"
    Large number: sum of all pending queues
    Breakdown: "Travel: X | Verify: Y | Payouts: Z"
    Color accent: amber (warning)
    Click → most urgent queue
  
  Card 3: "Monthly Revenue"
    Large number: "₹X,XX,XXX" (sum of all booking grandTotals this month
    where paymentStatus = CAPTURED)
    Subtitle: "+X% vs last month"
    Color accent: blue
  
  Card 4: "Active Pandits"
    Large number: count of pandits with verificationStatus = VERIFIED
    Subtitle: "X online now" (where isOnline = true)
    Color accent: green

SECTION B — Action Required Alerts:
  Ordered cards for items needing immediate attention:
  
  Alert types (sorted by urgency):
    🔴 HIGH: Bookings happening in <48 hours with travel not booked
      Message: "URGENT: Booking HPJ-XXXX has event in 36 hours, 
               travel NOT booked. Pandit [name] needs [mode] from 
               [city] to [city]."
      [Open Travel Desk →]
    
    🟡 MEDIUM: Pandit verifications pending >24 hours
      Message: "[Name] submitted documents 2 days ago — review needed."
      [Review Now →]
    
    🟡 MEDIUM: Completed bookings with payouts pending >48 hours
      Message: "₹X payout pending for [Pandit] — Booking HPJ-XXXX."
      [Process Payout →]
    
    🔵 LOW: Cancellation requests awaiting approval
      Message: "Customer [name] requested cancellation for HPJ-XXXX."
      [Review →]
  
  Fetch from: GET /api/admin/alerts (new endpoint)
  Logic: query bookings with specific status + time conditions

SECTION C — Recent Activity Feed (ActivityFeed.tsx):
  Chronological list of last 20 platform events:
    - "New booking HPJ-1234 created by Rajesh (₹45,000)" — 5 min ago
    - "Pandit Pt. Sharma accepted booking HPJ-1234" — 12 min ago
    - "Payment captured for HPJ-1233 (₹32,500)" — 1 hour ago
    - "New pandit registration: Pt. Vinod Kumar" — 2 hours ago
    - "Pandit Pt. Gupta marked puja as completed (HPJ-1230)" — 3 hours ago
  
  Each item: emoji icon + message + relative time + [View] link
  Fetch from: GET /api/admin/activity-feed?limit=20

SECTION D — Quick Stats Chart:
  Simple bar chart (CSS/SVG, no library) showing bookings per day 
  for the last 14 days. X-axis: dates. Y-axis: count.
  Color: blue (#137fec) bars.

════════════════════════════════════════════════════════════════
TRAVEL OPERATIONS DESK (/travel-desk)
════════════════════════════════════════════════════════════════

apps/admin/app/travel-desk/page.tsx

THIS IS THE MOST CRITICAL ADMIN PAGE. In Phase 1, all travel is 
manually managed by admin. This page is where admin:
1. Sees all bookings that need travel arranged
2. Calculates travel costs
3. Books travel externally (IRCTC, MMT, etc.)
4. Enters booking references back into the system

────────────────────────────────────────────────────────────────
QUEUE TABS
────────────────────────────────────────────────────────────────

Three tabs at top:
  [🔴 Needs Travel (X)]  [🟡 In Progress (X)]  [✅ Booked (X)]

Tab 1 — Needs Travel:
  Query: bookings WHERE status = 'CONFIRMED' 
         AND travelRequired = true 
         AND travelStatus = 'PENDING'
  Sort: by event date ASC (most urgent first)

Tab 2 — In Progress:
  Query: bookings WHERE travelStatus = 'ADMIN_CALCULATING'

Tab 3 — Booked:
  Query: bookings WHERE travelStatus = 'BOOKED'
  (last 30 days, for reference)

────────────────────────────────────────────────────────────────
TRAVEL QUEUE ITEM CARD (for each booking)
────────────────────────────────────────────────────────────────

Large card with urgency indicator:
  
  LEFT SECTION (booking info):
    Booking #: HPJ-XXXX (clickable → /bookings/{id})
    Event: "विवाह पूजा" — 15 Mar 2026 (in 3 days) ← RED if <48hrs
    Customer: "Rajesh Kumar" — Delhi
    Pandit: "Pt. Ramesh Sharma" — Haridwar
    Phone: +91 98765-XXXXX (clickable for copy)
  
  MIDDLE SECTION (travel info):
    Route: "Haridwar → Delhi" (with distance: ~230 km)
    Selected Mode: "Train" (from booking's selectedTravelMode)
    Pandit Preferences: "Train ✓, Cab ✓, Flight ✗"
    Travel Dates: "14 Mar (depart) → 16 Mar (return)"
    Event Date: "15 Mar, 10:00 AM"
    Accommodation: "Customer arranges" OR "Platform books"
    Food Allowance: "₹3,000 (3 days × ₹1,000)"
  
  RIGHT SECTION (actions):
    [🧮 Calculate Cost] → opens TravelCalculatorModal
    [📋 Copy Details] → copies formatted text to clipboard:
      "Booking: HPJ-XXXX
       Pandit: Pt. Ramesh Sharma (Ph: +91 98765-XXXXX)
       From: Haridwar → To: Delhi
       Travel Date: 14 Mar 2026
       Return: 16 Mar 2026
       Mode: Train
       Notes: [any special notes]"
    
    [✅ Mark as Booked] → opens completion form (see below)
    
  URGENCY BANNER (top of card):
    If event in < 24 hours: RED "🚨 EVENT TOMORROW"
    If event in < 48 hours: AMBER "⚠️ EVENT IN 2 DAYS"
    If event in < 72 hours: YELLOW "📅 EVENT IN 3 DAYS"

────────────────────────────────────────────────────────────────
TRAVEL CALCULATOR MODAL (TravelCalculatorModal.tsx)
────────────────────────────────────────────────────────────────

Opens when admin clicks [Calculate Cost].
Pre-filled from booking data.

Fields:
  From City: [pre-filled, editable dropdown]
  To City: [pre-filled, editable dropdown]
  Travel Mode: [pre-filled, editable select]
  
  Auto-calculated (using TravelCalculationService from Part 1):
    Estimated Cost: ₹X,XXX
    Estimated Duration: X hours
    Distance: XXX km
  
  Admin Override Section:
    Actual Cost: number input (admin enters after checking IRCTC/MMT)
    Notes: textarea ("Shatabdi Express, PNR: XXXXXXXX")
    Return Journey Cost: number input
    Return Notes: textarea
    Local Cab Cost (if applicable): number input
    Accommodation Cost (if platform booking): number input
  
  Total Travel Cost: [auto-calculated sum of all above]
  
  [Save Calculation] → PATCH /api/admin/bookings/{id}/travel-calculate
    Body: {
      calculatedTravelCost: number,
      travelNotes: string,
      travelBreakdown: { 
        outbound: number, return: number, 
        localCab: number, accommodation: number 
      },
      travelStatus: 'ADMIN_CALCULATING'
    }

────────────────────────────────────────────────────────────────
MARK AS BOOKED FORM (inline expansion or modal)
────────────────────────────────────────────────────────────────

When admin clicks [Mark as Booked]:

  Section: Outbound Journey
    Booking Reference: text input (PNR, ticket #, etc.)
    Carrier/Service: text ("Shatabdi Express" / "IndiGo 6E-123")
    Departure: datetime
    Arrival: datetime
    Actual Cost: number (pre-filled from calculator if done)
    Upload Ticket: file upload (PDF/image) 
      → POST /api/upload/travel-document
  
  Section: Return Journey
    Same fields as above (optional — some bookings are one-way)
  
  Section: Local Transport (if applicable)
    Cab Service: text ("Ola", "Uber", "Local taxi")
    Pickup Time: datetime
    Pickup Location: text
    Drop Location: text
    Reference/Driver: text
    Cost: number
  
  Section: Accommodation (if platform books)
    Hotel Name: text
    Check-in: date
    Check-out: date
    Booking Reference: text
    Cost per night: number
    Total Nights: number
  
  Admin Notes: textarea (internal only)
  
  [Confirm — Mark Travel as Booked]
    → PATCH /api/admin/bookings/{id}/travel-booked
    Body: {
      travelStatus: 'BOOKED',
      travelBookingDetails: { outbound, return, localCab, accommodation },
      actualTravelCost: number,
      travelDocumentUrls: string[]
    }
    → Triggers notification to Pandit: 
      "[SMS] Booking HPJ-XXXX: Travel booked! Train PNR: XXXXX. 
       Check your app for full itinerary."
    → Triggers notification to Customer:
      "[SMS] Booking HPJ-XXXX: Pandit ji's travel has been arranged! 
       Track journey in your dashboard."
    → Updates booking.status to 'TRAVEL_BOOKED' (if was CONFIRMED)

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS FOR ADMIN DASHBOARD + TRAVEL
════════════════════════════════════════════════════════════════

All routes: /api/admin/* — require ADMIN role middleware.

GET /api/admin/dashboard-stats
  Returns: {
    todaysBookings: { total, confirmed, inProgress },
    pendingActions: { travel, verification, payouts, cancellations },
    monthlyRevenue: { current, previous, percentChange },
    activePandits: { verified, online }
  }

GET /api/admin/alerts
  Logic: 
    1. Bookings with event <48hrs AND travelStatus=PENDING → HIGH
    2. PanditProfiles with verificationStatus=DOCUMENTS_SUBMITTED 
       AND updatedAt >24hrs ago → MEDIUM
    3. Bookings with status=COMPLETED AND payoutStatus=PENDING 
       AND completedAt >48hrs ago → MEDIUM
    4. Bookings with status=CANCELLATION_REQUESTED → LOW
  Returns: array of { type, severity, message, actionUrl, bookingId }

GET /api/admin/activity-feed?limit=20
  Query BookingStatusUpdate + User creation + Payout records
  Sort by createdAt DESC, format as human-readable messages

GET /api/admin/travel-queue?tab=pending|calculating|booked
  Returns bookings with travel details + pandit + customer info

PATCH /api/admin/bookings/:id/travel-calculate
  Auth: ADMIN
  Body: { calculatedTravelCost, travelNotes, travelBreakdown }
  Updates booking travel fields, sets travelStatus = ADMIN_CALCULATING

PATCH /api/admin/bookings/:id/travel-booked
  Auth: ADMIN
  Body: { travelBookingDetails, actualTravelCost, travelDocumentUrls }
  Logic:
    1. Update booking.travelStatus = 'BOOKED'
    2. Store travelBookingDetails as JSON
    3. Update booking.travelCost if actual differs from estimate
    4. If booking.status was 'CONFIRMED', update to 'TRAVEL_BOOKED'
    5. Create BookingStatusUpdate record
    6. Trigger notifications (pandit + customer)
  Returns: updated booking
```

---

### PROMPT 6.2 — ADMIN PANDIT VERIFICATION QUEUE + DETAIL PAGE

```
Build the Pandit Verification Queue and individual Pandit 
Verification Detail page. This is how admin reviews and approves 
pandit registrations — no pandit can receive bookings without 
passing through this queue.

════════════════════════════════════════════════════════════════
VERIFICATION QUEUE PAGE (/pandits)
════════════════════════════════════════════════════════════════

apps/admin/app/pandits/page.tsx

Tab filters at top:
  [📝 Pending Review (X)]  [✅ Verified (X)]  [❌ Rejected (X)]  [All]

Pending Review = verificationStatus IN (
  'DOCUMENTS_SUBMITTED', 'VIDEO_KYC_DONE'
)

Table columns:
  | # | Name | City | Submitted | Experience | Documents | Video KYC | Action |
  
  - #: Row number
  - Name: Full name + phone (masked last 4)
  - City: Home city
  - Submitted: Relative time ("2 hours ago", "3 days ago")
  - Experience: "15 years"
  - Documents: Status indicator
      ✅ All submitted (Aadhaar front, back, selfie)
      ⚠️ Partial (shows which missing)
      ❌ None
  - Video KYC: Status indicator
      ✅ Video uploaded
      ❌ Not submitted
  - Action: [Review →] button → /pandits/{panditId}

Sort: Pending first, then by submission date (oldest first — FIFO).
Pagination: 20 per page.

Search bar: Search by name, phone, or city.

Summary stats at top:
  "X pandits awaiting review | Average wait: Y hours | 
   Oldest pending: Z days"

════════════════════════════════════════════════════════════════
PANDIT VERIFICATION DETAIL PAGE (/pandits/[panditId])
════════════════════════════════════════════════════════════════

apps/admin/app/pandits/[panditId]/page.tsx

Fetch: GET /api/admin/pandits/:panditId (returns full profile + 
documents + KYC submission)

SECTION 1 — Profile Summary (top card):
  Left: Profile photo (large, 120px)
  Right:
    Name: "Pt. Ramesh Sharma"
    Phone: "+91 98765-43210" [📞 Call] [📋 Copy]
    City: "Haridwar, Uttarakhand"
    Experience: "15 years"
    Registration Date: "20 Feb 2026"
    Verification Status: Badge (DOCUMENTS_SUBMITTED / VIDEO_KYC_DONE)
    Onboarding Complete: Yes/No

SECTION 2 — Personal & Professional Details:
  Two-column layout:
  LEFT:
    Date of Birth: "15 Jan 1975"
    Gender: "Male"
    Aadhaar (masked): "XXXX-XXXX-4321"
    PAN: "ABCDE1234F"
    Bio: Full text (scrollable if long)
  RIGHT:
    Puja Types: Pill list (Vivah, Griha Pravesh, Satyanarayan, ...)
    Languages: Pill list (Hindi, Sanskrit, ...)
    Vedic Degree: "Shastri"
    Gotra: "Bharadwaj"
    Certifications: List

SECTION 3 — Travel Preferences:
  - Willing to Travel: Yes/No
  - Max Distance: 500 km
  - Preferred Modes: Train, Cab
  - Local Service Radius: 25 km
  - Requires Accommodation: Yes
  - Requires Food Arrangement: Yes
  - Out of Delhi Available: Yes

SECTION 4 — Document Verification (CRITICAL):
  Three document viewer cards side by side:
  
  a) Aadhaar Front:
    - Thumbnail preview (click to expand full-screen modal)
    - Upload date
    - Admin verdict buttons:
      [✅ Looks Good] [❌ Unclear/Fake] [🔄 Request Re-upload]
  
  b) Aadhaar Back:
    Same as above
  
  c) Selfie with Aadhaar:
    Same as above + 
    Admin note: "Verify face matches Aadhaar photo"

  Each document verdict is stored independently. All 3 must be 
  ✅ for documents to pass.

  Full-screen modal (on thumbnail click):
    - Large image view with zoom (CSS transform scale)
    - Download button
    - Rotate buttons (90° CW/CCW)
    - Compare side-by-side (selfie vs Aadhaar photo)

SECTION 5 — Video KYC Review:
  Video player (HTML5 <video>) showing the uploaded KYC video.
  
  Below video, checklist for admin:
    ☐ Face clearly visible and matches Aadhaar photo
    ☐ Pandit stated their full name correctly
    ☐ Pandit stated their experience and city
    ☐ Mantra pronunciation is clear and correct
    ☐ Aadhaar card visible and held by the person
    ☐ No signs of impersonation or manipulation
  
  Admin must check ALL boxes to approve video KYC.
  
  Video verdict:
    [✅ Approved] [❌ Failed — Request Retake] [🔄 Unclear — Request New Video]

SECTION 6 — Bank Details:
  Account Holder: "Ramesh Sharma"
  Bank: "State Bank of India"
  Account Number: "XXXXXXXX4321" (masked)
  IFSC: "SBIN0001234"
  Account Type: "Savings"
  
  Admin note: "Bank details are NOT verified by platform. 
  Pandit is responsible for accuracy."

SECTION 7 — Samagri Packages:
  List of configured packages:
    Basic — ₹1,500 (6 items)
    Standard — ₹3,500 (12 items)
    Premium — Not configured

SECTION 8 — Admin Decision Panel (STICKY at bottom):
  
  Two-column layout:
  LEFT: Internal Notes (textarea)
    Placeholder: "Add internal notes about this verification..."
    These notes are only visible to admins, never to the pandit.
  
  RIGHT: Action Buttons (large, clearly colored):
    [✅ APPROVE PANDIT] — Green button
      On click: confirmation modal:
        "Approve Pt. Ramesh Sharma as a verified pandit?"
        "This will:"
        "• Set verification status to VERIFIED"
        "• Enable them to receive booking requests"
        "• Send them an SMS notification"
        [Confirm Approval] [Cancel]
      
      → PATCH /api/admin/pandits/:id/verify
      Body: { action: 'APPROVE', notes: string }
      Backend:
        1. Update verificationStatus = 'VERIFIED'
        2. Update profileCompletionPercent = 100
        3. Set verifiedAt = now(), verifiedBy = adminId
        4. Create activity log entry
        5. Send SMS: "[SMS to Pandit] बधाई हो! आपकी प्रोफाइल 
           वेरीफाई हो गई है। अब आप बुकिंग लेना शुरू कर सकते हैं। 
           -HmarePanditJi"
    
    [❌ REJECT] — Red button
      On click: rejection form modal:
        "Rejection Reason (shown to pandit):"
        Dropdown: 
          - "Documents unclear — please re-upload"
          - "Aadhaar mismatch with video"
          - "Video KYC does not meet requirements"
          - "Incomplete information"
          - "Suspected fake/duplicate account"
          - "Other (specify below)"
        Detailed reason: textarea
        [Confirm Rejection] [Cancel]
      
      → PATCH /api/admin/pandits/:id/verify
      Body: { action: 'REJECT', reason: string, notes: string }
      Backend:
        1. Update verificationStatus = 'REJECTED'
        2. Store rejectionReason
        3. Send SMS: "[SMS to Pandit] आपकी वेरीफिकेशन अस्वीकार 
           हुई है। कारण: [reason]. कृपया दोबारा कोशिश करें। 
           -HmarePanditJi"
    
    [📝 REQUEST MORE INFO] — Amber button
      On click: modal with message to pandit:
        Default: "कृपया निम्नलिखित दस्तावेज़ दोबारा अपलोड करें:"
        Checkboxes: 
          ☐ Aadhaar Front  ☐ Aadhaar Back  ☐ Selfie  ☐ Video KYC
          ☐ Other (text field)
        [Send Request] 
      
      → PATCH /api/admin/pandits/:id/verify
      Body: { action: 'REQUEST_INFO', requestedDocuments: string[], notes }
      Backend:
        1. Update verificationStatus = 'INFO_REQUESTED'
        2. Send SMS with specific ask

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS
════════════════════════════════════════════════════════════════

GET /api/admin/pandits?status=pending|verified|rejected|all&search=
  Returns: paginated list of pandits with profile summary + 
  document counts + KYC status

GET /api/admin/pandits/:panditId
  Returns: Full pandit profile + user data + documents + KYC + 
  bank details + samagri packages + internal admin notes

PATCH /api/admin/pandits/:panditId/verify
  Auth: ADMIN
  Body: { action: 'APPROVE'|'REJECT'|'REQUEST_INFO', 
          reason?, notes?, requestedDocuments? }
  Logic: Update verificationStatus, send notifications, log activity
```

---

### PROMPT 6.3 — ADMIN PAYOUT PROCESSING + CANCELLATION/REFUND + BOOKING MANAGEMENT

```
Build three interconnected admin screens:
1. Payout Queue — process pandit payouts after puja completion
2. Cancellation Queue — approve/reject customer cancellation requests, 
   process Razorpay refunds
3. All Bookings — comprehensive booking management with detail view

════════════════════════════════════════════════════════════════
PAYOUT QUEUE (/payouts)
════════════════════════════════════════════════════════════════

apps/admin/app/payouts/page.tsx

Tab filters:
  [💰 Pending (X)]  [✅ Completed (X)]  [All]

Pending = Payout records WHERE status = 'PENDING'
Completed = last 30 days WHERE status = 'COMPLETED'

────────────────────────────────────────
PENDING PAYOUT TABLE
────────────────────────────────────────

Table columns:
  | Booking | Pandit | Event | Completed | Amount | Bank | Action |

  - Booking: HPJ-XXXX (link to /bookings/{id})
  - Pandit: Name + city
  - Event: "विवाह पूजा — 15 Mar 2026"
  - Completed: "2 days ago" (relative from booking.completedAt)
  - Amount: "₹27,550" (pandit payout amount)
    Tooltip on hover showing breakdown:
      Dakshina (after 15% fee): ₹17,850
      Travel Reimbursement: ₹4,200
      Food Allowance: ₹3,000
      Samagri (if pandit brings): ₹5,500
      Minus platform samagri fee: -₹550
      Minus travel service fee: -₹210
      Minus TDS (if applicable): -₹0
      ─────────────
      Net Payout: ₹27,550
  - Bank: "SBI — XXXX4321" (masked account)
  - Action: [Process Payout]

────────────────────────────────────────
PROCESS PAYOUT MODAL
────────────────────────────────────────

On clicking [Process Payout]:

  Payout Summary Card:
    Pandit: "Pt. Ramesh Sharma"
    Booking: HPJ-XXXX
    Amount: ₹27,550
    Bank: State Bank of India
    Account: XXXXXXXX4321
    IFSC: SBIN0001234
    Account Holder: Ramesh Sharma
  
  Admin Fields:
    Payment Method: Select → "Bank Transfer (NEFT/IMPS)" | "UPI"
    Transaction Reference: text input (UTR number or UPI ref)
    Payment Date: date picker (default today)
    Notes: textarea (optional)
  
  [💰 Confirm Payout] button
    → PATCH /api/admin/payouts/:payoutId/complete
    Body: { 
      transactionRef, paymentMethod, paymentDate, notes 
    }
    Backend:
      1. Update Payout.status = 'COMPLETED'
      2. Update Payout.processedAt, transactionRef, processedBy
      3. Update Booking.payoutStatus = 'COMPLETED'
      4. Send SMS to Pandit:
         "[SMS] ₹27,550 आपके खाते में भेज दिया गया है। 
          Ref: [transactionRef]. Booking: HPJ-XXXX. 
          -HmarePanditJi"
      5. Create activity log

  Bulk Process:
    Checkbox on each row in table.
    "Process Selected (X)" button → processes one by one 
    with same transaction ref format.

────────────────────────────────────────
COMPLETED PAYOUTS TABLE
────────────────────────────────────────

Same columns plus:
  - Transaction Ref: "UTR123456789"
  - Processed: "12 Mar 2026, 3:45 PM"
  - Processed By: "Admin Name"

Export button: [📥 Export CSV] → generates CSV of completed payouts
  Columns: BookingID, PanditName, PanditPhone, Amount, BankAccount, 
           IFSC, TransactionRef, ProcessedDate

════════════════════════════════════════════════════════════════
CANCELLATION/REFUND QUEUE (/cancellations)
════════════════════════════════════════════════════════════════

apps/admin/app/cancellations/page.tsx

Shows bookings with status = 'CANCELLATION_REQUESTED'

Cancellation Policy (from Part 2, displayed as reference):
  > 7 days before event: 90% refund
  3–7 days: 50% refund
  1–3 days: 20% refund
  Same day: 0% refund
  Platform fee: NEVER refundable

────────────────────────────────────────
CANCELLATION TABLE
────────────────────────────────────────

Table:
  | Booking | Customer | Event Date | Requested | Days Until | 
  | Refund % | Refund Amount | Reason | Action |

  - Days Until: days between now and event date
  - Refund %: auto-calculated from policy
  - Refund Amount: grandTotal × refundPercent - platformFee
  - Reason: from customer's cancellation request

For each row: [Review & Process] button

────────────────────────────────────────
CANCELLATION DETAIL MODAL
────────────────────────────────────────

On click [Review & Process]:

  Booking Summary:
    HPJ-XXXX | Customer: Rajesh Kumar | Event: 15 Mar 2026
    Grand Total Paid: ₹84,789
    Platform Fee (non-refundable): ₹5,250
  
  Cancellation Details:
    Requested: 10 Mar 2026
    Event Date: 15 Mar 2026
    Days Until Event: 5 days
    Policy Applies: "3-7 days → 50% refund"
    Customer's Reason: "Family emergency"
  
  Refund Calculation (auto-calculated, admin can override):
    Grand Total: ₹84,789
    Platform Fee (non-refundable): -₹5,250
    Refundable Amount: ₹79,539
    Refund Percentage: 50%
    ─────────────
    Refund Amount: ₹39,770

  Admin Override Section:
    ☐ Override refund percentage
    Custom Refund Amount: number input (only if override checked)
    Override Reason: textarea (required if override)
  
  Admin Decision:
    [✅ Approve Cancellation & Process Refund]
      → POST /api/admin/bookings/:id/cancel-approve
      Body: { refundAmount, overrideReason? }
      Backend:
        1. Update booking.status = 'CANCELLED'
        2. Call Razorpay refund API:
           razorpay.payments.refund(paymentId, {
             amount: refundAmount * 100, // paise
             notes: { bookingId, reason }
           })
        3. Create refund record in database
        4. If pandit was assigned: release pandit's calendar
        5. If travel was booked: add admin note "Cancel travel bookings"
        6. Send SMS to Customer:
           "[SMS] Booking HPJ-XXXX cancelled. Refund of ₹39,770 
            will be credited in 5-7 business days. -HmarePanditJi"
        7. Send SMS to Pandit (if assigned):
           "[SMS] Booking HPJ-XXXX cancelled by customer. 
            Your calendar has been freed. -HmarePanditJi"
        8. Update booking.refundAmount, refundStatus = 'PROCESSING'
    
    [❌ Reject Cancellation]
      → POST /api/admin/bookings/:id/cancel-reject
      Body: { rejectionReason }
      Backend:
        1. Update booking.status back to previous status
        2. Send SMS to Customer:
           "[SMS] Your cancellation request for HPJ-XXXX was not 
            approved. Reason: [reason]. Contact support for help."

════════════════════════════════════════════════════════════════
ALL BOOKINGS (/bookings)
════════════════════════════════════════════════════════════════

apps/admin/app/bookings/page.tsx

Comprehensive booking list with filters.

Filter Bar:
  - Status: multi-select dropdown (all BookingStatus values)
  - Date Range: date range picker
  - City: dropdown
  - Pandit: searchable select
  - Customer: search by name/phone
  - Payment Status: dropdown
  - Travel Status: dropdown
  [Apply Filters] [Reset]

Table:
  | # | Booking ID | Customer | Pandit | Event | Date | Status | 
  | Amount | Payment | Travel | Actions |

  Clickable rows → /bookings/{bookingId}

Summary bar above table:
  "Showing X of Y bookings | Total GMV: ₹X,XX,XXX | 
   This month: ₹X,XX,XXX"

Export: [📥 Export CSV]

════════════════════════════════════════════════════════════════
BOOKING DETAIL PAGE (/bookings/[bookingId])
════════════════════════════════════════════════════════════════

apps/admin/app/bookings/[bookingId]/page.tsx

Full booking view for admin with all management capabilities.

Top Bar:
  Booking #: HPJ-XXXX
  Status: [CONFIRMED] badge (editable via dropdown for admin)
  Created: "10 Mar 2026, 2:30 PM"

SECTION 1 — Customer & Pandit Info:
  Two cards side by side.
  
  Customer Card:
    Name, Phone (full, clickable), Email
    Address (full)
    Gotra, Family details (if set)
  
  Pandit Card:
    Name, Phone (full, clickable)
    City, Verification Status
    Rating + total bookings
    [View Pandit Profile →]

SECTION 2 — Event Details:
  Puja Type, Date, Time, Duration
  Venue Address (full)
  Muhurat Details (if set)
  Special Instructions
  Samagri Choice: "Pandit's Standard Package — ₹3,500"

SECTION 3 — Price Breakdown:
  Full PriceBreakdown showing ALL components:
    Dakshina, Samagri, Travel, Food, Accommodation, Local Travel
    Platform Fees (each line), GST, Backup Guarantee, Grand Total
  
  Commission Breakdown:
    Platform Fee (15% of dakshina): ₹X
    Travel Fee (5% of travel): ₹X
    Samagri Fee (10% of samagri — only for custom list): ₹X
    Total Platform Revenue: ₹X

SECTION 4 — Travel Details:
  Travel Status: badge
  Route: From → To (distance)
  Selected Mode: Train/Flight/etc.
  Booking References: (if booked)
  Documents: links to uploaded tickets
  [Open in Travel Desk →]

SECTION 5 — Payment Information:
  Payment Status: CAPTURED / PENDING / FAILED
  Razorpay Order ID: ord_XXXXX
  Razorpay Payment ID: pay_XXXXX
  Paid At: datetime
  Amount: ₹84,789

  Payout Status: PENDING / COMPLETED
  Pandit Payout Amount: ₹27,550
  Payout Reference: (if completed)

SECTION 6 — Status Timeline:
  Use StatusTimeline component from packages/ui
  Shows ALL status transitions with timestamps and actor.

SECTION 7 — Admin Actions:
  Dropdown or button group:
    [📝 Update Status] → status dropdown 
      (only show valid next statuses)
    [👳 Reassign Pandit] → search for available pandit, reassign
      Logic:
        1. Open pandit search modal
        2. Filter by puja type, city/travel willingness, availability
        3. Select new pandit
        4. PATCH booking.panditId
        5. Set status back to PANDIT_REQUESTED
        6. Notify new pandit, notify customer of change
    [❌ Force Cancel] → admin cancellation with custom refund
    [📝 Add Internal Note] → note textarea (admin-only notes)

  Internal Notes Log:
    Chronological list of all admin notes for this booking.

════════════════════════════════════════════════════════════════
ADMIN SUPPORT LOG (/support) — BASIC
════════════════════════════════════════════════════════════════

apps/admin/app/support/page.tsx

Simple support ticket logging (Phase 1 is manual):

  [+ Log New Ticket] button → form:
    Source: Select → "Phone Call" | "WhatsApp" | "Email" | "In-App"
    Type: Select → "Booking Issue" | "Payment Issue" | "Travel Issue" 
          | "Pandit Complaint" | "Customer Complaint" | "General Inquiry"
    Related Booking: Search/link to booking (optional)
    Customer/Pandit: Search by phone (optional)
    Subject: text
    Description: textarea
    Priority: "Low" | "Medium" | "High" | "Critical"
    Status: "Open" | "In Progress" | "Resolved" | "Closed"
  
  Table of all tickets (sortable, filterable by status/priority):
    | # | Date | Source | Type | Subject | Related | Priority | Status | Action |
  
  Click row → detail view with resolution notes.
  
  This doesn't need a complex model — store as a simple 
  SupportTicket model in Prisma:
    model SupportTicket {
      id            String   @id @default(cuid())
      source        String
      type          String
      subject       String
      description   String
      priority      String   @default("MEDIUM")
      status        String   @default("OPEN")
      relatedBookingId String?
      relatedUserId    String?
      resolution    String?
      createdBy     String   // admin who logged it
      createdAt     DateTime @default(now())
      updatedAt     DateTime @updatedAt
    }

════════════════════════════════════════════════════════════════
ADMIN SETTINGS PAGE (/settings) — BASIC
════════════════════════════════════════════════════════════════

apps/admin/app/settings/page.tsx

Platform Configuration (editable by admin):
  Section: Commission Rates
    Platform Fee (% of Dakshina): number input, default 15
    Travel Service Fee (%): number input, default 5
    Samagri Service Fee (% — custom list only): number input, default 10
    Backup Guarantee Price: number input, default 9999
  
  Section: Food Allowance
    Daily Rate (₹): number input, default 1000
  
  Section: Cancellation Policy
    >7 days refund %: 90
    3-7 days refund %: 50
    1-3 days refund %: 20
    Same day refund %: 0
  
  Section: Notification Settings
    Mock Mode (development): toggle
    SMS Provider: "Twilio" (read-only in Phase 1)
  
  [Save Settings] → stored in a PlatformSettings table or .env

  NOTE: In Phase 1, these are mostly display-only. The actual 
  values are hardcoded in constants. This page is prep for Phase 2 
  when they become dynamic.

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS
════════════════════════════════════════════════════════════════

GET /api/admin/payouts?status=pending|completed
PATCH /api/admin/payouts/:payoutId/complete
  Body: { transactionRef, paymentMethod, paymentDate, notes }

GET /api/admin/cancellations (bookings with CANCELLATION_REQUESTED)
POST /api/admin/bookings/:id/cancel-approve
  Body: { refundAmount, overrideReason? }
  Calls Razorpay refund API
POST /api/admin/bookings/:id/cancel-reject
  Body: { rejectionReason }

GET /api/admin/bookings?status=&dateFrom=&dateTo=&city=&pandit=
  &customer=&paymentStatus=&travelStatus=&page=&limit=20
GET /api/admin/bookings/:bookingId (full detail with all relations)
PATCH /api/admin/bookings/:id/status
  Body: { status, notes }
PATCH /api/admin/bookings/:id/reassign
  Body: { newPanditId, reason }

GET /api/admin/support-tickets?status=&priority=&page=&limit=20
POST /api/admin/support-tickets
PATCH /api/admin/support-tickets/:id
```

---

## SPRINT 6B: CUSTOMER POST-BOOKING EXPERIENCE (Week 11–12)

---

### PROMPT 6.4 — CUSTOMER POST-BOOKING DASHBOARD + BOOKING CONFIRMATION + STATUS TIMELINE

```
Build the complete customer post-booking experience:
1. Booking Confirmation page (shown immediately after payment)
2. My Bookings list
3. Booking Detail page with tabs (Overview, Itinerary, Documents)
4. Puja Completion celebration screen

These live in the customer web app under a /dashboard route group 
that requires authentication.

════════════════════════════════════════════════════════════════
ROUTE & FILE STRUCTURE
════════════════════════════════════════════════════════════════

apps/web/app/dashboard/
├── layout.tsx                    # Dashboard layout with sidebar/nav
├── page.tsx                      # Redirects to /dashboard/bookings
├── bookings/
│   ├── page.tsx                  # My Bookings list
│   └── [bookingId]/
│       ├── page.tsx              # Booking Detail (tabbed)
│       ├── review/
│       │   └── page.tsx          # Write Review
│       └── cancel/
│           └── page.tsx          # Request Cancellation
├── favorites/
│   └── page.tsx                  # Saved Pandits
├── profile/
│   ├── page.tsx                  # Profile management
│   └── family/
│       └── page.tsx              # Family & Gotra setup
├── notifications/
│   └── page.tsx                  # Notification center
└── components/
    ├── DashboardNav.tsx          # Side/bottom navigation
    ├── BookingCard.tsx           # Booking list item
    ├── StatusTimeline.tsx        # Visual status tracker
    ├── ItineraryTimeline.tsx     # Travel + puja timeline
    ├── DocumentCard.tsx          # Downloadable document card
    ├── MuhuratPatrika.tsx        # Certificate generator
    └── PujaCompletionModal.tsx   # Celebration overlay

apps/web/app/booking-confirmed/
└── [bookingId]/
    └── page.tsx                  # Post-payment confirmation

════════════════════════════════════════════════════════════════
BOOKING CONFIRMATION PAGE (/booking-confirmed/[bookingId])
════════════════════════════════════════════════════════════════

Shown immediately after successful Razorpay payment callback.
This is a standalone page (not inside dashboard layout).

Layout:
  Large success animation (CSS confetti or checkmark animation):
  
  "🙏 बुकिंग सफल!" (Booking Successful!)
  
  Booking Card:
    Booking ID: HPJ-XXXX (large, copyable)
    Event: "विवाह पूजा"
    Date: "शनिवार, 15 मार्च 2026, सुबह 10:00 बजे"
    Pandit: "Pt. Ramesh Sharma" (with photo + rating)
    Amount Paid: "₹84,789"
    Payment ID: "pay_XXXXX"
  
  "What Happens Next" timeline:
    ✅ Payment received
    ⏳ Pandit will confirm within 6 hours
    ⏳ Travel will be arranged by our team
    ⏳ You'll receive itinerary details
    ⏳ Track Pandit's journey on event day
  
  Action Buttons:
    [📱 Share on WhatsApp] → opens WhatsApp with pre-filled message:
      "🙏 Puja booked via HmarePanditJi! 
       Event: [Puja Name] on [Date]
       Pandit: [Name] (4.8★ verified)
       Booking: HPJ-XXXX
       Download: https://hmarepanditji.com"
    
    [📋 Copy Booking Details] → copies formatted text
    
    [📊 View Dashboard →] → /dashboard/bookings/{bookingId}
    
    [🏠 Back to Home] → /

  Note at bottom:
    "SMS confirmation has been sent to your mobile number."

════════════════════════════════════════════════════════════════
DASHBOARD LAYOUT (DashboardNav.tsx)
════════════════════════════════════════════════════════════════

Desktop: Sidebar (left, 240px)
Mobile: Bottom navigation bar (fixed, 5 tabs)

Navigation items:
  📋 My Bookings    → /dashboard/bookings
  ❤️ Favorites      → /dashboard/favorites
  🔔 Notifications  → /dashboard/notifications + unread badge
  👤 Profile        → /dashboard/profile

Header: 
  "Namaste, [Name]!" + small avatar
  Bell icon with unread notification count

════════════════════════════════════════════════════════════════
MY BOOKINGS LIST (/dashboard/bookings)
════════════════════════════════════════════════════════════════

Tab filters:
  [All]  [Upcoming]  [Completed]  [Cancelled]

  Upcoming: status IN (CREATED, PANDIT_REQUESTED, CONFIRMED, 
            TRAVEL_BOOKED, PANDIT_EN_ROUTE, PANDIT_ARRIVED, 
            PUJA_IN_PROGRESS)
  Completed: COMPLETED
  Cancelled: CANCELLED, REFUNDED

For each booking — BookingCard.tsx:
  Left: Small event icon/emoji (🎊 for vivah, 🏠 for griha pravesh, etc.)
  Middle:
    "विवाह पूजा" (event name, bold)
    "शनिवार, 15 मार्च 2026" 
    "Pt. Ramesh Sharma" (pandit name, if assigned)
    Location: "दिल्ली"
  Right:
    Status badge (colored, using Badge from packages/ui):
      CREATED → 🟡 "Pending"
      PANDIT_REQUESTED → 🟡 "Awaiting Pandit"
      CONFIRMED → 🟢 "Confirmed"
      TRAVEL_BOOKED → 🔵 "Travel Ready"
      PANDIT_EN_ROUTE → 🔵 "Pandit On Way"
      PANDIT_ARRIVED → 🟢 "Pandit Arrived"
      PUJA_IN_PROGRESS → 🟢 "Puja Started"
      COMPLETED → ✅ "Completed"
      CANCELLED → 🔴 "Cancelled"
      REFUNDED → 🔴 "Refunded"
    Amount: "₹84,789"
  
  Click → /dashboard/bookings/{bookingId}

If no bookings:
  Empty state: "अभी तक कोई बुकिंग नहीं है"
  [Explore Pandits →] button

Pagination: Load more on scroll.
Fetch: GET /api/bookings/customer/my?status=&page=&limit=10

════════════════════════════════════════════════════════════════
BOOKING DETAIL PAGE (/dashboard/bookings/[bookingId])
════════════════════════════════════════════════════════════════

Tabbed interface with 3 tabs:
  [📋 Overview]  [🗺️ Itinerary]  [📄 Documents]

════════ TAB 1: Overview ════════

SECTION A — Status Banner:
  Full-width colored banner based on status:
    CONFIRMED: Blue "✅ Booking Confirmed — Pandit will arrive on [date]"
    TRAVEL_BOOKED: Blue "✈️ Travel Arranged — All set for [date]"
    PANDIT_EN_ROUTE: Amber "🚗 Pandit is on the way!"
    PANDIT_ARRIVED: Green "🙏 Pandit has arrived!"
    PUJA_IN_PROGRESS: Green "🕉️ Puja is happening..."
    COMPLETED: Green "✅ Puja Completed — Share your experience!"
    CANCELLED: Red "❌ Booking Cancelled"

SECTION B — Status Timeline (StatusTimeline.tsx):
  Vertical timeline showing all status transitions:
  Each step: circle (filled if passed, empty if pending) + label + time
  
  ● Payment Received — 10 Mar, 2:30 PM
  ● Pandit Confirmed — 10 Mar, 4:15 PM
  ● Travel Booked — 11 Mar, 10:00 AM
  ○ Pandit Started Journey — pending
  ○ Pandit Arrived — pending
  ○ Puja Started — pending
  ○ Puja Completed — pending
  
  For completed steps: show timestamp + brief note if available
  For current step: pulse animation
  
  Data from: GET /api/bookings/:id/status-history

SECTION C — Booking Details Card:
  Event: "विवाह पूजा"
  Date & Time: "शनिवार, 15 मार्च 2026, सुबह 10:00 बजे"
  Duration: "2 दिन"
  Venue: Full address + [📍 Open in Maps] link
  Muhurat: "शुभ मुहूर्त: 10:15 AM — 11:45 AM"
  Special Instructions: customer notes

SECTION D — Pandit Info Card:
  Photo (round, 60px) + Name + Rating (stars) + Verified badge
  Experience: "15 वर्ष"
  Specialization: pill list
  Phone: "+91 98765-XXXXX" 
    Show only if status >= CONFIRMED AND within 24 hours of event
    Otherwise: "Phone number will be visible closer to event date"
  [📞 Call] [💬 WhatsApp] buttons (if phone visible)
  [View Profile →] link

SECTION E — Price Breakdown:
  Use PriceBreakdown component from packages/ui
  Show ALL line items with GST

SECTION F — Action Buttons (based on status):
  If COMPLETED and no review: [⭐ Write Review]
  If status in [CREATED, CONFIRMED, TRAVEL_BOOKED]: 
    [❌ Cancel Booking] → /dashboard/bookings/{id}/cancel
  If COMPLETED: [🔄 Book Again with Same Pandit]

════════ TAB 2: Itinerary ════════

ItineraryTimeline.tsx — shown only for outstation bookings

Combined puja + travel timeline (Bhaag 12 requirement):

  Day 1 (Travel — 14 Mar):
    ┌─ 4:00 PM — Cab to station/airport
    │  🚕 "Ola Cab — Pickup from Haridwar"
    │  Reference: [if booked]
    │  
    ├─ 6:00 PM — Train departure
    │  🚂 "Shatabdi Express — Haridwar to Delhi"
    │  PNR: XXXXXXXX
    │  Coach: C2, Seat: 34
    │  
    ├─ 10:30 PM — Arrive Delhi
    │  🚕 Cab to hotel/venue
    │
    └─ 🍽️ Food Allowance: ₹1,000

  Day 2 (Puja — 15 Mar):
    ┌─ 9:00 AM — Cab from hotel to venue
    │  🚕 "Local cab arranged"
    │  
    ├─ 🕉️ 10:15 AM — MUHURAT WINDOW (highlighted box)
    │  ════════════════════
    │  विवाह पूजा
    │  शुभ मुहूर्त: 10:15 AM — 11:45 AM
    │  Venue: [Full address]
    │  ════════════════════
    │  
    └─ 🍽️ Food Allowance: ₹1,000 (if customer not providing meals)

  Day 3 (Return — 16 Mar):
    ┌─ 10:00 AM — Cab to station
    │  🚕 Return cab
    │  
    ├─ 12:00 PM — Train departure
    │  🚂 "Shatabdi Express — Delhi to Haridwar"
    │  PNR: YYYYYYYY
    │  
    └─ 🍽️ Food Allowance: ₹1,000

  For LOCAL bookings (no travel):
    Show just the puja timing:
    "15 मार्च 2026"
    ┌─ 🕉️ 10:15 AM — Muhurat Window
    │  [Puja details]
    └─ "Pandit will arrive 30 minutes before muhurat"

════════ TAB 3: Documents ════════

List of downloadable/viewable documents:

  📄 Booking Confirmation Receipt
    Auto-generated, always available
    [Download PDF] → generates PDF with booking details
  
  🕉️ Muhurat Patrika (Auspicious Timing Certificate)
    Available after CONFIRMED status
    [View Certificate] → opens MuhuratPatrika component
    [Download PDF] → generates PDF certificate
  
  🎫 Travel Tickets (if outstation)
    Shown only after TRAVEL_BOOKED
    Lists all uploaded travel documents from admin
    [View] [Download] for each
  
  🏨 Hotel Voucher (if platform booked)
    [View] [Download]
  
  🧾 Payment Receipt
    Razorpay payment receipt
    [Download PDF]
  
  📋 Pandit Verification Certificate
    Shows pandit's verified status document
    [View]

════════════════════════════════════════════════════════════════
PUJA COMPLETION CELEBRATION (PujaCompletionModal.tsx)
════════════════════════════════════════════════════════════════

When booking status changes to COMPLETED (detected by polling 
or when customer opens a completed booking for first time):

Full-screen overlay modal with:
  Large animation (CSS confetti + 🙏 emoji)
  
  "🙏 पूजा संपन्न हुई!"
  "Puja Completed Successfully!"
  
  Blessing message (hardcoded pool, random selection):
    "शुभ हो! भगवान आपकी सभी मनोकामनाएं पूरी करें।"
    OR "ॐ सर्वे भवन्तु सुखिनः। सभी सुखी हों।"
    OR "आपके परिवार पर सदा भगवान की कृपा बनी रहे।"
  
  Pandit: "Pt. Ramesh Sharma" (photo + name)
  
  Action buttons:
    [⭐ Rate Your Experience] → /dashboard/bookings/{id}/review
    [📜 View Muhurat Patrika] → opens certificate
    [📱 Share Blessings] → WhatsApp share
    [✕ Close] → dismiss modal, show booking detail

  Store in localStorage: `hpj_completion_seen_{bookingId}` 
  so modal shows only once.

════════════════════════════════════════════════════════════════
MUHURAT PATRIKA CERTIFICATE (MuhuratPatrika.tsx)
════════════════════════════════════════════════════════════════

This is a sharable digital certificate for the completed puja.
Renders as an HTML component AND can be exported as PDF/image.

Design:
  ┌──────────────────────────────────────────┐
  │  🕉️ OM Symbol (decorative header)        │
  │                                          │
  │  ═══ श्री मुहूर्त पत्रिका ═══           │
  │  (Auspicious Timing Certificate)         │
  │                                          │
  │  पूजा: विवाह संस्कार                     │
  │  दिनांक: 15 मार्च 2026                   │
  │  शुभ मुहूर्त: 10:15 AM — 11:45 AM       │
  │  तिथि: फाल्गुन शुक्ल पक्ष, द्वादशी     │
  │  नक्षत्र: रोहिणी                         │
  │  योग: सिद्धि                             │
  │                                          │
  │  कर्ता: [Customer Name]                   │
  │  गोत्र: [Gotra if set]                   │
  │  स्थान: [City]                           │
  │                                          │
  │  पुरोहित: Pt. [Pandit Name]              │
  │  अनुभव: [X] वर्ष | ⭐ [Rating]           │
  │                                          │
  │  ─────── 🙏 शुभम् भवतु 🙏 ───────       │
  │                                          │
  │  HmarePanditJi                           │
  │  Booking: HPJ-XXXX                       │
  │  Verified & Certified                    │
  └──────────────────────────────────────────┘

  Background: Subtle saffron/cream gradient with decorative 
  Sanskrit border pattern (CSS)
  
  Muhurat details (tithhi, nakshatra, yoga) pulled from 
  muhurat seed data matched to the booking date.
  
  [📥 Download as PDF] → uses html2canvas + jsPDF (or 
  server-side rendering via API endpoint)
  [📱 Share] → WhatsApp share with image

════════════════════════════════════════════════════════════════
BOOKING STATUS POLLING (Customer Side)
════════════════════════════════════════════════════════════════

Create a hook: useBookingStatusPolling(bookingId)
  - Polls GET /api/bookings/:id/status every 60 seconds
  - On status change: 
    - Update UI immediately
    - Show toast notification
    - If COMPLETED: trigger PujaCompletionModal
  - Stop polling when status is COMPLETED or CANCELLED

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS
════════════════════════════════════════════════════════════════

GET /api/bookings/customer/my?status=&page=&limit=10
  Auth: CUSTOMER
  Returns: paginated bookings for logged-in customer

GET /api/bookings/:id (existing, add full detail for owner)
GET /api/bookings/:id/status-history
  Returns: array of BookingStatusUpdate records, sorted by date

POST /api/bookings/:id/cancel-request
  Auth: CUSTOMER (must be booking owner)
  Body: { reason: string }
  Logic:
    1. Verify status allows cancellation (not COMPLETED/CANCELLED)
    2. Calculate refund estimate based on policy + days until event
    3. Set booking.status = 'CANCELLATION_REQUESTED'
    4. Create BookingStatusUpdate
    5. Notify admin: "[ADMIN] Cancellation request for HPJ-XXXX"
    6. Return { refundEstimate, refundPercent }
```

---

### PROMPT 6.5 — CUSTOMER REVIEWS + FAVORITES + PROFILE + FAMILY/GOTRA + NOTIFICATIONS

```
Build five customer dashboard sections:
1. Review Submission page
2. Favorites (saved pandits)
3. Profile Management
4. Family & Gotra Setup
5. Notification Center

════════════════════════════════════════════════════════════════
REVIEW SUBMISSION (/dashboard/bookings/[bookingId]/review)
════════════════════════════════════════════════════════════════

apps/web/app/dashboard/bookings/[bookingId]/review/page.tsx

Only accessible when booking status = COMPLETED AND no review exists.

Layout:
  Header: "⭐ Rate Your Experience"
  Subtitle: "Your feedback helps other customers and motivates Pandit Ji"

  Pandit Card (compact):
    Photo + Name + Event + Date

  Rating Categories (each is a 5-star interactive row):
    ⭐ Overall Experience (required)
    ⭐ Knowledge & Expertise
    ⭐ Punctuality
    ⭐ Communication
    ⭐ Value for Money

    Star implementation:
      5 star icons in a row. Click to select. 
      Hollow = unselected, Filled amber = selected.
      Show label next to selected count: 
        1★ "Poor", 2★ "Fair", 3★ "Good", 4★ "Very Good", 5★ "Excellent"

  Written Review:
    Textarea: "Share your experience in detail..."
    Min: 20 chars, Max: 500 chars
    Character counter shown

  Photo Upload (optional):
    "Add photos from the puja" (with customer's consent)
    Upload up to 3 images
    Accept: jpg, png. Max 5MB each.
    POST /api/upload/review-photo

  Toggle: ☐ "Submit anonymously" (hides customer name from pandit)

  [🙏 Submit Review] button
    → POST /api/reviews
    Body: {
      bookingId,
      ratings: {
        overall: number,      // 1-5, required
        knowledge: number,    // 1-5, optional
        punctuality: number,
        communication: number,
        valueForMoney: number
      },
      comment: string,
      photoUrls: string[],
      isAnonymous: boolean
    }
    Backend:
      1. Create Review record
      2. Update PanditProfile.rating (recalculate average)
      3. Update PanditProfile.totalReviews (increment)
      4. Notify pandit: "[SMS] New 5-star review for HPJ-XXXX! 
         Check your app. -HmarePanditJi"
    
    On success: 
      Show success screen with "🙏 Thank you for your review!"
      Redirect to booking detail after 3 seconds

════════════════════════════════════════════════════════════════
CANCELLATION REQUEST (/dashboard/bookings/[bookingId]/cancel)
════════════════════════════════════════════════════════════════

apps/web/app/dashboard/bookings/[bookingId]/cancel/page.tsx

Layout:
  Warning card (red border):
    "⚠️ Are you sure you want to cancel this booking?"
  
  Booking Summary:
    HPJ-XXXX | Event | Date | Pandit | Amount Paid

  Refund Estimate (auto-calculated from policy):
    Days until event: X
    Policy: "[X] days → [Y]% refund"
    
    Grand Total Paid: ₹84,789
    Platform Fee (non-refundable): ₹5,250
    Refundable Amount: ₹79,539
    Refund Percentage: 50%
    ─────────
    Estimated Refund: ₹39,770
    
    "Note: Refund will be credited within 5-7 business days 
     after approval."

  Reason (required):
    Radio options:
      ○ "Date/time change needed"
      ○ "Found a different pandit"  
      ○ "Personal/family reasons"
      ○ "Financial reasons"
      ○ "Event postponed"
      ○ "Other" (shows text input)
  
  Additional Comments: textarea (optional)

  [❌ Confirm Cancellation] → POST /api/bookings/:id/cancel-request
  [← Go Back] → return to booking detail

  On success:
    "Cancellation request submitted. Our team will review and 
     process your refund within 24 hours."
    Redirect to booking detail showing CANCELLATION_REQUESTED status

════════════════════════════════════════════════════════════════
FAVORITES (/dashboard/favorites)
════════════════════════════════════════════════════════════════

apps/web/app/dashboard/favorites/page.tsx

Grid of favorited pandits (3 cols desktop, 2 cols tablet, 1 col mobile).

Fetch: GET /api/customers/me/favorites

Each card:
  Photo + Name + Verified badge
  Rating: "4.8 ★ (47 reviews)"
  City: "Haridwar"
  Specializations: pill chips (max 3 + "+X more")
  Experience: "15 years"
  
  Buttons:
    [Book Again →] → /pandits/{panditId} (profile page)
    [❤️ Remove] → DELETE /api/customers/me/favorites/{panditId}
      Confirmation: "Remove from favorites?"

If no favorites:
  Empty state: "आपने अभी तक कोई पंडित जी सेव नहीं किया है"
  [Explore Pandits →] → /search

Backend:
  POST /api/customers/me/favorites (add)
    Body: { panditId }
  DELETE /api/customers/me/favorites/:panditId (remove)
  GET /api/customers/me/favorites (list with pandit details)

  Model (if not already in schema):
    model Favorite {
      id       String @id @default(cuid())
      userId   String
      panditId String
      createdAt DateTime @default(now())
      user     User @relation(fields: [userId])
      pandit   PanditProfile @relation(fields: [panditId])
      @@unique([userId, panditId])
    }

════════════════════════════════════════════════════════════════
PROFILE MANAGEMENT (/dashboard/profile)
════════════════════════════════════════════════════════════════

apps/web/app/dashboard/profile/page.tsx

SECTION A — Personal Details (editable):
  Name: text input
  Email: text input (optional)
  Phone: "+91 XXXXX-XXXXX" (read-only, verified)
  Preferred Languages: multi-select pills from SUPPORTED_LANGUAGES
  
  [Save Changes] → PUT /api/auth/me

SECTION B — Saved Addresses:
  List of addresses with [Edit] [Delete] [Set as Primary] actions.
  
  [+ Add New Address] → expandable form:
    Label: "Home" / "Office" / "Temple" / "Other"
    Full Address: textarea
    City: dropdown
    State: auto-fill
    PIN Code: 6-digit input
    Landmark: text (optional)
    ☐ Set as Primary Address
  
  Save → POST /api/customers/me/addresses
  Edit → PUT /api/customers/me/addresses/:id
  Delete → DELETE /api/customers/me/addresses/:id

SECTION C — Account Actions:
  [🔔 Notification Preferences] → link
  [👨‍👩‍👧‍👦 Family & Gotra] → /dashboard/profile/family
  [🔐 Delete Account] → confirmation modal (soft delete)

════════════════════════════════════════════════════════════════
FAMILY & GOTRA SETUP (/dashboard/profile/family)
════════════════════════════════════════════════════════════════

apps/web/app/dashboard/profile/family/page.tsx

Bhaag 12 requires gotra and family details for personalized pujas.

SECTION A — Gotra Information:
  "गोत्र (Gotra):" 
  Searchable select with common gotras:
    Bharadwaj, Kashyap, Vashisht, Atri, Gautam, Jamadagni, 
    Vishwamitra, Agastya, Angiras, Bhrigu, Parashara, Sandilya,
    Kaushik, Shandilya, Garg, Mudgal, Other (text input)
  
  "कुल देवता (Kul Devata — Family Deity):"
  Text input, optional. Placeholder: "e.g., Shri Ganesh, Durga Mata"
  
  Note: "यह जानकारी पंडित जी को पूजा में सही मंत्रों के 
  चयन में मदद करती है।"

SECTION B — Family Members:
  Dynamic list of family members.
  
  [+ Add Family Member] → form:
    Name: text
    Relation: select (Spouse, Son, Daughter, Father, Mother, 
              Brother, Sister, Grandfather, Grandmother, Other)
    Date of Birth: date picker (optional)
    Nakshatra (Birth Star): select from list (optional)
    Rashi (Zodiac): select from 12 rashis (optional)
  
  Existing members shown as cards with [Edit] [Delete] options.
  
  Store in User profile as JSON (familyMembers array) or 
  create a FamilyMember model:
    model FamilyMember {
      id        String @id @default(cuid())
      userId    String
      name      String
      relation  String
      dob       DateTime?
      nakshatra String?
      rashi     String?
      user      User @relation(fields: [userId])
    }

════════════════════════════════════════════════════════════════
NOTIFICATION CENTER (/dashboard/notifications)
════════════════════════════════════════════════════════════════

apps/web/app/dashboard/notifications/page.tsx

Simple notification list (in-app storage, no push in Phase 1).

Fetch: GET /api/notifications?page=&limit=20

Each notification card:
  Icon (based on type) + Title + Message + Time (relative)
  Unread: bold text, blue left border
  Read: normal text, no border
  
  Click → marks as read + navigates to relevant page

Notification types:
  📋 BOOKING: "Booking HPJ-XXXX confirmed!"
    → /dashboard/bookings/{id}
  ✈️ TRAVEL: "Travel arranged for your booking"
    → /dashboard/bookings/{id} (itinerary tab)
  🚗 STATUS: "Pandit has started journey"
    → /dashboard/bookings/{id}
  💳 PAYMENT: "Payment of ₹84,789 received"
    → /dashboard/bookings/{id}
  ⭐ REVIEW: "Thank you for your review!"
    → /dashboard/bookings/{id}/review
  📢 SYSTEM: "Welcome to HmarePanditJi!"
    → no link

[Mark All as Read] button at top.

Backend model:
  model Notification {
    id        String   @id @default(cuid())
    userId    String
    type      String   // BOOKING, TRAVEL, STATUS, PAYMENT, REVIEW, SYSTEM
    title     String
    message   String
    data      Json?    // { bookingId?, panditId?, etc. }
    isRead    Boolean  @default(false)
    createdAt DateTime @default(now())
    user      User     @relation(fields: [userId])
  }

Endpoints:
  GET /api/notifications?page=&limit=20&unreadOnly=
  PATCH /api/notifications/:id/read
  PATCH /api/notifications/read-all

════════════════════════════════════════════════════════════════
BACKEND: REVIEW + FAVORITE + NOTIFICATION ENDPOINTS
════════════════════════════════════════════════════════════════

POST /api/reviews
  Auth: CUSTOMER
  Body: { bookingId, ratings, comment, photoUrls, isAnonymous }
  Logic:
    1. Verify booking belongs to customer
    2. Verify booking status = COMPLETED
    3. Verify no existing review for this booking
    4. Create Review record
    5. Recalculate pandit rating:
       newAvg = (oldAvg * totalReviews + newRating) / (totalReviews + 1)
    6. Update PanditProfile.rating and totalReviews
    7. Create notification for pandit
    8. Log SMS console

GET /api/pandits/:id/reviews?page=&limit=10
  Public endpoint. Returns reviews for a pandit.

POST /api/customers/me/favorites
  Body: { panditId }
DELETE /api/customers/me/favorites/:panditId
GET /api/customers/me/favorites

POST /api/customers/me/addresses
PUT /api/customers/me/addresses/:id
DELETE /api/customers/me/addresses/:id
GET /api/customers/me/addresses

PUT /api/customers/me/family
  Body: { gotra, kulDevata, familyMembers[] }

GET /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

## SPRINT 6C: NOTIFICATIONS + LAUNCH READINESS (Week 12)

---

### PROMPT 7.1 — NOTIFICATION SERVICE + PUJA COMPLETION TRIGGERS + PANDIT-TO-CUSTOMER REVIEW

```
Build the centralized notification service that triggers SMS 
notifications (console-logged in Phase 1) at every critical 
point in the booking lifecycle. Also implement the pandit's 
ability to rate customers.

════════════════════════════════════════════════════════════════
NOTIFICATION SERVICE
════════════════════════════════════════════════════════════════

File: services/api/src/services/notification.service.ts

export class NotificationService {
  
  /**
   * Core send method. In Phase 1 (MOCK_NOTIFICATIONS=true),
   * logs to console. In production, uses Twilio SMS.
   */
  async sendSMS(to: string, message: string): Promise<void> {
    if (process.env.MOCK_NOTIFICATIONS === 'true') {
      console.log(`\n[📱 SMS to ${to}]:\n${message}\n`);
      return;
    }
    // Twilio integration (prep for Phase 2):
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({ body: message, from: twilioNumber, to });
  }

  /**
   * Creates in-app notification record AND sends SMS.
   */
  async notify(params: {
    userId: string,
    type: string,
    title: string,
    message: string,
    smsMessage?: string,  // SMS text (can differ from in-app)
    data?: any,
    sendSMS?: boolean
  }): Promise<void> {
    // 1. Create Notification record in DB
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data || {},
      }
    });
    
    // 2. Send SMS if requested
    if (params.sendSMS !== false && params.smsMessage) {
      const user = await prisma.user.findUnique({ 
        where: { id: params.userId } 
      });
      if (user?.phone) {
        await this.sendSMS(user.phone, params.smsMessage);
      }
    }
  }
}

════════════════════════════════════════════════════════════════
NOTIFICATION TEMPLATES (Hinglish)
════════════════════════════════════════════════════════════════

File: services/api/src/services/notification-templates.ts

Each template is a function that returns { title, message, smsMessage }.

1. BOOKING_CREATED (→ Customer):
   Title: "Booking Created!"
   SMS: "🙏 Booking HPJ-{id} created! {pujaType} on {date}. 
         Pandit ji will confirm within 6 hours. -HmarePanditJi"

2. NEW_BOOKING_REQUEST (→ Pandit):
   Title: "New Booking Request!"
   SMS: "🔔 Nayi booking aayi hai! {pujaType}, {date}, {city}. 
         Kamai: ₹{amount}. 6 ghante mein jawab dein. 
         App kholein: [link] -HmarePanditJi"

3. BOOKING_CONFIRMED (→ Customer):
   Title: "Pandit Confirmed!"
   SMS: "✅ Booking HPJ-{id} confirmed! Pt. {panditName} will 
         perform {pujaType} on {date}. -HmarePanditJi"

4. BOOKING_CONFIRMED_ACK (→ Pandit):
   Title: "Booking Accepted!"
   SMS: "✅ Aapne booking HPJ-{id} accept ki. {date} ko {city} 
         mein {pujaType}. Yatra ki jankari jald milegi. 
         -HmarePanditJi"

5. TRAVEL_BOOKED (→ Customer):
   Title: "Travel Arranged!"
   SMS: "✈️ HPJ-{id}: Pandit ji ki yatra book ho gayi! 
         {travelMode} — {details}. Track in app. -HmarePanditJi"

6. TRAVEL_BOOKED_PANDIT (→ Pandit):
   Title: "Travel Booked!"
   SMS: "🎫 HPJ-{id}: Aapki yatra book! {mode} — {details}. 
         PNR/Ref: {reference}. App mein full plan dekhein. 
         -HmarePanditJi"

7. PANDIT_EN_ROUTE (→ Customer):
   Title: "Pandit on the way!"
   SMS: "🚗 Pandit ji yatra shuru kar chuke hain! HPJ-{id}. 
         Dashboard mein status dekhein. -HmarePanditJi"

8. PANDIT_ARRIVED (→ Customer):
   Title: "Pandit has arrived!"
   SMS: "🙏 Pandit ji pahunch gaye hain! Puja ki taiyari 
         shuru karen. HPJ-{id}. -HmarePanditJi"

9. PUJA_COMPLETED (→ Customer):
   Title: "Puja Completed!"
   SMS: "🙏 Puja sampann hui! HPJ-{id}. Apna anubhav batayein — 
         review dein app mein. Shubh ho! -HmarePanditJi"

10. PUJA_COMPLETED_PANDIT (→ Pandit):
    Title: "Puja Complete — Payout Queued"
    SMS: "🙏 Puja HPJ-{id} poori hui! ₹{amount} ka payment 
          24-48 ghante mein aapke account mein aayega. 
          -HmarePanditJi"

11. PAYMENT_CAPTURED (→ Customer):
    Title: "Payment Received"
    SMS: "💳 ₹{amount} payment received for HPJ-{id}. 
          Receipt in app. -HmarePanditJi"

12. PAYOUT_COMPLETED (→ Pandit):
    Title: "Payment Received!"
    SMS: "💰 ₹{amount} aapke bank account mein bhej diya gaya! 
          Ref: {transactionRef}. HPJ-{id}. -HmarePanditJi"

13. CANCELLATION_REQUESTED (→ Admin only, console):
    "[ADMIN] Cancellation request: HPJ-{id} by {customerName}. 
     Reason: {reason}. Review needed."

14. CANCELLATION_APPROVED (→ Customer):
    Title: "Booking Cancelled"
    SMS: "❌ HPJ-{id} cancelled. Refund ₹{refundAmount} will be 
          credited in 5-7 days. -HmarePanditJi"

15. CANCELLATION_APPROVED_PANDIT (→ Pandit):
    Title: "Booking Cancelled"
    SMS: "❌ HPJ-{id} customer ne cancel kiya. Aapka calendar 
          free ho gaya. -HmarePanditJi"

16. VERIFICATION_APPROVED (→ Pandit):
    Title: "Profile Verified!"
    SMS: "🎉 Badhai ho! Aapki profile verify ho gayi. Ab aap 
          booking le sakte hain. -HmarePanditJi"

17. VERIFICATION_REJECTED (→ Pandit):
    Title: "Verification Update"
    SMS: "⚠️ Verification update: {reason}. Kripya dobara 
          koshish karein. -HmarePanditJi"

18. REVIEW_RECEIVED (→ Pandit):
    Title: "New Review!"
    SMS: "⭐ Nayi {rating}-star review mili! HPJ-{id}. 
          App mein dekhein. -HmarePanditJi"

19. REVIEW_REMINDER (→ Customer, 24h after completion):
    Title: "Rate your experience"
    SMS: "🙏 HPJ-{id} ke baare mein apna experience batayein! 
          Review dein app mein. -HmarePanditJi"

════════════════════════════════════════════════════════════════
INTEGRATION POINTS — Wire notifications into existing code
════════════════════════════════════════════════════════════════

Update the following existing controller methods to call 
NotificationService.notify():

1. bookingController.createBooking → templates 1, 2
2. panditBookingController.acceptBooking → templates 3, 4
3. panditBookingController.declineBooking → template 13
4. adminController.updateTravelBooked → templates 5, 6
5. panditBookingController.updateStatus('PANDIT_EN_ROUTE') → 7
6. panditBookingController.updateStatus('PANDIT_ARRIVED') → 8
7. panditBookingController.completeBooking → templates 9, 10
8. paymentController.handlePaymentSuccess → template 11
9. adminController.completePayout → template 12
10. adminController.cancelApprove → templates 14, 15
11. adminController.verifyPandit('APPROVE') → template 16
12. adminController.verifyPandit('REJECT') → template 17
13. reviewController.createReview → template 18

Also create a simple scheduled function (can be a setInterval 
on server start for Phase 1):

  Review Reminder Job:
    Every hour, query bookings WHERE:
      status = 'COMPLETED' 
      AND completedAt < now() - 24 hours
      AND completedAt > now() - 25 hours
      AND no Review exists for this booking
    For each: send template 19

════════════════════════════════════════════════════════════════
PANDIT-TO-CUSTOMER REVIEW
════════════════════════════════════════════════════════════════

Bhaag 12: "Pandit can rate the customer on punctuality, 
hospitality, and food arrangements."

Add to pandit's booking completion flow (in Part 3's prompt 4.3, 
after "Puja Complete" status update):

  After marking puja complete, show a BOTTOM SHEET on the 
  pandit's booking detail page:

  "ग्राहक को रेट करें" (Rate the Customer)
  
  Three rating categories (1-5 stars each):
    ⭐ समय पर तैयारी (Punctuality/Preparation)
    ⭐ आतिथ्य (Hospitality)  
    ⭐ खाने की व्यवस्था (Food Arrangements)
  
  Comments: textarea (optional, Hindi encouraged)
  
  [Submit Rating] → POST /api/pandit/bookings/:id/rate-customer
  [Skip] → dismiss (don't force)

  Backend:
    Create a CustomerRating model:
      model CustomerRating {
        id          String   @id @default(cuid())
        bookingId   String   @unique
        panditId    String
        customerId  String
        punctuality Int      // 1-5
        hospitality Int      // 1-5
        foodArrangement Int  // 1-5
        comment     String?
        createdAt   DateTime @default(now())
      }
    
    These ratings are internal — visible to pandits when they 
    see a repeat customer's booking, but NOT visible to other 
    customers or publicly.
```

---

### PROMPT 7.2 — SEO + LEGAL PAGES + ERROR BOUNDARIES + SEED DATA + LAUNCH CHECKLIST

```
Final launch preparation — SEO, legal compliance, error handling, 
test data, and a checklist page.

════════════════════════════════════════════════════════════════
SEO OPTIMIZATION (Customer Web App)
════════════════════════════════════════════════════════════════

1. Root Metadata (apps/web/app/layout.tsx):
   
   export const metadata = {
     title: {
       template: '%s | HmarePanditJi',
       default: 'HmarePanditJi — Book Verified Pandits for Puja Online',
     },
     description: 'Book verified Pandits online for all Hindu ceremonies — 
       Vivah, Griha Pravesh, Satyanarayan Puja & more. Transparent pricing, 
       managed travel, verified priests. Delhi-NCR.',
     keywords: ['pandit booking', 'online puja booking', 'hindu priest', 
       'vivah pandit', 'griha pravesh', 'delhi pandit', 'verified pandit',
       'puja at home', 'muhurat', 'pandit near me'],
     openGraph: {
       type: 'website',
       locale: 'en_IN',
       url: 'https://hmarepanditji.com',
       siteName: 'HmarePanditJi',
       title: 'HmarePanditJi — Book Verified Pandits Online',
       description: 'India\'s trusted platform for booking verified 
         Pandits. Transparent pricing, travel managed, 500+ priests.',
       images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
     },
     twitter: {
       card: 'summary_large_image',
       title: 'HmarePanditJi — Book Verified Pandits Online',
       description: 'Book verified Pandits for any Hindu ceremony.',
     },
     robots: { index: true, follow: true },
     alternates: { canonical: 'https://hmarepanditji.com' },
   };

2. JSON-LD Structured Data (in layout.tsx <head>):
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "LocalBusiness",
     "name": "HmarePanditJi",
     "description": "Online platform for booking verified Hindu priests",
     "url": "https://hmarepanditji.com",
     "areaServed": "Delhi-NCR, India",
     "priceRange": "₹₹",
     "address": {
       "@type": "PostalAddress",
       "addressLocality": "Delhi",
       "addressCountry": "IN"
     }
   }
   </script>

3. Generate robots.txt (apps/web/public/robots.txt):
   User-agent: *
   Allow: /
   Disallow: /dashboard/
   Disallow: /login
   Disallow: /api/
   Sitemap: https://hmarepanditji.com/sitemap.xml

4. Generate sitemap.xml (apps/web/app/sitemap.ts):
   Dynamic sitemap including:
     - / (homepage)
     - /search
     - /muhurat-explorer
     - /pandits/:id (all verified pandit profiles)
     - /terms, /privacy, /cancellation-policy, /about

5. Per-page metadata for key pages:
   - /search: "Find Pandits Near You | HmarePanditJi"
   - /muhurat-explorer: "Muhurat Calendar 2026 — Auspicious Dates"
   - /pandits/[id]: "[Pandit Name] — Verified Pandit | HmarePanditJi"

════════════════════════════════════════════════════════════════
LEGAL PAGES (apps/web/app/(legal)/)
════════════════════════════════════════════════════════════════

Create a (legal) route group with shared layout (minimal header, 
no search bar, just logo + back button).

1. /terms — Terms of Service:
   Markdown-rendered page covering:
   - Platform overview and role
   - User eligibility
   - Account creation and verification
   - Booking process and obligations
   - Payment terms (advance payment, commission structure)
   - Cancellation and refund policy (link to /cancellation-policy)
   - Platform's role as intermediary (not employer of pandits)
   - Liability limitations
   - Intellectual property
   - Governing law (India, Delhi jurisdiction)
   - Contact information
   
   Use static markdown converted to HTML. Placeholder content 
   is fine — mark with "[LEGAL REVIEW NEEDED]" tags.

2. /privacy — Privacy Policy:
   - Data collection (phone, name, address, payment info)
   - How data is used (matching, communications, improvement)
   - Data sharing (with assigned pandit, payment processor)
   - Aadhaar handling (encrypted, not stored in plain text)
   - Cookies and analytics
   - User rights (access, deletion, correction)
   - Contact: privacy@hmarepanditji.com

3. /cancellation-policy — Cancellation & Refund Policy:
   Clear table format:
   | Cancellation Time | Refund Amount |
   | >7 days before event | 90% of total (excl. platform fee) |
   | 3-7 days | 50% |
   | 1-3 days | 20% |
   | Same day | 0% |
   
   Platform fee is non-refundable.
   Refund timeline: 5-7 business days.
   How to cancel: through dashboard or contact support.

4. /about — About HmarePanditJi:
   - Mission: "Sanskriti ko Digital Disha"
   - What we do
   - Why we're different (verified pandits, travel managed, 
     transparent pricing)
   - Trust & safety (verification process)
   - Contact information
   - Social links (placeholder)

════════════════════════════════════════════════════════════════
ERROR BOUNDARIES + 404 PAGES
════════════════════════════════════════════════════════════════

For ALL three apps (web, pandit, admin):

1. Global Error Boundary (app/error.tsx in each):
   'use client'
   Shows friendly error message:
     "Something went wrong 😕"
     [Try Again] button (calls reset())
     [Go Home] link
   
   Log error to console (Phase 1).

2. Not Found Page (app/not-found.tsx in each):
   Custom 404 page:
     "Page not found 🔍"
     "The page you're looking for doesn't exist."
     [Go to Homepage] button
   
   Different messaging per app:
     Web: "Explore our services" + search bar
     Pandit: "Go to Dashboard"
     Admin: "Go to Dashboard"

3. Loading States (app/loading.tsx in each):
   Skeleton loaders using packages/ui Skeleton component.
   Full-page skeleton for route transitions.

4. API Error Handling:
   In services/api, ensure all controllers have try-catch 
   with proper error responses:
   { error: string, statusCode: number, details?: any }
   
   Global error handler middleware:
   app.use((err, req, res, next) => {
     console.error('[API Error]', err);
     res.status(err.statusCode || 500).json({
       error: err.message || 'Internal Server Error',
       statusCode: err.statusCode || 500,
     });
   });

════════════════════════════════════════════════════════════════
COMPLETE SEED DATA FOR E2E TESTING
════════════════════════════════════════════════════════════════

Update prisma/seed.ts to create comprehensive test data:

1. USERS (8 total):
   - Admin: phone '9000000001', role ADMIN, name "HPJ Admin"
   - Customer 1: phone '9000000002', role CUSTOMER, name "Rajesh Kumar"
     Has: 2 addresses (Delhi, Noida), gotra "Bharadwaj", 
          2 family members
   - Customer 2: phone '9000000003', role CUSTOMER, name "Priya Sharma"
   - Customer 3: phone '9000000004', role CUSTOMER, name "Vinod Gupta"
   - Pandit 1 (Verified): phone '9876543210', name "Pt. Ramesh Sharma"
     City: Delhi, 15yr exp, VERIFIED, rating 4.8, 47 reviews
     Travel: willing, 500km max, TRAIN+CAB
     3 samagri packages (Basic, Standard, Premium)
   - Pandit 2 (Verified): phone '9876543211', name "Pt. Suresh Tiwari"
     City: Haridwar, 25yr exp, VERIFIED, rating 4.6, 23 reviews
     Travel: willing, 1000km max, TRAIN+FLIGHT+CAB
   - Pandit 3 (Pending): phone '9876543212', name "Pt. Vinod Kumar"
     City: Varanasi, 8yr exp, DOCUMENTS_SUBMITTED
   - Pandit 4 (Rejected): phone '9876543213', name "Pt. Mohan Lal"
     City: Jaipur, 3yr exp, REJECTED

2. BOOKINGS (6 total, covering all statuses):
   - HPJ-001: Customer 1 → Pandit 1, COMPLETED, Satyanarayan, Delhi
     Local booking, paid, puja done, payout COMPLETED
   - HPJ-002: Customer 1 → Pandit 2, CONFIRMED, Vivah, Delhi
     Outstation (Haridwar→Delhi), travel PENDING, event in 5 days
   - HPJ-003: Customer 2 → Pandit 1, TRAVEL_BOOKED, Griha Pravesh
     Travel booked, event in 2 days
   - HPJ-004: Customer 3 → Pandit 2, PANDIT_REQUESTED, Mundan
     Awaiting pandit confirmation
   - HPJ-005: Customer 2 → Pandit 1, CANCELLED, Satyanarayan
     Cancelled by customer, refund processed
   - HPJ-006: Customer 3 → Pandit 1, CREATED, Annaprashan
     Just created, payment pending

3. REVIEWS (3):
   - Customer 1 → Pandit 1 for HPJ-001: 5 stars overall
   - Customer 2 → Pandit 2 for a past booking: 4 stars
   - Customer 3 → Pandit 1 for a past booking: 5 stars

4. PAYOUTS (2):
   - HPJ-001: COMPLETED, ₹15,000, ref "UTR123456"
   - HPJ-003: PENDING, ₹27,550

5. NOTIFICATIONS (5+):
   - Sample notifications for Customer 1 and Pandit 1

6. STATUS UPDATES (for each booking):
   - Complete BookingStatusUpdate history

7. FAVORITES:
   - Customer 1 favorites Pandit 1 and Pandit 2
   - Customer 2 favorites Pandit 1

8. MUHURAT DATA:
   - Ensure muhurat seed covers next 6 months
   - At least 5 auspicious dates per month
   - Multiple puja types per date

════════════════════════════════════════════════════════════════
LAUNCH CHECKLIST (Admin Page)
════════════════════════════════════════════════════════════════

apps/admin/app/settings/launch-checklist/page.tsx

A manual checklist for the team before going live.
Each item has a checkbox (state stored in localStorage for now).

PLATFORM READINESS:
  ☐ 10+ pandits onboarded and VERIFIED
  ☐ Muhurat data loaded for next 6 months
  ☐ All puja types have at least 2 verified pandits
  ☐ Platform fee rates configured correctly
  ☐ Cancellation policy matches legal page

PAYMENT:
  ☐ Razorpay switched from test to live mode
  ☐ Razorpay webhook endpoint verified
  ☐ Test payment → refund cycle completed
  ☐ GST details configured in Razorpay

NOTIFICATIONS:
  ☐ Twilio credentials configured (or mock mode confirmed)
  ☐ All 19 notification templates verified
  ☐ SMS sender ID registered

TECHNICAL:
  ☐ All 3 apps build successfully (npm run build)
  ☐ Database migrations applied to production
  ☐ Seed data NOT applied to production
  ☐ Environment variables set for production
  ☐ Error boundaries working on all apps
  ☐ 404 pages in place
  ☐ HTTPS configured
  ☐ CORS configured for production domains

CONTENT:
  ☐ SEO meta tags verified (check with Google Rich Results Test)
  ☐ robots.txt and sitemap.xml accessible
  ☐ Terms of Service reviewed by legal
  ☐ Privacy Policy reviewed by legal
  ☐ Cancellation Policy matches code logic
  ☐ About page content finalized

TESTING:
  ☐ Complete customer booking flow tested end-to-end
  ☐ Pandit onboarding tested end-to-end
  ☐ Admin travel desk workflow tested
  ☐ Admin payout workflow tested
  ☐ Cancellation + refund flow tested
  ☐ Review submission tested
  ☐ Mobile responsive verified (all 3 apps)
  ☐ Guest mode flow verified (browse → book → register)
  ☐ Voice narration tested on pandit app
  ☐ Muhurat Explorer calendar working correctly

OPERATIONAL:
  ☐ Admin accounts created for operations team
  ☐ Support phone number configured
  ☐ Emergency procedures documented
  ☐ Backup & recovery plan in place
```

---

## NEW PRISMA SCHEMA ADDITIONS (Add to schema.prisma)

```prisma
// ═══ MODELS ADDED IN PART 4 ═══

model Favorite {
  id        String        @id @default(cuid())
  userId    String
  panditId  String
  createdAt DateTime      @default(now())
  user      User          @relation("UserFavorites", fields: [userId], references: [id])
  pandit    PanditProfile @relation(fields: [panditId], references: [id])
  @@unique([userId, panditId])
}

model FamilyMember {
  id        String    @id @default(cuid())
  userId    String
  name      String
  relation  String
  dob       DateTime?
  nakshatra String?
  rashi     String?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // BOOKING, TRAVEL, STATUS, PAYMENT, REVIEW, SYSTEM
  title     String
  message   String
  data      Json     @default("{}")
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId, isRead])
  @@index([userId, createdAt])
}

model CustomerRating {
  id              String   @id @default(cuid())
  bookingId       String   @unique
  panditId        String
  customerId      String
  punctuality     Int      // 1-5
  hospitality     Int      // 1-5
  foodArrangement Int      // 1-5
  comment         String?
  createdAt       DateTime @default(now())
  booking         Booking  @relation(fields: [bookingId], references: [id])
}

model SupportTicket {
  id               String   @id @default(cuid())
  source           String   // PHONE, WHATSAPP, EMAIL, IN_APP
  type             String   // BOOKING_ISSUE, PAYMENT_ISSUE, etc.
  subject          String
  description      String
  priority         String   @default("MEDIUM") // LOW, MEDIUM, HIGH, CRITICAL
  status           String   @default("OPEN")   // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  relatedBookingId String?
  relatedUserId    String?
  resolution       String?
  createdBy        String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// ═══ ADD TO EXISTING User MODEL ═══
// Add these relations:
//   favorites     Favorite[]     @relation("UserFavorites")
//   familyMembers FamilyMember[]
//   notifications Notification[]
//   gotra         String?
//   kulDevata     String?

// ═══ ADD TO EXISTING Booking MODEL ═══
// Add these fields:
//   refundAmount    Float?
//   refundStatus    String?       // PROCESSING, COMPLETED, FAILED
//   refundId        String?       // Razorpay refund ID
//   cancelReason    String?
//   cancelledAt     DateTime?
//   customerRating  CustomerRating?
```

---

## TESTING CHECKLIST FOR PART 4

### Admin Operations
- [ ] Admin can log in and see dashboard with correct metrics
- [ ] Alert cards show urgent items (travel pending + event <48hrs)
- [ ] Travel desk shows pending bookings sorted by urgency
- [ ] Travel calculator modal pre-fills from booking data
- [ ] "Mark as Booked" saves travel details and changes booking status
- [ ] Copy-to-clipboard copies formatted booking details
- [ ] Verification queue shows pending pandits in FIFO order
- [ ] Document viewer shows images with zoom + rotate
- [ ] Video KYC player works with checklist
- [ ] Approve/Reject/Request Info all work with correct status transitions
- [ ] SMS notifications fire (console log) on verification decisions
- [ ] Payout queue shows correct amounts with breakdown
- [ ] "Process Payout" saves reference and sends SMS
- [ ] Cancellation queue calculates correct refund based on policy
- [ ] Cancellation approval triggers Razorpay refund API
- [ ] Booking reassignment works when pandit declines
- [ ] Support ticket CRUD works
- [ ] All bookings table filters correctly

### Customer Post-Booking
- [ ] Booking confirmation page shows after payment with correct data
- [ ] WhatsApp share generates correct message
- [ ] My Bookings list shows all customer's bookings with correct statuses
- [ ] Booking detail shows 3 tabs (Overview, Itinerary, Documents)
- [ ] Status timeline updates correctly
- [ ] Itinerary shows combined travel + puja schedule for outstation
- [ ] Muhurat Patrika certificate renders with correct data
- [ ] Puja completion modal shows once per booking
- [ ] Review submission with star ratings works
- [ ] Pandit rating recalculates after review
- [ ] Cancellation flow shows correct refund estimate
- [ ] Favorites add/remove works
- [ ] Profile edit saves correctly
- [ ] Family & gotra data saves and shows on booking detail
- [ ] Notification center shows notifications with read/unread

### Notification Service
- [ ] All 19 templates log correctly to console
- [ ] Booking creation triggers notifications to customer + pandit
- [ ] Status changes trigger correct notifications
- [ ] Review reminder fires for bookings completed >24hrs ago
- [ ] Pandit-to-customer rating saves correctly

### Launch Readiness
- [ ] SEO meta tags render in page source
- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml generates with correct URLs
- [ ] JSON-LD structured data in page source
- [ ] All legal pages render with content
- [ ] Error boundaries catch and display errors
- [ ] 404 pages work for invalid routes
- [ ] Loading skeletons show during navigation
- [ ] Seed data creates all 8 users, 6 bookings, reviews, payouts
- [ ] Full E2E test: Guest browse → Register → Book → Pay → Admin travel → Pandit accept → Status updates → Complete → Review

---

*This completes the Phase 1 Prompt Library. Parts 1-4 together contain 21 prompts covering all 6 sprints across 12 weeks — from monorepo setup to launch readiness.*

*Execution order: Part 1 (1.1–1.4) → Part 2 (2.1–3.4) → Part 3 (4.1–5.3) → Part 4 (6.1–7.2)*

*Total prompts: 21 (4 + 7 + 6 + 7 — note: originally planned as "Part 1 of 4" in the header but actual count is Part 4 of 4 as the final installment)*

**🙏 Jai Hind! Platform taiyar hai launch ke liye!**
