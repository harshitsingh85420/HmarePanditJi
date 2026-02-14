# 🚀 Quick Start - Run HmarePanditJi Locally

**5-Minute Setup Guide**

---

## ⚡ Prerequisites Check

Before starting, make sure you have:
- ✅ **Node.js 20+** installed (`node --version`)
- ✅ **pnpm** installed (`pnpm --version`)
- ✅ **Docker Desktop** installed and running

---

## 🎯 5 Simple Steps to Run

### Step 1: Open Docker Desktop
1. Find Docker Desktop in your applications
2. Double-click to open
3. **Wait for it to fully start** (you'll see a green indicator)
4. Leave it running in the background

---

### Step 2: Open Terminal in Project Directory

**Windows (PowerShell):**
```powershell
cd c:\Users\ss\Documents\HmarePanditJi
```

**Windows (CMD):**
```cmd
cd c:\Users\ss\Documents\HmarePanditJi
```

---

### Step 3: Start Database (One Command)

Copy and paste this command:

```bash
docker compose up -d
```

**What this does:**
- Starts PostgreSQL database (where all data is stored)
- Starts pgAdmin (web UI to view database)

**Expected output:**
```
✔ Container hmarepanditji-postgres-1  Started
✔ Container hmarepanditji-pgadmin-1   Started
```

**Verify it worked:**
```bash
docker ps
```
You should see 2 containers running.

---

### Step 4: Setup Database Tables (One Command)

Copy and paste this command:

```bash
pnpm db:push
```

**What this does:**
- Creates all the database tables
- Sets up relationships between tables
- Adds indexes for fast queries

**Expected output:**
```
✔ Your database is now in sync with your Prisma schema. Done in 3.2s
```

---

### Step 5: Load Sample Data (One Command)

Copy and paste this command:

```bash
pnpm db:seed
```

**What this does:**
- Adds 10 verified pandits
- Adds 60+ auspicious dates (muhurats) for 2026
- Adds city distance data (Delhi, Noida, Gurgabar, etc.)
- Adds sample bookings and reviews
- Creates an admin user

**Expected output:**
```
✔ Database seeded successfully!
  - Admin created: +919999999999
  - 10 pandits created
  - 60+ muhurat dates loaded
  - Sample bookings added
```

---

### Step 6: Start All Applications (One Command)

Copy and paste this command:

```bash
pnpm dev
```

**What this does:**
- Starts Customer Website (port 3000)
- Starts Pandit Dashboard (port 3001)
- Starts Admin Panel (port 3002)
- Starts REST API (port 4000)

**Wait 30-60 seconds** for everything to compile (first time only).

**You'll see output like:**
```
web:1     ▲ Next.js 14.x.x
web:1     - Local: http://localhost:3000
web:1     ✓ Ready in 5.2s

pandit:1  ▲ Next.js 14.x.x
pandit:1  - Local: http://localhost:3001
pandit:1  ✓ Ready in 5.3s

admin:1   ▲ Next.js 14.x.x
admin:1   - Local: http://localhost:3002
admin:1   ✓ Ready in 5.1s

api:1     🚀 API Server running on http://localhost:4000
api:1     ✓ Database connected
```

---

## 🎉 You're Done! Now Test the Apps

### 🌐 Access the Applications

Open your browser and visit:

| Application | URL | Purpose |
|------------|-----|---------|
| **Customer Website** | http://localhost:3000 | Browse and book pandits |
| **Pandit Dashboard** | http://localhost:3001 | Manage bookings and profile |
| **Admin Panel** | http://localhost:3002 | Manage platform operations |
| **Database UI** | http://localhost:5555 | View database (run `pnpm db:studio`) |

---

## 🧪 Quick Tests (5 Minutes Each)

### Test 1: Customer Flow (Guest Mode)
1. Go to http://localhost:3000
2. **No login needed!** Browse the homepage
3. Click "Muhurat Explorer" to see auspicious dates
4. Click any date to see details
5. Use the search bar to find pandits
6. Apply filters (language, budget, distance)
7. Click a pandit to view their profile
8. See different travel options (Train, Flight, Self-Drive)
9. Click "Book This Puja" → Login modal appears
10. Enter any phone number → Enter OTP (check terminal for code or use `123456`)
11. Enter your name → Booking wizard starts!

### Test 2: Pandit Flow
1. Go to http://localhost:3001
2. Click "New Pandit? Register Here"
3. Enter phone number and OTP
4. **Try the voice input feature!** Click the microphone icon
5. Complete the 6-step onboarding
6. View your dashboard
7. Toggle the "Online/Offline" switch
8. Check the calendar
9. Try blocking a date

### Test 3: Admin Flow
1. Go to http://localhost:3002
2. Login with: +919999999999 (OTP in terminal or `123456`)
3. View the dashboard with stats
4. Click "Travel Queue" → This is the most important admin feature!
5. Click "Verification Queue" → Approve a pandit
6. Click "Payout Queue" → Process a payout
7. Explore all bookings

---

## 🔍 View Your Database

While the apps are running, open a **new terminal** and run:

```bash
pnpm db:studio
```

This opens a beautiful web UI at **http://localhost:5555** where you can:
- See all tables
- View all data
- Edit records
- Add test data

---

## 🛑 How to Stop Everything

### Stop the Apps (but keep database running)
Press `Ctrl+C` in the terminal where `pnpm dev` is running

### Stop the Database
```bash
docker compose down
```

### Stop Database UI
Press `Ctrl+C` in the terminal where `pnpm db:studio` is running

---

## 🔄 How to Restart

If you closed everything and want to restart:

1. **Start Docker Desktop** (if not running)
2. **Start Database:**
   ```bash
   docker compose up -d
   ```
3. **Start Apps:**
   ```bash
   pnpm dev
   ```

---

## 🆘 Troubleshooting

### Problem: "Docker command not found"
**Solution:** Make sure Docker Desktop is installed and running.

### Problem: "Port 3000 is already in use"
**Solution:** 
- Close any other apps using that port
- Or kill the process: `npx kill-port 3000`

### Problem: "Database connection failed"
**Solution:**
1. Check Docker is running: `docker ps`
2. Restart Docker containers: `docker compose restart`
3. Check `.env` file has correct `DATABASE_URL`

### Problem: "Can't generate Prisma Client"
**Solution:**
```bash
pnpm db:generate
```

### Problem: Apps won't compile
**Solution:**
```bash
# Clear cache and reinstall
rm -rf .turbo node_modules
pnpm install
pnpm dev
```

---

## 📱 Test Credentials

After seeding, you can use:

**Admin:**
- Phone: `+919999999999`
- OTP: Check terminal or use `123456`

**Pandit:**
- Register a new one OR
- Find seeded pandits in Prisma Studio

**Customer:**
- Any phone number works!
- Creates a new customer account automatically

---

## 🎯 What to Test

### Must-Test Features:
- ✅ Guest mode browsing (no login!)
- ✅ Muhurat Explorer calendar
- ✅ Pandit search with filters
- ✅ **Travel mode tabs** (Self-Drive, Train, Flight, Cab)
- ✅ 6-step booking wizard
- ✅ Payment integration (use test card: `4111 1111 1111 1111`)
- ✅ **Voice input** on pandit onboarding (microphone button)
- ✅ Online/offline toggle for pandits
- ✅ "I'm Here" status updates
- ✅ **Admin travel queue** (manual booking workflow)
- ✅ Pandit verification flow
- ✅ Payout processing

---

## 📊 Project Structure

```
HmarePanditJi/
├── apps/
│   ├── web/           → Customer Website (localhost:3000)
│   ├── pandit/        → Pandit Dashboard (localhost:3001)
│   └── admin/         → Admin Panel (localhost:3002)
├── services/
│   └── api/           → REST API (localhost:4000)
├── packages/
│   ├── ui/            → Shared components (29 components)
│   ├── db/            → Database (Prisma)
│   ├── types/         → TypeScript types
│   └── utils/         → Utilities
└── .env               → Environment variables
```

---

## 🎨 Desktop vs Mobile

The apps are **fully responsive**:
- Desktop: See full sidebars, expanded layouts
- Mobile: Bottom navigation, drawer menus

To test mobile view:
1. Open browser DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select a mobile device (iPhone, iPad, etc.)

---

## 🚀 Next Steps After Testing

1. **Review all 45 screens** (see SCREENS_DOCUMENTATION.md)
2. **Test all workflows** (see VALIDATION_GUIDE.md)
3. **Add real API keys** for production:
   - Firebase (Phone Auth)
   - Razorpay (Payments)
   - Twilio (SMS)
4. **Customize content:**
   - Legal pages (Terms, Privacy, Refund)
   - About page
   - Contact information
5. **Deploy to production:**
   - Vercel (for Next.js apps)
   - Railway/Render (for API + DB)
   - Or use the included `render.yaml`

---

## 📚 Additional Documentation

- **SCREENS_DOCUMENTATION.md** - All 45 screens explained
- **IMPLEMENTATION_STATUS.md** - Complete feature checklist
- **LOCAL_SETUP_GUIDE.md** - Detailed setup instructions
- **FEATURE_SHOWCASE.md** - Feature highlights
- **VALIDATION_GUIDE.md** - Testing scenarios
- **PRE_LAUNCH_CHECKLIST.md** - Production readiness

---

## 🎯 Summary Checklist

Before you start:
- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running (green icon)
- [ ] Terminal is open in project directory

Run these commands in order:
1. [ ] `docker compose up -d` (start database)
2. [ ] `pnpm db:push` (create tables)
3. [ ] `pnpm db:seed` (load sample data)
4. [ ] `pnpm dev` (start all apps)

Then visit:
- [ ] http://localhost:3000 (customer)
- [ ] http://localhost:3001 (pandit)
- [ ] http://localhost:3002 (admin)

---

**🎉 Enjoy testing HmarePanditJi!**

**Questions?** Check the other documentation files or the troubleshooting section above.

---

**Last Updated:** February 13, 2026  
**Project Status:** ✅ Phase 1 MVP Complete - Ready for Testing
