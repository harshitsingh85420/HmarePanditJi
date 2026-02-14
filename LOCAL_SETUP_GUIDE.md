# 🚀 HmarePanditJi - Local Setup & Run Guide

## ✅ Step-by-Step Instructions to Run the Project

### Step 1: Start Docker Desktop

**⚠️ IMPORTANT:** Make sure Docker Desktop is running before proceeding.

1. Open Docker Desktop application
2. Wait for it to fully start (green icon in system tray)
3. Verify it's running by opening a terminal and typing: `docker --version`

---

### Step 2: Start PostgreSQL Database

Open a terminal in the project directory and run:

```bash
cd c:\Users\ss\Documents\HmarePanditJi
docker compose up -d
```

This will start:
- **PostgreSQL** database on port `5432`
- **pgAdmin** (database web UI) on port `5050`

**Verify it's running:**
```bash
docker ps
```

You should see two containers running: `postgres` and `pgadmin`

**Access pgAdmin:**
- URL: http://localhost:5050
- Email: admin@hmarepanditji.com
- Password: admin123

---

### Step 3: Install Dependencies (Already Done ✅)

Dependencies are already installed! If you need to reinstall:

```bash
pnpm install
```

---

### Step 4: Setup Database Schema

Push the Prisma schema to the database:

```bash
pnpm db:push
```

This creates all the tables, relationships, and indexes.

---

### Step 5: Seed the Database (Optional but Recommended)

Load sample data including:
- 10 verified pandits
- 60+ muhurat dates for 2026
- City distance matrix (15 cities)
- Sample bookings
- Sample reviews

```bash
pnpm db:seed
```

**Note:** Check the console output for any test credentials.

---

### Step 6: Start All Applications

Run the development server for all apps:

```bash
pnpm dev
```

This starts:
- **Customer Web** on http://localhost:3000
- **Pandit Dashboard** on http://localhost:3001  
- **Admin Panel** on http://localhost:3002
- **REST API** on http://localhost:4000

**Wait for all services to compile** (first time takes 30-60 seconds).

---

## 🎯 Quick Testing Guide

### Test as a Customer (Guest Mode)

1. Open http://localhost:3000
2. Browse the homepage (no login needed!)
3. Click **"Muhurat Explorer"** → see auspicious dates
4. Use the search bar → search for pandits
5. Click any pandit → view full profile with travel options
6. Click **"Book This Puja"** → login modal appears
7. Enter phone number (any number works in dev mode)
8. Enter OTP (check console logs for the code, or use `123456` if in mock mode)
9. Complete your name → redirects to booking wizard
10. Go through all 6 steps of booking
11. At payment step, use Razorpay test cards:
    - Card: `4111 1111 1111 1111`
    - CVV: Any 3 digits
    - Expiry: Any future date
12. View your booking in **"My Bookings"** dashboard

---

### Test as a Pandit

1. Open http://localhost:3001
2. Click **"New Pandit? Register Here"** or login if you seeded data
3. Go through the **voice-first onboarding** (6 steps):
   - Step 1: Personal details (try the microphone button!)
   - Step 2: Puja services you offer
   - Step 3: Travel preferences
   - Step 4: Samagri packages
   - Step 5: Upload documents
   - Step 6: Bank details
4. After onboarding, you'll see the dashboard
5. Toggle **Online/Offline** button (top right)
6. If there are booking requests → click to view
7. **Accept** a booking → see earnings breakdown
8. Update status using **"I'm Here"** buttons:
   - Started Journey
   - Reached Venue
   - Puja Started
   - Puja Complete
9. View **Calendar** → block/unblock dates
10. Check **Earnings** page → see monthly reports

---

### Test as Admin

1. Open http://localhost:3002
2. Login with admin credentials:
   - Phone: `+919999999999` (seeded)
   - OTP: Check console or use `123456`
3. View **Dashboard** → see stats and activity
4. Click **"Travel Queue"** → Most important admin feature!
   - See bookings that need travel booking
   - Click **"Calculate Travel"** → see breakdown
   - Click **"Book on IRCTC/MMT"** → copies details
   - Enter booking reference and mark as booked
5. Click **"Verification Queue"** → approve/reject pandits
6. Click **"Payout Queue"** → process payouts manually
7. Click **"All Bookings"** → see complete list with filters
8. Click **"Pandits"** → manage all pandits

---

## 🗄️ Database Management

### View Database (Prisma Studio)

```bash
pnpm db:studio
```

Opens a beautiful web UI at http://localhost:5555 to:
- View all tables
- Edit data
- Add test records
- Delete records

### Reset Database (Fresh Start)

```bash
pnpm db:push --force-reset
pnpm db:seed
```

**⚠️ Warning:** This deletes ALL data and recreates fresh!

---

## 🔧 Troubleshooting

