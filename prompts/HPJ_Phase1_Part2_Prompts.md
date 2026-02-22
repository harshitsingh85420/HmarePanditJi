# HMAREPANDITJI — PHASE 1 PROMPT LIBRARY: PART 2
## Customer Web App + Authentication + Booking Engine
### Prompts 2.1 – 3.4 | Sprint 2 & Sprint 3 | Weeks 3–6

> **Architecture Reminder:** There is exactly ONE login page in the entire platform — `apps/web/app/login/page.tsx`. It handles both Customer and Pandit login via a role toggle at the top. After pandit login, the user is redirected to the pandit dashboard app (e.g., `http://localhost:3002/dashboard`). The `apps/pandit-dashboard` and `apps/admin-panel` apps do NOT have their own login pages — they redirect unauthenticated users to `apps/web/login?redirect=pandit` or `apps/web/login?redirect=admin`.

---

## SPRINT 2: CUSTOMER DISCOVERY (Weeks 3–4)

---

### PROMPT 2.1 — UNIFIED LOGIN PAGE (Single Page for All Roles)

```
Implement the single, unified login page at `apps/web/app/login/page.tsx`. 
This is THE ONLY login page in the entire HmarePanditJi platform. Both 
customers and pandits log in here. After login, the user is redirected 
appropriately based on their role.

════════════════════════════════════════════════════════════════
CRITICAL DESIGN REQUIREMENT
════════════════════════════════════════════════════════════════
There must be exactly ONE login URL: /login (in apps/web).
• apps/pandit-dashboard: middleware redirects to 
  http://localhost:3000/login?redirect=pandit&next=/dashboard
  if no valid token is found.
• apps/admin-panel: middleware redirects to 
  http://localhost:3000/login?redirect=admin&next=/
  if no valid token is found.
• The login page reads the `redirect` query param to know which 
  app to send the user to after successful login.

════════════════════════════════════════════════════════════════
LAYOUT (DESKTOP: Two-column, MOBILE: Single column stacked)
════════════════════════════════════════════════════════════════

Left Panel (hidden on mobile) — Branding:
• Saffron-to-amber gradient background (#f49d25 → #f09942)
• Centered logo (🙏 HmarePanditJi, 28px bold, white)
• Tagline: "Sanskriti ko Digital Disha"
• Three trust badges (vertical list, white cards with slight 
  transparency):
    🔒  Verified Pandits — Aadhaar & Video KYC certified
    💳  Transparent Pricing — No hidden costs, ever
    ✈️  Travel Managed — We handle all logistics
• Footer quote: "500+ pandits | 4.8★ average | Delhi-NCR"

Right Panel — Login Form:
• White background, 40px padding
• Logo (small, saffron) at top for mobile
• Role toggle — two pill buttons at the top:
    [🙏 I'm a Customer]  [📿 I'm a Pandit]
  - Customer selected: amber theme (#f49d25)
  - Pandit selected: deep orange theme (#f09942), label changes 
    below to "Welcome Pandit Ji! Join 500+ verified priests."
• Form title: "Welcome back" (Customer) / "Namaste Pandit Ji" (Pandit)

════════════════════════════════════════════════════════════════
LOGIN FLOW — 3 STEPS (driven by state machine)
════════════════════════════════════════════════════════════════

Step 1 — Phone Number:
  • Label: "Mobile Number"
  • Input: prefix "+91" (non-editable gray box) + 10-digit input
  • Validation: must match /^[6-9]\d{9}$/
  • Button: "Send OTP →" (themed primary color, full width)
  • Below button: "No account needed — we'll create one for you"
  • On submit: call POST /api/auth/send-otp with { phone, role }

Step 2 — OTP Verification:
  • "OTP sent to +91 XXXXX-XXXXX" (masked) with [Change] link
  • Use OtpInput component from packages/ui (6 boxes, auto-advance,
    auto-submit on 6th digit)
  • In MOCK mode (MOCK_OTP=true): show hint 
    "Development mode: use 1-2-3-4-5-6"
  • Countdown timer: "Resend OTP in 00:30", then "Resend OTP" link
  • On complete: call POST /api/auth/verify-otp

Step 3 — Name Collection (NEW USERS ONLY):
  • Show only if API returns `isNewUser: true`
  • Customer: "What should we call you?" → name input
  • Pandit (new): 
    "Welcome! Please enter your name to continue."
    Name input + note:
    "📋 After login, you'll complete your profile to start 
    receiving bookings. Takes about 10 minutes."
  • Button: "Get Started →"
  • On submit: call PUT /api/auth/me with { name }

════════════════════════════════════════════════════════════════
POST-LOGIN REDIRECT LOGIC
════════════════════════════════════════════════════════════════

After successful OTP + name (if new), read query params:

• If role === 'PANDIT':
    - If user.panditProfile.verificationStatus === 'PENDING'
      AND no `next` param: redirect to 
      http://localhost:3002/onboarding
    - Else: redirect to `next` param or 
      http://localhost:3002/dashboard

• If role === 'CUSTOMER':
    - redirect to `next` param or '/' (homepage)

• If role === 'ADMIN':
    - If user.role !== 'ADMIN': show error "Unauthorized"
    - Else: redirect to http://localhost:3003/

Token storage:
  • Save JWT to localStorage as 'hpj_token'
  • Save user object to localStorage as 'hpj_user'
  • AuthContext (from packages/utils) auto-reads on mount

════════════════════════════════════════════════════════════════
GUEST MODE BANNER
════════════════════════════════════════════════════════════════
On the login page, below the form (for Customer role only):
  "Just exploring? [Continue as Guest →]" link that goes to '/'
  with no login required.

════════════════════════════════════════════════════════════════
LOGIN MODAL (for guest-to-auth upgrade)
════════════════════════════════════════════════════════════════
Create `components/LoginModal.tsx` in apps/web:
• Wraps the same 3-step flow in a Modal from packages/ui
• Props: { isOpen, onClose, redirectAfterLogin?, role? }
• The role toggle is still visible inside the modal
• Used when a guest clicks "Book Now" or "❤️ Favorite"
• On success: calls onClose() then redirects or refreshes

════════════════════════════════════════════════════════════════
CROSS-APP MIDDLEWARE
════════════════════════════════════════════════════════════════

apps/pandit-dashboard/middleware.ts:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('hpj_token')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL(
      `http://localhost:3000/login?redirect=pandit&next=${request.nextUrl.pathname}`
    );
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/bookings/:path*',
            '/calendar/:path*', '/earnings/:path*', '/profile/:path*'],
};
```

NOTE: Cookie-based token sharing won't work across ports in 
development. For dev, the pandit app reads localStorage via a 
small client-side check on mount (useEffect) and redirects if 
not found. In production (same domain, different subdomains), 
use httpOnly cookies shared across subdomains.

Also create a shared useRequireAuth(role) hook in packages/utils:
```typescript
export function useRequireAuth(requiredRole?: 'CUSTOMER' | 'PANDIT' | 'ADMIN') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const loginBase = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
        window.location.href = `${loginBase}/login?next=${window.location.pathname}`;
      } else if (requiredRole && user.role !== requiredRole) {
        window.location.href = '/unauthorized';
      }
    }
  }, [user, loading, requiredRole]);

  return { user, loading };
}
```

════════════════════════════════════════════════════════════════
BACKEND CHANGES NEEDED
════════════════════════════════════════════════════════════════

Update auth.controller.ts → verifyOtp:
• Return isNewUser: boolean in response
• Return panditProfile.verificationStatus in response
• Return all data needed for redirect decisions

Update verifyOtp response shape:
{
  success: true,
  data: {
    token: string,
    user: {
      id, phone, role, name,
      isVerified, isNewUser,
      profileCompleted: boolean,
      ...(role === 'PANDIT' && {
        panditProfile: {
          verificationStatus,
          completedSteps: number
        }
      })
    }
  }
}
```

---

### PROMPT 2.2 — CUSTOMER HOMEPAGE (Guest Mode)

```
Build the customer homepage at `apps/web/app/page.tsx`. This is the main 
landing page, fully accessible without login. Import shared components 
from packages/ui. Run: `npm run dev` and verify this page loads at 
http://localhost:3000.

════════════════════════════════════════════════════════════════
PAGE STRUCTURE (top to bottom)
════════════════════════════════════════════════════════════════

1. STICKY HEADER  (apps/web/components/Header.tsx)
   ─────────────────────────────────────────────────
   Left:   Logo (🙏 HmarePanditJi, bold, saffron)
   Center: Nav links — Home | Find Pandits | Muhurat Explorer | About
   Right:
     • If guest:   [Login / Register] button (outline)
     • If logged in (CUSTOMER): Avatar + "My Bookings" link
   Mobile: Hamburger menu collapses center nav

   GuestBanner component (from packages/ui):
   • Shows sticky bar ABOVE header for guests:
     "👋 Exploring as Guest — Login to book pandits and save favorites"
     [Login / Register →] button on right
     [×] dismiss (stores dismissal in sessionStorage)

2. HERO SECTION
   ─────────────────────────────────────────────────
   Background: Subtle saffron gradient + mandala pattern overlay (CSS)
   
   Headline (h1, 48px bold):
     "Book Verified Pandits for Every Sacred Occasion"
   
   Subheadline (20px, gray-600):
     "Transparent pricing · Travel managed · Backup guaranteed"
   
   QUICK SEARCH BAR (white card, shadow, rounded-xl):
   ┌──────────────────────────────────────────────────────┐
   │  [Puja Type ▾]  [City ▾]  [📅 Date]  [🔍 Search]   │
   └──────────────────────────────────────────────────────┘
   • Puja Type: dropdown with options from CONSTANTS.SUPPORTED_PUJA_TYPES
   • City: text input with autocomplete from CONSTANTS.SUPPORTED_CITIES
   • Date: DatePicker component from packages/ui
   • Search: navigates to /search?pujaType=X&city=Y&date=Z
   
   Below bar: Small text — "No registration needed to explore →"
   
   Trust stats row (below hero on mobile, inline on desktop):
     🕉 500+ Verified Pandits  |  ⭐ 4.8 Avg Rating  |  ✅ ₹0 Hidden Costs

3. HOW IT WORKS  (3-column grid)
   ─────────────────────────────────────────────────
   Section title: "Book in 3 Simple Steps"
   
   Step 1: 🔍 Discover
     "Search from 500+ verified Pandits across India. 
      Filter by specialization, language, and travel preference."
   
   Step 2: 📅 Book with Muhurat
     "Pick an auspicious date from our Muhurat Explorer. 
      Complete pricing shown upfront — no surprises."
   
   Step 3: 🙏 Celebrate
     "We manage all travel and logistics. 
      Backup guarantee available for important events."

4. MUHURAT EXPLORER WIDGET
   ─────────────────────────────────────────────────
   Section title: "📅 Muhurat Explorer — Find Auspicious Dates"
   Subtitle: "Click any highlighted date to see available pujas"
   
   Compact calendar (current month):
   • Show 7-column grid (Sun-Sat), current month
   • Fetch data: GET /api/muhurat/dates?month=M&year=Y
     Returns: [{ date: "2026-03-15", count: 3, pujaTypes: ["Vivah"] }]
   • Each date cell:
       - Has muhurat: amber dot at top + amber background on hover
       - No muhurat: plain white, not clickable
       - Today: blue ring
       - Past dates: gray, 50% opacity
   • Clicking a date → navigates to /muhurat?date=YYYY-MM-DD
   
   "View Full Muhurat Calendar →" link (right-aligned, saffron)
   
   Below calendar — UPCOMING AUSPICIOUS DATES list (3 items):
   Each item: Date + Puja types + Muhurat window
   Example: "Mar 15 · Vivah, Griha Pravesh · 10:30 AM – 12:45 PM"
   Fetch: GET /api/muhurat/upcoming?limit=3

5. FEATURED PANDITS CAROUSEL
   ─────────────────────────────────────────────────
   Section title: "⭐ Highly Rated Pandits"
   Subtitle: "Verified experts ready to travel anywhere"
   
   Fetch: GET /api/pandits?sort=rating&limit=6&verificationStatus=VERIFIED
   
   Horizontal scroll row on mobile, 3-column grid on desktop.
   Use PanditCard component from packages/ui for each pandit.
   PanditCard props:
   • theme="customer"
   • Show name, rating, location, top 3 specializations
   • NO travel options on homepage (saves API calls)
   • "View Profile" → /pandit/[id]
   • "Book Now" → /login (if guest) or /booking/new?panditId=[id]
   • Favorite heart: disabled (shows LoginModal if guest clicks)
   
   Loading state: 6 × PanditCardSkeleton components
   
   "View All Pandits →" button below carousel

6. PUJA CATEGORIES QUICK ACCESS
   ─────────────────────────────────────────────────
   Section title: "Browse by Occasion"
   
   Icon grid (3 cols mobile, 6 cols desktop):
   • 💍 Vivah (Wedding)
   • 🏠 Griha Pravesh
   • 🕉 Satyanarayan Puja
   • 👶 Mundan / Namkaran
   • 🔥 Havan / Hom
   • 📿 View All →
   
   Each card: icon + label, clicking → /search?pujaType=X

7. TRUST & SAFETY SECTION
   ─────────────────────────────────────────────────
   3 cards:
   
   🛡️ Multi-Layer Verification
     "Every Pandit undergoes Aadhaar verification, certificate 
      validation, and live Video KYC before joining."
   
   💰 100% Transparent Pricing
     "Dakshina + Travel + Samagri + GST — all shown upfront 
      before you pay. Zero hidden charges."
   
   ✈️ Travel Fully Managed
     "We coordinate train tickets, flights, cabs, and hotel 
      for outstation Pandits. You just attend the ceremony."

8. FOOTER  (apps/web/components/Footer.tsx)
   ─────────────────────────────────────────────────
   Logo + tagline + 4 columns:
   • Platform: About, How it Works, Blog
   • For Customers: Find Pandits, Muhurat Explorer, Reviews
   • For Pandits: Join as Pandit, Earnings Calculator
   • Legal: Terms of Service, Privacy Policy, Cancellation Policy
   Copyright: "© 2026 HmarePanditJi Technologies Pvt. Ltd."

════════════════════════════════════════════════════════════════
DATA FETCHING STRATEGY
════════════════════════════════════════════════════════════════

Use Next.js 14 App Router patterns:
• Featured pandits: Server Component (fetch on server)
• Muhurat widget: Server Component (fetch on server, pass data down)
• Quick search bar: Client Component (needs interactivity)
• GuestBanner: Client Component (needs localStorage/sessionStorage)

Create apps/web/lib/api.ts for server-side fetches:
```typescript
const API_BASE = process.env.API_URL || 'http://localhost:3001';