### Problem: "Database connection failed"

**Solution:**
1. Make sure Docker Desktop is running
2. Check containers: `docker ps`
3. Restart containers: `docker compose restart`
4. Check .env file has correct DATABASE_URL

### Problem: "Port already in use"

**Solution:**
1. Stop the process using that port
2. Or change ports in .env:
   ```
   # Change in .env:
   API_PORT=4001  (instead of 4000)
   
   # Then update NEXT_PUBLIC_API_URL in all apps
   ```

### Problem: "Module not found" errors

**Solution:**
```bash
pnpm install
pnpm db:generate
```

### Problem: "Prisma Client not generated"

**Solution:**
```bash
pnpm db:generate
```

### Problem: Apps won't start

**Solution:**
1. Clear Turbo cache: `rm -rf .turbo`
2. Clear node_modules: `rm -rf node_modules`
3. Reinstall: `pnpm install`
4. Try again: `pnpm dev`

---

## 📁 Project Structure Quick Reference

```
HmarePanditJi/
├── apps/
│   ├── web/           → Customer app (localhost:3000)
│   ├── pandit/        → Pandit dashboard (localhost:3001)
│   └── admin/         → Admin panel (localhost:3002)
├── services/
│   └── api/           → REST API (localhost:4000)
├── packages/
│   ├── ui/            → Shared components (29 components)
│   ├── db/            → Prisma schema & seed
│   ├── types/         → TypeScript types
│   └── utils/         → Shared utilities
├── .env               → Environment variables
└── docker-compose.yml → PostgreSQL + pgAdmin
```

---

## 🎨 Key Features to Test

### ✨ Customer Features
- [x] Guest mode browsing (no login!)
- [x] Muhurat Explorer with calendar
- [x] Advanced pandit search (8+ filters)
- [x] Travel mode comparison tabs
- [x] 6-step booking wizard
- [x] Dual samagri selection (packages vs custom)
- [x] Razorpay payment integration
- [x] Booking dashboard with timeline
- [x] Reviews and favorites

### 🎙️ Pandit Features
- [x] Voice-first onboarding (try the mic!)
- [x] Online/offline toggle
- [x] Accept/reject bookings
- [x] "I'm Here" status updates (4 stages)
- [x] Calendar date blocking
- [x] Earnings dashboard
- [x] Profile & service management

### 🔧 Admin Features
- [x] **Travel Queue** (manual IRCTC/MMT booking)
- [x] Pandit verification workflow
- [x] Payout processing (manual)
- [x] Booking management with filters
- [x] Customer & pandit management

---

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Customer Web | http://localhost:3000 | Any phone (guest mode) |
| Pandit Dashboard | http://localhost:3001 | Register or use seeded |
| Admin Panel | http://localhost:3002 | +919999999999 (seeded) |
| REST API | http://localhost:4000/api/v1 | - |
| Prisma Studio | http://localhost:5555 | Run `pnpm db:studio` |
| pgAdmin | http://localhost:5050 | admin@hmarepanditji.com / admin123 |

---

## 📞 Mock Mode Features

By default, these work in **mock mode** (no real API calls):

1. **Phone OTP:** Console logs OTP instead of SMS
2. **Razorpay:** Test mode (use test cards)
3. **Twilio SMS:** Console logs instead of sending
4. **Travel Booking:** Manual ops (copy to IRCTC/MMT)

To enable real services, add API keys to `.env`:
- Firebase (Phone Auth)
- Razorpay (Payments)
- Twilio (SMS)
- Google Maps (Optional)

---

## 📚 Documentation Files

- **SCREENS_DOCUMENTATION.md** - Complete list of all 45 screens
- **FEATURE_SHOWCASE.md** - Detailed feature list
- **VALIDATION_GUIDE.md** - Testing scenarios
- **PRE_LAUNCH_CHECKLIST.md** - Production readiness
- **README.md** - Quick start guide

---

## 🎯 Next Steps

1. **Test Everything:** Go through customer, pandit, and admin workflows
2. **Review Data:** Use Prisma Studio to see seeded data
3. **Add Real Keys:** For production features (Firebase, Razorpay, Twilio)
4. **Customize Content:** Update legal pages, about page, contact info
5. **Deploy:** Use render.yaml for deployment (already configured)

---

## ⚡ Quick Commands Cheat Sheet

```bash
# Start database
docker compose up -d

# Install dependencies
pnpm install

# Setup database
pnpm db:push

# Seed data
pnpm db:seed

# Start all apps
pnpm dev

# View database
pnpm db:studio

# Reset database
pnpm db:push --force-reset

# Stop database
docker compose down

# View logs
docker compose logs -f postgres
```

---

**Ready to run? Follow the steps above! 🚀**

**Current Status:** ✅ Dependencies installed, ready for Docker & database setup