export async function getFeaturedPandits() {
  const res = await fetch(
    `${API_BASE}/api/pandits?sort=rating&limit=6&verificationStatus=VERIFIED`,
    { next: { revalidate: 300 } } // ISR: revalidate every 5 minutes
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data?.pandits || [];
}

export async function getMuhuratDates(month: number, year: number) {
  const res = await fetch(
    `${API_BASE}/api/muhurat/dates?month=${month}&year=${year}`,
    { next: { revalidate: 3600 } } // revalidate hourly
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data?.dates || [];
}
```

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS TO IMPLEMENT
════════════════════════════════════════════════════════════════

In muhurat.controller.ts, implement:

GET /api/muhurat/dates?month=3&year=2026&pujaType=Vivah
• Query MuhuratDate table, group by date, count pujas
• Return: [{ date, count, pujaTypes: string[] }]
• Cache with 1-hour TTL in memory

GET /api/muhurat/upcoming?limit=3
• Return next N muhurat dates from today
• Include pujaTypes and timeWindow

In pandit.controller.ts, ensure:
GET /api/pandits?sort=rating&limit=6&verificationStatus=VERIFIED
• Return pandits with user name, rating, specializations, location
• Only verificationStatus = 'VERIFIED'
• Sort by rating desc
```

---

### PROMPT 2.3 — MUHURAT EXPLORER FULL PAGE

```
Build the full Muhurat Explorer page at `apps/web/app/muhurat/page.tsx`. 
Fully accessible in guest mode. This page is a standalone feature for 
discovering auspicious dates.

════════════════════════════════════════════════════════════════
URL PARAMS SUPPORTED
════════════════════════════════════════════════════════════════
/muhurat                          → Default: current month, all pujas
/muhurat?date=2026-03-15          → Pre-selects that date
/muhurat?pujaType=Vivah           → Filters to Vivah only
/muhurat?date=2026-03-15&pujaType=Vivah → Both

Read params via searchParams prop (Server Component).

════════════════════════════════════════════════════════════════
PAGE LAYOUT
════════════════════════════════════════════════════════════════

HEADER SECTION:
• Page title: "📅 Muhurat Explorer"
• Subtitle: "Discover auspicious dates for your upcoming ceremony"
• Puja type filter chips (horizontal scroll on mobile):
    [All Pujas] [Vivah] [Griha Pravesh] [Satyanarayan] 
    [Mundan] [Namkaran] [Havan] [Annaprashan] [Upanayana]
  • Selected chip: saffron background, white text
  • Clicking a chip updates URL param and reloads calendar data

MONTH NAVIGATION:
  ← [February 2026] →
  • Prev/Next arrows update month in URL

MAIN CALENDAR (full-width grid):
• 7 columns (S M T W T F S)
• Each date cell (min-height: 90px on desktop, 60px mobile):
    ┌─────────────────┐
    │  15             │  ← Date number, top-left
    │                 │
    │  🔶 3 Pujas     │  ← Amber badge with count
    └─────────────────┘
  • Has muhurat: amber left border + amber badge
  • No muhurat: plain white, not clickable
  • Selected date: saffron background
  • Today: blue ring around date number
  • Past dates: gray background, not clickable

DETAIL PANEL (appears below calendar when date selected):
  ┌─────────────────────────────────────────────────────────┐
  │  Muhurats for March 15, 2026                           │
  ├─────────────────────────────────────────────────────────┤
  │  💍 Vivah (Wedding)                                     │
  │     🕐 10:30 AM – 12:45 PM                              │
  │     ✨ Akshaya Tritiya — Most auspicious for weddings   │
  │     [Find Pandits for This Date →]                      │
  ├─────────────────────────────────────────────────────────┤
  │  🏠 Griha Pravesh                                       │
  │     🕐 07:15 AM – 09:00 AM                              │
  │     ✨ Shubha Navami — Excellent for housewarming       │
  │     [Find Pandits for This Date →]                      │
  └─────────────────────────────────────────────────────────┘
  "Find Pandits" button navigates to:
  /search?pujaType=Vivah&date=2026-03-15&muhuratTime=10:30-12:45

SIDEBAR (desktop only, right side, sticky):
  "Upcoming Auspicious Dates"
  List of next 10 muhurat dates across all puja types:
  • Each item: Date | Puja type | Time window
  • Clicking → selects that date in the calendar
  • "View on Calendar" link

BOTTOM CTA (for guests):
  "🙏 Ready to book? Create a free account to proceed."
  [Login / Register] button → /login?redirect=customer

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS TO IMPLEMENT
════════════════════════════════════════════════════════════════

In muhurat.controller.ts:

GET /api/muhurat/dates?month=3&year=2026&pujaType=Vivah
→ { dates: [{ date: "2026-03-15", count: 2, pujaTypes: ["Vivah","Griha Pravesh"] }] }

GET /api/muhurat/pujas-for-date?date=2026-03-15&pujaType=Vivah
→ { muhurats: [{ pujaType, timeWindow, significance, source }] }

GET /api/muhurat/upcoming?limit=10&pujaType=Vivah
→ { dates: [{ date, pujaType, timeWindow, significance }] }

All queries hit the MuhuratDate table seeded in Prompt 1.5.
Add in-memory cache (Map) with 1-hour TTL for all muhurat endpoints.
```

---

### PROMPT 2.4 — PANDIT SEARCH PAGE WITH FILTERS

```
Build the pandit search page at `apps/web/app/search/page.tsx`. This is 
a client-heavy page with dynamic filtering. Accessible in guest mode.

════════════════════════════════════════════════════════════════
URL PARAMS (pre-fill from Muhurat Explorer or Homepage)
════════════════════════════════════════════════════════════════
?pujaType=Vivah
?city=Delhi
?date=2026-04-21
?muhuratTime=10:30-12:45
?budget=50000
?rating=4
?lang=hindi
?travelMode=TRAIN
?distance=500

════════════════════════════════════════════════════════════════
PAGE LAYOUT
════════════════════════════════════════════════════════════════

TOP BAR (sticky):
• Inline search: [Puja Type ▾] [City] [Date] [🔍] 
• Sort: [Best Match ▾] [Rating] [Price: Low–High] [Distance]
• Active filter pills: e.g., "Vivah ×" "Delhi ×" "4★+ ×"
  Clicking × removes that filter

FILTER SIDEBAR (desktop left, mobile bottom drawer):
  Animate in/out. "X filters applied" badge on mobile toggle.
  
  SECTION: Puja Type
    Radio group from CONSTANTS.SUPPORTED_PUJA_TYPES

  SECTION: Location
    City input (text with autocomplete from /api/travel/cities)
    "Search All India" toggle (switches from city-only to all)

  SECTION: Date
    DatePicker from packages/ui
    "Check Muhurat" button → fetches muhurats for selected date
      Shows: "🔶 3 auspicious muhurats on this date →"

  SECTION: Budget (Dakshina range)
    Slider: ₹5,000 — ₹1,00,000
    Presets: [Under ₹15k] [₹15k–40k] [₹40k–75k] [₹75k+]

  SECTION: Minimum Rating
    Stars: [3★+] [4★+] [4.5★+] [Any]

  SECTION: Languages
    Checkboxes from CONSTANTS.SUPPORTED_LANGUAGES
    Default shown: 5, "Show all" expander

  SECTION: Travel Mode
    Pills (multi-select): 
    [🚗 Self-Drive] [🚂 Train] [✈️ Flight] [🚕 Cab] [Any]

  SECTION: Distance
    Slider: 0 — 2000 km
    Presets: [Local <50km] [Regional <500km] [All India]

  [Apply Filters] (saffron, full width)
  [Clear All] (ghost link)

RESULTS AREA:
  "Showing 8 verified Pandits" count
  
  GRID: 1 col mobile, 2 col tablet, 3 col desktop
  
  Each card: PanditCard component from packages/ui with:
    • pandit: full profile object
    • customerCity: from URL/filter (for travel calculation)
    • travelOptions: fetched via POST /api/travel/calculate
      IMPORTANT: Only fetch travel options for outstation pandits.
      Logic: if pandit.location !== filter.city, fetch travel options.
      Batch requests: collect all outstation pandit IDs, make ONE
      POST /api/travel/batch-calculate request.
    • onBook: navigate to /booking/new?panditId=X (or LoginModal if guest)
    • onViewProfile: navigate to /pandit/[id]
    • isFavorited: from user's favorites (only if logged in)
    • onToggleFavorite: call /api/customers/me/favorites (or LoginModal)

  LOADING STATE:
    6 × PanditCardSkeleton placeholders while fetching

  EMPTY STATE:
    EmptyState component: "No pandits found"
    Suggestion: "Try expanding your distance filter or removing some filters"

  PAGINATION:
    "Load 6 more" button (not infinite scroll, avoids UX issues)
    Show "Showing 8 of 24 results"

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS TO IMPLEMENT
════════════════════════════════════════════════════════════════

In pandit.controller.ts, fully implement:

GET /api/pandits
Query params:
  verificationStatus  (default: VERIFIED for customer view)
  pujaType            (filter: pandit has PujaService of this type)
  city                (filter: pandit.location matches city)
  date                (filter: no blocked date on this date)
  minRating           (filter: pandit.rating >= value)
  minDakshina         (filter: pujaService.dakshinaAmount >= value)
  maxDakshina         (filter: pujaService.dakshinaAmount <= value)
  language            (filter: pandit.languages contains value)
  travelMode          (filter: pandit.travelPreferences.preferredModes contains)
  maxDistance         (filter: within this km from city's lat/lng — use CityDistance)
  sort                (rating, price_asc, price_desc, distance)
  page, limit         (default limit: 12)

Response:
{
  success: true,
  data: {
    pandits: [
      {
        id,
        name,           // from User
        profilePhotoUrl,
        rating,
        totalReviews,
        completedBookings,
        experienceYears,
        location,
        specializations,
        languages,
        verificationStatus,
        travelPreferences,  // the JSON object
        isOnline,
        pujaServices: [{ pujaType, dakshinaAmount, durationHours }]
      }
    ],
    pagination: { total, page, limit, totalPages }
  }
}

POST /api/travel/batch-calculate
Body: {
  requests: [
    { fromCity: "Varanasi", toCity: "Delhi", panditId: "..." },
    ...
  ],
  eventDays: 1,
  foodArrangement: "CUSTOMER_PROVIDES"
}
Response: {
  results: {
    "panditId": [{ mode, totalCost, breakdown }]
  }
}
Limit: max 20 pandits per batch. Use Promise.all internally.
Cache results in Redis/memory with key "travel:FROM:TO" TTL 30 min.

GET /api/customers/me/favorites (authenticated)
→ Returns array of pandit IDs the customer has favorited

POST /api/customers/me/favorites/:panditId (authenticated)
→ Add/remove toggle (if exists, remove; if not, add)
→ Return { isFavorited: boolean }
```

---

### PROMPT 2.5 — PANDIT PROFILE PAGE

```
Create the pandit profile detail page at `apps/web/app/pandit/[id]/page.tsx`. 
Guest accessible. This is the deepest discovery page before booking begins.

════════════════════════════════════════════════════════════════
FETCH STRATEGY
════════════════════════════════════════════════════════════════
• Server Component: fetch pandit data, reviews summary, availability
• Client Components: travel options tab (needs user's city), favorite button
• generateMetadata: SEO title/description from pandit data

const pandit = await getPanditById(params.id);
// Redirects to 404 if not found or not VERIFIED

════════════════════════════════════════════════════════════════
SECTION 1: HERO BANNER
════════════════════════════════════════════════════════════════
Full-width saffron gradient banner.

Left side:
• Avatar 120×120 (rounded-full, white border 4px)
• Verified badge: "✅ Verified Vedic" pill (green)
• Online indicator dot (green if isOnline)

Right side (stacked):
• Name: "Pt. [Name]" (28px bold)
• [Location] · [X years experience]
• Language tags: pills
• Specialization tags: up to 4, saffron pills
• Travel badge: if maxDistanceKm > 500 → "✈️ Available All-India"
               if maxDistanceKm > 100 → "🚗 Regional Travel"
               else → "📍 Local (Delhi-NCR)"
• Ratings row: ⭐4.9  (256 reviews)  ·  234 completed
• Device info: "📱 Samsung Galaxy A52 · Android 12" 
  (subtle gray text, from panditProfile)

BOTTOM STRIP (white, shadow):
• ❤️ Favorite button (left) — opens LoginModal if guest
• [Share Profile] button (left)  
• [Check Availability & Book] button (right, saffron, large)
  → Sticky: also appears as a bottom bar on mobile (fixed bottom)

════════════════════════════════════════════════════════════════
SECTION 2: TABS
════════════════════════════════════════════════════════════════
Using Tabs component from packages/ui.

Tab 1: ABOUT
  • Bio paragraph
  • Specialization badges (all of them)
  • "Years of Experience" + "Ceremonies Performed"
  • Languages: horizontal list
  • Certifications: 
    Each: Institution name + year + "✅ Verified" badge

Tab 2: SERVICES & PRICING
  • One card per PujaService:
    ┌───────────────────────────────────────┐
    │  💍 Vivah (Wedding)                   │
    │  Duration: 5–6 hours                  │
    │  Dakshina: ₹21,000                   │
    │  (+ samagri + travel if applicable)  │
    │            [Book This Puja →]         │
    └───────────────────────────────────────┘
  • "Book This Puja" → /booking/new?panditId=X&pujaType=Vivah
    (or opens LoginModal if guest)

Tab 3: TRAVEL OPTIONS
  CLIENT COMPONENT — TravelOptionsTab.tsx
  
  Props: panditId, panditLocation, panditTravelPreferences
  
  State: customerCity (from URL param or default "Delhi")
  
  City selector at top:
    "Your Event City: [Delhi ▾]" (dropdown of supported cities)
    On change → recalculate travel options
  
  If pandit.location === customerCity:
    → "✅ No travel needed — Pandit Ji is in your city!"
    → Show "Book Directly →" CTA
  
  If outstation:
    Fetch: POST /api/travel/calculate {
      fromCity: panditLocation,
      toCity: customerCity,
      eventDays: 1
    }
    Show option cards (one per available mode):
    ┌──────────────────────────────────────────────┐
    │ 🚂 Train (3AC)                              │
    │ ₹4,300 total    ·    ~11 hours travel time  │
    │ Varanasi → Delhi  ·  845 km                 │
    │                                              │
    │ ▾ View Breakdown                             │
    │   Train fare (return): ₹2,500               │
    │   Local cab (×2):      ₹1,600               │
    │   Food allowance:      ₹1,000               │
    │   Travel svc fee:      ₹215 + GST            │
    │                                              │
    │ Best for: Budget-conscious bookings          │
    │                        [Select This Option]  │
    └──────────────────────────────────────────────┘
    
    Selecting a mode → navigates to:
    /booking/new?panditId=X&travelMode=TRAIN&fromCity=Varanasi&toCity=Delhi
  
  Loading: 3 skeleton cards while calculating

Tab 4: REVIEWS
  Rating summary:
  • Big number "4.9" + 5 stars
  • Distribution bars: 5★ ████████ 89%  4★ ██ 8%  etc.
  • Sub-ratings: Knowledge 4.9 | Punctuality 4.8 | Communication 4.7
  
  Review list (paginated, 5 per page):
  Each review:
    • Avatar (or "Anonymous" icon) + name + date
    • Stars + puja type tag
    • Comment
    • "Traveled from Varanasi" badge if applicable
  
  Fetch: GET /api/pandits/:id/reviews?page=1&limit=5

Tab 5: AVAILABILITY
  CLIENT COMPONENT — AvailabilityCalendar.tsx
  
  Month view calendar showing:
    🟢 Green cell: available
    🟠 Orange cell: has bookings (hover: "1 booking")
    🔴 Red cell: blocked by pandit (hover: blocked reason or "Unavailable")
    ⚫ Gray cell: past date
  
  Fetch: GET /api/pandits/:id/availability?month=3&year=2026
  Returns: [{ date, status: "available"|"booked"|"blocked" }]
  
  Clicking green date:
    → Fills date in booking wizard URL
    → Scrolls to / shows booking CTA
  
  Month navigation: ← [Month Year] →

════════════════════════════════════════════════════════════════
STICKY BOOKING CTA (mobile only — fixed bottom bar)
════════════════════════════════════════════════════════════════
White bar, shadow-top:
"Starting from ₹[lowestDakshinaAmount]"
[Check Availability & Book] (saffron button, full remaining width)

Clicking if guest → opens LoginModal
Clicking if logged in → /booking/new?panditId=X

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS TO IMPLEMENT
════════════════════════════════════════════════════════════════

GET /api/pandits/:id
Returns full pandit profile including:
- User.name, phone (not returned for guests, only after booking)
- PanditProfile (all fields)
- pujaServices[] 
- samagriPackages[]
- reviewSummary: { avgRating, totalReviews, distribution, subRatings }
- Only return if verificationStatus === 'VERIFIED' for public view

GET /api/pandits/:id/reviews?page=1&limit=5
Returns paginated reviews with reviewer name (masked if anonymous)

GET /api/pandits/:id/availability?month=3&year=2026
Logic:
1. Get all bookings for this pandit in this month (eventDate in range)
2. Get all PanditBlockedDate entries in this month
3. Return array of all dates in month with status
```

---

## SPRINT 3: BOOKING & SAMAGRI (Weeks 5–6)

---

### PROMPT 3.1 — SAMAGRI MODAL & CART

```
Build the Samagri selection experience for the pandit profile page. 
This is a standalone modal + cart system that persists selection into 
the booking wizard.

════════════════════════════════════════════════════════════════
ENTRY POINT — On Pandit Profile, Services tab:
════════════════════════════════════════════════════════════════

Next to each PujaService price, show:
  "Samagri: ₹8,000  [View & Choose →]"
  
Clicking "View & Choose →" opens SamagriModal.

Also: Cart icon appears in header once something is added.
Cart icon: 🛒  with count badge.

════════════════════════════════════════════════════════════════
SAMAGRI MODAL COMPONENT
apps/web/components/SamagriModal.tsx
════════════════════════════════════════════════════════════════

Props:
  panditId: string
  pujaType: string
  packages: SamagriPackage[]   // from pandit profile
  onAddToCart: (selection: SamagriSelection) => void
  isOpen: boolean
  onClose: () => void

Modal size: large (lg) from packages/ui Modal component

HEADER:
  "🌸 Samagri for [Puja Type]"
  Subtitle: "Choose how you'd like to arrange the ritual materials"

TWO TABS (mutually exclusive selection):

─────────────────────────────────────────────────────────────
TAB 1: "Pandit Ji's Package" (default selected)
─────────────────────────────────────────────────────────────
Header:
  "📦 Pandit Ji's Recommended Samagri Packages"
  Note box (amber background): 
  ⚠️ "These packages are fixed and non-negotiable. The price 
      and included items are set by Pandit Ji."

Package selector: 3 toggle cards (horizontal on desktop, vertical on mobile):

Each package card:
┌──────────────────────────────────────────────┐
│  ○ BASIC              ₹3,500                 │
│  Core items for main ritual                  │
│  8 items included                            │
│  [View Items ▾]                              │
└──────────────────────────────────────────────┘

Selected state: saffron border + saffron radio filled

"View Items" expander shows item list (read-only):
  • Desi Ghee (500g) — Shuddh, A2 cow
  • Sindoor (50g)
  • Mauli (1 packet)
  ... etc.

Below selector:
  ┌──────────────────────────────────────┐
  │  Selected: Standard Package          │
  │  Fixed price: ₹5,500                │
  │  Non-negotiable, includes all items │
  └──────────────────────────────────────┘
  [Add to Cart — ₹5,500] (saffron button, full width)

─────────────────────────────────────────────────────────────
TAB 2: "Build Your Own List"
─────────────────────────────────────────────────────────────
Note box (blue background):
  ℹ️ "You'll source these items locally or we'll connect you 
      with our vendors."

Fetch: GET /api/samagri/catalog?pujaType=Vivah
Returns categorized items with platform price.

Category accordion list:
  ▶ Grains & Pulses (3 items)
  ▶ Flowers & Leaves (4 items)
  ▶ Ghee & Oils (2 items)
  ▶ Thread & Cloth (3 items)
  ▶ Fruits & Sweets (4 items)

Each item row:
  □ ✓  Desi Ghee (500g)      ₹240     [In Pandit's Standard at ₹5,500]
        Qty: [−] 1 [+]

  • Checkbox: select/deselect item
  • Quantity adjuster (only shown when selected)
  • Platform live price (per unit)
  • "In Pandit's [Package] at ₹X" badge when item is in pandit's package

Running total at bottom:
  "Your Custom List: ₹4,200"
  "vs. Pandit's Premium Package: ₹8,000 — You save ₹3,800"
  
  [Add Custom List to Cart — ₹4,200] (blue button)

─────────────────────────────────────────────────────────────
SELECTION RULES:
─────────────────────────────────────────────────────────────
• Only ONE option can be added to cart at a time.
• Switching tabs and clicking "Add to Cart" replaces cart item.
• If cart already has samagri, show: "Replace existing selection?"

════════════════════════════════════════════════════════════════
CART SYSTEM
════════════════════════════════════════════════════════════════

State: Store in React Context + sessionStorage (survives refresh).

SamagriCart context (apps/web/context/SamagriCartContext.tsx):
```typescript
interface SamagriSelection {
  source: 'PANDIT_PACKAGE' | 'PLATFORM_CUSTOM';
  panditId: string;
  pujaType: string;
  packageId?: string;        // if PANDIT_PACKAGE
  packageName?: string;      // "Basic" | "Standard" | "Premium"
  items?: CartItem[];        // if PLATFORM_CUSTOM
  totalPrice: number;
  lockedAt: string;          // ISO timestamp
}
```

CART SIDEBAR / PANEL (slides in from right):
  Triggered by clicking cart icon in header.
  
  Header: "🛒 Your Samagri Cart"
  
  Source badge: 
    "📦 Pandit Ji's Premium Package (Fixed)" — amber badge
    OR
    "🛍️ Your Custom List" — blue badge

  Item list (readonly for pandit package, editable for custom):
    Each item: Name | Qty | Price
  
  Price summary:
    Total: ₹8,000
    Note: "(Fixed package price)" or "(Platform sourcing price)"

  Action buttons:
    [Proceed to Book →] (saffron)
    [Continue Browsing] (ghost)
    [Remove from Cart] (danger link)

  "Proceed to Book →" navigates to:
  /booking/new?panditId=X&pujaType=Vivah&samagriSource=PANDIT_PACKAGE&samagriPackageId=Y
  (or opens LoginModal if guest, then redirects)

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS
════════════════════════════════════════════════════════════════

GET /api/samagri/catalog?pujaType=Vivah
• Return master item list from a static JSON/DB table
• Phase 1: use a static JSON file at services/api/src/data/samagri-catalog.json
• Structure: { categories: [{ name, items: [{ id, name, unit, basePrice, description }] }] }
• Items with non-volatile prices can be seeded in a SamagriItem table

In pandit.controller.ts GET /api/pandits/:id:
• Already returns samagriPackages with items JSON
• Ensure items is properly parsed from JSON field
```

---

### PROMPT 3.2 — BOOKING WIZARD (6 STEPS)

```
Implement the complete booking wizard at 
`apps/web/app/booking/new/page.tsx`. 
Requires authentication — redirect to /login if not logged in.

════════════════════════════════════════════════════════════════
ARCHITECTURE
════════════════════════════════════════════════════════════════

Client Component ("use client"). 
State management: useReducer for wizard data.
Persistence: sessionStorage key 'hpj_booking_wizard'.

Wizard context stored as:
```typescript
interface BookingWizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  
  // Step 1
  eventType: string;
  eventDate: string;           // ISO date
  eventEndDate?: string;       // for multi-day events
  muhuratTime?: string;        // e.g., "10:30 AM – 12:45 PM"
  venueAddress: string;
  venueCity: string;
  venuePincode: string;
  attendees?: number;
  specialInstructions?: string;
  
  // Step 2
  panditId: string;
  panditName: string;
  panditCity: string;
  selectedPujaServiceId: string;
  dakshinaAmount: number;
  durationHours: number;
  
  // Step 3
  travelRequired: boolean;
  travelMode?: string;
  travelDistanceKm?: number;
  travelCost?: number;
  travelBreakdown?: object;
  
  // Step 4
  foodArrangement: 'CUSTOMER_PROVIDES' | 'PLATFORM_ALLOWANCE';
  foodAllowanceDays: number;
  foodAllowanceAmount: number;
  accommodationArrangement: 'NOT_NEEDED' | 'CUSTOMER_ARRANGES' | 'PLATFORM_BOOKS';
  accommodationCost: number;
  samagriPreference: 'PANDIT_BRINGS' | 'CUSTOMER_ARRANGES' | 'NEED_HELP';
  samagriPackageId?: string;
  samagriAmount: number;
  
  // Step 5 (calculated)
  platformFee: number;
  platformFeeGst: number;
  travelServiceFee: number;
  travelServiceFeeGst: number;
  grandTotal: number;
  
  // Step 6 (after booking created)
  bookingId?: string;
  bookingNumber?: string;
  razorpayOrderId?: string;
}
```

════════════════════════════════════════════════════════════════
TOP STEPPER (Stepper component from packages/ui)
════════════════════════════════════════════════════════════════
Steps: [Event Details] → [Pandit & Puja] → [Travel] → 
       [Preferences] → [Review & Pay] → [Confirmation]
• Current step highlighted in saffron
• Completed steps show ✓ checkmark
• Cannot jump to future steps, can go back

════════════════════════════════════════════════════════════════
STEP 1: EVENT DETAILS
════════════════════════════════════════════════════════════════

Fields:
1. Puja Type (Select from packages/ui)
   Options: CONSTANTS.SUPPORTED_PUJA_TYPES
   Pre-filled from URL ?pujaType=Vivah

2. Event Date (DatePicker from packages/ui)
   Min: today + 2 days (advance notice)
   Pre-filled from URL ?date=...
   
   After date selection, show inline:
   "Check Muhurat →" button
   → Fetches GET /api/muhurat/pujas-for-date?date=X&pujaType=Y
   → Shows list: "10:30 AM – 12:45 PM (Akshaya Tritiya)"
   → User clicks → muhuratTime auto-filled
   → Shows green tick: "✅ Muhurat selected: 10:30–12:45"

3. Event End Date (DatePicker, shown only for multi-day pujas)
   Auto-show when pujaType in ["Vivah", "Upanayana"] 

4. Venue Address (Textarea)

5. Venue City (Select from CONSTANTS.SUPPORTED_CITIES)
   Pre-filled from URL ?city=...

6. Venue Pincode (text input, 6 digits)

7. Expected Attendees (number input, optional)

8. Special Instructions (Textarea, optional, max 500 chars)

Navigation: [Next →]
Validation: pujaType, eventDate, venueAddress, venueCity, venuePincode required.

════════════════════════════════════════════════════════════════
STEP 2: PANDIT & PUJA
════════════════════════════════════════════════════════════════

If panditId in URL (from profile page or search):
  Show selected pandit card (read-only):
    Avatar | Name | Location | Rating | Verified badge
    [Change Pandit] link → opens mini search panel below

  Show this pandit's services for selected pujaType:
    Card per service:
      • Service name + duration + dakshina
      • Radio button to select
      • [Select →]
  
  If pandit has no service for selected puja type:
    Show warning: "This Pandit doesn't offer [puja type]. 
    Select a different puja type or change pandit."

If NO panditId in URL:
  Show simplified pandit search:
    • Pre-filtered by pujaType + venueCity from step 1
    • Fetch GET /api/pandits?pujaType=X&city=Y&verificationStatus=VERIFIED&limit=6
    • Show 6 PanditCard results
    • Clicking selects and expands their services

Navigation: [← Back] [Next →]
Validation: panditId and selectedPujaServiceId required.

════════════════════════════════════════════════════════════════
STEP 3: TRAVEL & LOGISTICS
════════════════════════════════════════════════════════════════

Auto-determine if travel needed:
  if panditCity === venueCity:
    → "✅ No travel needed — Pandit Ji is in your city!"
    → Set travelRequired=false, travelCost=0
    → [Next →] immediately available

  else (outstation):
    → "📍 Pandit Ji is in [panditCity] — [X] km from [venueCity]"
    → travelRequired=true
    
    Fetch: POST /api/travel/calculate {
      fromCity: panditCity,
      toCity: venueCity,
      eventDays: daysBetween(eventDate, eventEndDate) + 1,
      foodArrangement: "CUSTOMER_PROVIDES"  // default, recalc at step 4
    }
    
    Show option cards for each available mode:
    (sorted by totalCost asc)
    
    ┌──────────────────────────────────────────────────────────┐
    │  ○ 🚂 Train (3AC)                          ₹4,300       │
    │    Varanasi → Delhi  ·  845 km  ·  ~11 hrs              │
    │    [▾ View Breakdown]                                     │
    │      Train fare (return):    ₹2,500                     │
    │      Local cab (×2):         ₹1,600                     │
    │      Food (travel days):     ₹1,000 (1 day × ₹1,000)   │
    │      Travel service fee:     ₹200 + GST                 │
    │    Best for: Budget bookings with flexible timing        │
    └──────────────────────────────────────────────────────────┘
    
    Modes shown only if pandit's travelPreferences includes that mode.
    Self-Drive only shown if pandit has SELF_DRIVE in preferredModes.
    
    Selecting a mode:
    • Stores travelMode, travelCost, travelDistanceKm, travelBreakdown
    • Shows: "✅ [Mode] selected — ₹X estimated travel cost"
    • Note: "⚠️ Food allowance may change based on your meal 
              preference in the next step."

Navigation: [← Back] [Next →]
Validation (if outstation): travelMode must be selected.

════════════════════════════════════════════════════════════════
STEP 4: PREFERENCES
════════════════════════════════════════════════════════════════

FOOD ARRANGEMENT:
  Radio group:
    ○ "Yes, I will provide meals for Pandit Ji on puja days"  
      (CUSTOMER_PROVIDES)
    ○ "No, please add ₹1,000/day food allowance for puja days"  
      (PLATFORM_ALLOWANCE)
  
  Note below: 
  "Travel day food allowance (₹1,000/day) is always included 
   for outstation bookings."
  
  On change: recalculate foodAllowanceDays and foodAllowanceAmount
  using calculateFoodAllowanceDays() from packages/utils:
    travelDays = travelBreakdown?.estimatedTravelDays || 0
    eventDays = daysBetween(eventDate, eventEndDate) + 1
    if CUSTOMER_PROVIDES: days = travelDays
    if PLATFORM_ALLOWANCE: days = travelDays + eventDays
    amount = days × 1000
  
  Show updated amount: "Food allowance: ₹[X] ([Y] days × ₹1,000)"

ACCOMMODATION (only show if multi-day event OR outstation):
  Radio group:
    ○ "Not needed / I will arrange it"  (NOT_NEEDED or CUSTOMER_ARRANGES)
    ○ "Our team will assist with accommodation"  (PLATFORM_BOOKS)
      Note: "We'll coordinate suitable accommodation near your venue. 
             Cost will be communicated separately."
  
  Phase 1: No actual hotel booking — just record the preference.
  Admin will follow up manually for PLATFORM_BOOKS requests.

SAMAGRI ARRANGEMENT:
  Pre-fill from cart (if user came from samagri modal):
    → Show locked selection with [Change] button
    → [Change] opens SamagriModal inline
  
  If no cart:
    Radio group:
      ○ "Pandit Ji will bring samagri (PANDIT_BRINGS)"
        "I'll arrange with Pandit Ji directly"
      ○ "I'll source locally (CUSTOMER_ARRANGES)"
        "No samagri cost added"
      ○ "I need help with samagri (NEED_HELP)"
        "Our team will guide you"
    
    If PANDIT_BRINGS selected:
      Show samagri packages inline (mini version of SamagriModal)
      User must select a package to continue.
      samagriAmount = selectedPackage.fixedPrice

Navigation: [← Back] [Next →]
Validation: foodArrangement and samagriPreference required.

════════════════════════════════════════════════════════════════
STEP 5: REVIEW & PAY
════════════════════════════════════════════════════════════════

BOOKING SUMMARY card (left side on desktop):
  Pandit: [Avatar] [Name] — [Location]
  Event: [pujaType] on [eventDate] at [muhuratTime]
  Venue: [venueCity] — [venueAddress snippet]
  Travel: [travelMode] (if applicable)
  Attendees: [X] (if provided)

PRICE BREAKDOWN card (right side on desktop):
  Use PriceBreakdown component from packages/ui.
  
  Calculate all values client-side using calculatePricing() from packages/utils:
  
  Line items:
  ─────────────────────────────────────────
  Dakshina (GST exempt)          ₹21,000
  Samagri (Standard Package)      ₹5,500
  Travel (Train 3AC)              ₹4,300
  Food Allowance (3 days)         ₹3,000
  Accommodation                   ₹0 (Customer arranging)
  ─────────────────────────────────────────
  Subtotal                       ₹33,800
  ─────────────────────────────────────────
  Platform Fee (15% of dakshina)  ₹3,150
  GST on Platform Fee (18%)         ₹567
  Travel Service Fee (5%)           ₹215
  GST on Travel Fee (18%)            ₹39
  ─────────────────────────────────────────
  GRAND TOTAL                    ₹37,771
  ─────────────────────────────────────────
  
  [▾ What goes to Pandit Ji?]
  Collapsible:
    Net Dakshina:       ₹17,850  (after 15% platform fee)
    Travel Cost:         ₹4,300  (full reimbursement)
    Food Allowance:      ₹3,000  (full pass-through)
    Samagri Earnings:    ₹5,500  (full package price)
    Pandit receives:    ₹30,650  total

TERMS CHECKBOX:
  ☐ "I agree to the Terms of Service and Cancellation Policy"
  (Links open in new tab)

Note about cancellation:
  "📋 Cancellation policy: >7 days: 90% refund | 3–7 days: 50% | 
   <3 days: 20% | Same day: 0%"

[Proceed to Payment — ₹37,771] (saffron, large, full width)
→ Disabled until checkbox ticked
→ On click: 
  1. POST /api/bookings (create booking record, status: CREATED)
  2. POST /api/payments/create-order (create Razorpay order)
  3. Open Razorpay checkout (useRazorpay hook)

RAZORPAY INTEGRATION (useRazorpay.ts in apps/web/hooks/):
```typescript
export function useRazorpay() {
  const openCheckout = async (orderId: string, amount: number, 
                               booking: Booking) => {
    // Load Razorpay script dynamically
    await loadRazorpayScript();
    
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'HmarePanditJi',
      description: `${booking.eventType} - ${booking.bookingNumber}`,
      order_id: orderId,
      theme: { color: '#f49d25' },
      prefill: {
        name: user.name,
        contact: user.phone,
      },
      handler: async (response: RazorpayResponse) => {
        // Verify payment
        const result = await fetch('/api/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            bookingId: booking.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        });
        if (result.ok) {
          // Navigate to step 6
          setStep(6);
        } else {
          toast.error('Payment verification failed. Please contact support.');
        }
      },
      modal: { ondismiss: () => toast.info('Payment cancelled.') }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  
  return { openCheckout };
}
```

════════════════════════════════════════════════════════════════
STEP 6: CONFIRMATION
════════════════════════════════════════════════════════════════

Large success animation (CSS confetti or simple ✅ animation):
"🙏 Booking Confirmed!"

Booking number: HPJ-2026-XXXXX (large, saffron, copyable)

Cards:
  "What happens next?" timeline:
  ✅ Booking created
  ⏳ Pandit Ji notified (within 1 hour)  
  ⏳ Travel will be arranged (if applicable)
  ⏳ You'll receive SMS confirmation

  Pandit contact (if confirmed):
    "Pandit Ji's number will be shared once booking is confirmed"

  "View My Bookings →" button → /dashboard/bookings
  "Book Another Puja →" button → resets wizard → /booking/new

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS TO IMPLEMENT
════════════════════════════════════════════════════════════════

POST /api/bookings (authenticated — CUSTOMER only)
Body: Full wizard state mapped to Booking fields
Logic:
  1. Validate panditId exists and is VERIFIED
  2. Check pandit availability on eventDate (no blocked dates, no bookings)
  3. Calculate all pricing server-side (don't trust client-side totals)
     Use calculatePricing() from packages/utils
  4. Create Booking record with status: CREATED
  5. Create initial BookingStatusUpdate record
  6. Return { bookingId, bookingNumber, grandTotal }

POST /api/payments/create-order (authenticated)
Body: { bookingId }
Logic:
  1. Fetch booking
  2. Create Razorpay order: amount = booking.grandTotal × 100
     notes: { bookingId, bookingNumber, eventType }
  3. Update booking.razorpayOrderId
  4. Return { orderId, amount, currency, keyId }

POST /api/payments/verify (authenticated)
Body: { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
Logic:
  1. Verify HMAC signature
  2. Update booking: paymentStatus=CAPTURED, status=PANDIT_REQUESTED
  3. Update booking: razorpayPaymentId, paymentStatus
  4. Calculate panditPayout:
     dakshina - platformFee + travelCost + foodAllowanceAmount + samagriAmount
  5. Set payoutStatus=PENDING
  6. Create BookingStatusUpdate (CREATED → PANDIT_REQUESTED)
  7. Send notifications (log to console in mock mode):
     [SMS] To customer: "Booking HPJ-XXXX confirmed! ..."
     [SMS] To pandit: "New booking request! Wedding in Delhi ..."
  8. Return { success: true, bookingNumber }
```

---

## IMPORTANT CROSS-CUTTING CONCERNS FOR PART 2

### Environment Variables Needed (add to .env):
```
# Customer Web App (apps/web)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXX
NEXT_PUBLIC_PANDIT_APP_URL=http://localhost:3002
NEXT_PUBLIC_ADMIN_APP_URL=http://localhost:3003
NEXT_PUBLIC_WEB_URL=http://localhost:3000

# API (services/api)
RAZORPAY_KEY_ID=rzp_test_XXXX
RAZORPAY_KEY_SECRET=XXXX
MOCK_OTP=true
MOCK_NOTIFICATIONS=true
MOCK_PAYMENTS=false   # Set true to skip Razorpay (return mock success)
```

### Shared Utils Functions (add to packages/utils/index.ts):
```typescript
// Add to existing CONSTANTS:
SUPPORTED_PUJA_TYPES: [
  "Vivah", "Griha Pravesh", "Satyanarayan Puja", "Mundan", 
  "Namkaran", "Havan / Hom", "Annaprashan", "Upanayana",
  "Kanya Daan", "Grahan Puja"
],
SUPPORTED_LANGUAGES: [
  "Hindi", "Sanskrit", "English", "Bengali", "Tamil",
  "Telugu", "Marathi", "Gujarati", "Punjabi", "Maithili",
  "Bhojpuri", "Odia"
],

// New utility functions:
export function calculateFoodAllowanceDays(
  travelDays: number,
  eventDays: number,
  foodArrangement: 'CUSTOMER_PROVIDES' | 'PLATFORM_ALLOWANCE'
): number {
  return travelDays + (foodArrangement === 'PLATFORM_ALLOWANCE' ? eventDays : 0);
}

export function daysBetween(startDate: string, endDate?: string): number {
  if (!endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
}
```

### Testing Checklist for Part 2:
- [ ] /login page shows role toggle with correct colors
- [ ] Customer login → redirected to homepage
- [ ] Pandit login → redirected to http://localhost:3002/dashboard
- [ ] Guest can view homepage, muhurat explorer, search, pandit profiles
- [ ] Muhurat calendar shows dots on seeded dates
- [ ] Search filters work (pujaType, city, rating)
- [ ] Pandit card shows travel options for outstation pandits
- [ ] Samagri modal opens and both tabs work
- [ ] Booking wizard completes all 6 steps
- [ ] Booking created in database (check via Prisma Studio)
- [ ] SMS logs appear in API console after payment

---

*Next: Part 3 — Pandit Dashboard (Voice-first onboarding, bookings, calendar, earnings)*
*Next: Part 4 — Admin Panel, Notifications, SEO, Launch Checklist*
