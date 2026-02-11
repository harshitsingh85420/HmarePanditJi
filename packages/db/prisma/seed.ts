/**
 * HmarePanditJi — Prisma Seed Script
 * Run: pnpm --filter @hmarepanditji/db seed
 *
 * Creates:
 *  • 1 admin user
 *  • 15 pandit profiles (Delhi-NCR, varied specs & ratings)
 *  • 5 customer users
 *  • 8 ritual types
 *  • 10 bookings  (3 completed, 3 confirmed, 2 pending, 1 cancelled, 1 in_progress)
 *  • 5 reviews with Hindi/Hinglish comments
 */

import { PrismaClient, UserRole, GenderEnum, RitualCategory, BookingStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bookingNumber(): string {
  return `HPJ${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding HmarePanditJi database…");

  // ── 1. Admin user ────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { phone: "+919999999999" },
    update: {},
    create: {
      phone: "+919999999999",
      email: "admin@hmarepanditji.com",
      fullName: "Super Admin",
      role: UserRole.ADMIN,
      isPhoneVerified: true,
      profileCompleted: true,
      preferredLanguage: "hindi",
    },
  });
  console.log("✅  Admin user created:", adminUser.phone);

  // ── 2. Rituals ───────────────────────────────────────────────────────────
  const ritualData = [
    {
      name: "Vivah Sanskar",
      nameHindi: "विवाह संस्कार",
      description: "Traditional Hindu wedding ceremony with Vedic rituals performed by a learned pandit.",
      descriptionHindi: "वैदिक मंत्रों के साथ पूर्ण हिंदू विवाह संस्कार, सप्तपदी एवं कन्यादान सहित।",
      category: RitualCategory.WEDDING,
      basePriceMin: 15000,
      basePriceMax: 35000,
      durationHours: 5,
    },
    {
      name: "Griha Pravesh",
      nameHindi: "गृह प्रवेश",
      description: "Housewarming puja to bless a new home and invite positive energy.",
      descriptionHindi: "नए घर में प्रवेश से पहले वास्तु शांति और लक्ष्मी पूजन।",
      category: RitualCategory.GRIHA,
      basePriceMin: 5000,
      basePriceMax: 11000,
      durationHours: 2.5,
    },
    {
      name: "Satyanarayan Katha",
      nameHindi: "सत्यनारायण कथा",
      description: "Satyanarayan Vrat Katha recitation with full puja vidhi.",
      descriptionHindi: "भगवान सत्यनारायण की कथा एवं पंचामृत अभिषेक के साथ पूर्ण पूजन।",
      category: RitualCategory.PUJA,
      basePriceMin: 3500,
      basePriceMax: 7000,
      durationHours: 2,
    },
    {
      name: "Mundan Sanskar",
      nameHindi: "मुंडन संस्कार",
      description: "First haircut ceremony for a child — an important Hindu rite of passage.",
      descriptionHindi: "बच्चे का पहला मुंडन — चूड़ाकर्म संस्कार वेद विधि से।",
      category: RitualCategory.PUJA,
      basePriceMin: 2500,
      basePriceMax: 5000,
      durationHours: 1.5,
    },
    {
      name: "Namkaran Sanskar",
      nameHindi: "नामकरण संस्कार",
      description: "Name-giving ceremony for a newborn, performed on the 11th or 21st day.",
      descriptionHindi: "नवजात शिशु का नामकरण संस्कार — जन्म के ग्यारहवें या इक्कीसवें दिन।",
      category: RitualCategory.PUJA,
      basePriceMin: 2000,
      basePriceMax: 4500,
      durationHours: 1,
    },
    {
      name: "Shanti Path",
      nameHindi: "शांति पाठ",
      description: "Vedic peace recitation to remove Vastu dosha, graha dosha, or ancestral afflictions.",
      descriptionHindi: "वास्तु दोष, ग्रह दोष या पितृ दोष शांति के लिए वैदिक शांति पाठ।",
      category: RitualCategory.SHANTI,
      basePriceMin: 4000,
      basePriceMax: 9000,
      durationHours: 3,
    },
    {
      name: "Rudrabhishek",
      nameHindi: "रुद्राभिषेक",
      description: "Shiva worship with Panchamrit and Bilva offering — Ekadashi or Pradosh special.",
      descriptionHindi: "भगवान शिव का पंचामृत अभिषेक, बिल्वपत्र अर्पण और रुद्राष्टाध्यायी पाठ।",
      category: RitualCategory.PUJA,
      basePriceMin: 4500,
      basePriceMax: 10000,
      durationHours: 2.5,
    },
    {
      name: "Sunderkand Path",
      nameHindi: "सुंदरकांड पाठ",
      description: "Recitation of the Sunderkand from Ramcharitmanas for prosperity and protection.",
      descriptionHindi: "रामचरितमानस के सुंदरकांड का शुद्ध पाठ — घर में सुख-समृद्धि और बाधाओं का नाश।",
      category: RitualCategory.PUJA,
      basePriceMin: 3000,
      basePriceMax: 6000,
      durationHours: 2,
    },
  ];

  const rituals: Record<string, { id: string }> = {};
  for (const r of ritualData) {
    const ritual = await prisma.ritual.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    rituals[r.name] = ritual;
    console.log(`✅  Ritual: ${ritual.name}`);
  }

  // ── 3. Pandit users + profiles ───────────────────────────────────────────
  const panditSeedData = [
    {
      phone: "+919810001001",
      fullName: "Pandit Rajesh Kumar Sharma",
      displayName: "Pt. Rajesh Sharma",
      bio: "Kashi Vidyapeeth se shiksha prapt, 22 saal ka anubhav. Wedding aur Griha Pravesh mein vishesh dakshata. Delhi-NCR mein 800+ pujas sampann ki hain. Samay par aane ka vachan deta hoon.",
      experienceYears: 22,
      specializations: ["Vivah Sanskar", "Griha Pravesh", "Satyanarayan Katha"],
      languages: ["Hindi", "Sanskrit", "Bhojpuri"],
      sect: "Shaiva",
      gotra: "Bharadwaj",
      city: "Noida",
      averageRating: 4.9,
      totalReviews: 312,
      totalBookings: 320,
      isVerified: true,
      basePricing: { SELF_DRIVE: 4000, TRAIN: 5500, FLIGHT: 9000 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001002",
      fullName: "Pandit Vikas Tiwari",
      displayName: "Pt. Vikas Tiwari",
      bio: "BHU se Jyotish aur Karmakand mein post-graduation kiya hai. Satyanarayan Katha aur Namkaran ke specialist hoon. Gurgaon, Noida aur South Delhi mein available.",
      experienceYears: 14,
      specializations: ["Satyanarayan Katha", "Namkaran Sanskar", "Mundan Sanskar"],
      languages: ["Hindi", "Sanskrit", "English"],
      sect: "Vaishnava",
      gotra: "Kashyap",
      city: "Delhi",
      averageRating: 4.7,
      totalReviews: 189,
      totalBookings: 195,
      isVerified: true,
      basePricing: { SELF_DRIVE: 3500, TRAIN: 4500, FLIGHT: 8000 },
      availableDays: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001003",
      fullName: "Pandit Ramesh Chandra Dubey",
      displayName: "Pt. Ramesh Dubey",
      bio: "Rudrabhishek aur Shanti Path mein 18 saal ka anubhav. Shiv bhakti ke saath pure Vedic vidhi se puja karata hoon. Har Pradosh aur Ekadashi par special puja available.",
      experienceYears: 18,
      specializations: ["Rudrabhishek", "Shanti Path", "Satyanarayan Katha"],
      languages: ["Hindi", "Sanskrit"],
      sect: "Shaiva",
      gotra: "Vashishtha",
      city: "Gurgaon",
      averageRating: 4.8,
      totalReviews: 245,
      totalBookings: 252,
      isVerified: true,
      basePricing: { SELF_DRIVE: 3800, TRAIN: 5000, FLIGHT: 8500 },
      availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001004",
      fullName: "Pandit Suresh Kumar Mishra",
      displayName: "Pt. Suresh Mishra",
      bio: "Faridabad ke jaane-maane pandit. 25 saal mein 1000 se zyada shadiyan karayi hain. Muhurat nikalna aur Mangalashtak padhna meri visheshata hai.",
      experienceYears: 25,
      specializations: ["Vivah Sanskar", "Mundan Sanskar", "Namkaran Sanskar"],
      languages: ["Hindi", "Sanskrit", "Maithili"],
      sect: "Smarta",
      gotra: "Gautam",
      city: "Faridabad",
      averageRating: 4.9,
      totalReviews: 421,
      totalBookings: 435,
      isVerified: true,
      basePricing: { SELF_DRIVE: 5000, TRAIN: 6500, FLIGHT: 11000 },
      availableDays: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001005",
      fullName: "Pandit Arun Kumar Pathak",
      displayName: "Pt. Arun Pathak",
      bio: "Sunderkand aur Satyanarayan Katha mein vishesh ruchi aur gyaan. Pure Tulsidas ji ki bhasha mein path karta hoon. Puja ke baad prasad vitaran ki vyavastha bhi karta hoon.",
      experienceYears: 12,
      specializations: ["Sunderkand Path", "Satyanarayan Katha", "Shanti Path"],
      languages: ["Hindi", "Sanskrit", "Awadhi"],
      sect: "Vaishnava",
      gotra: "Bharadwaj",
      city: "Delhi",
      averageRating: 4.6,
      totalReviews: 143,
      totalBookings: 148,
      isVerified: true,
      basePricing: { SELF_DRIVE: 3000, TRAIN: 4000, FLIGHT: 7500 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: false,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001006",
      fullName: "Pandit Dinesh Kumar Upadhyay",
      displayName: "Pt. Dinesh Upadhyay",
      bio: "Griha Pravesh aur Namkaran ke liye Noida, Greater Noida aur Ghaziabad mein available. Vastu ke anusar puja karta hoon. Online muhurat seva bhi deta hoon.",
      experienceYears: 10,
      specializations: ["Griha Pravesh", "Namkaran Sanskar", "Rudrabhishek"],
      languages: ["Hindi", "Sanskrit", "English"],
      sect: "Smarta",
      gotra: "Atri",
      city: "Noida",
      averageRating: 4.5,
      totalReviews: 98,
      totalBookings: 102,
      isVerified: true,
      basePricing: { SELF_DRIVE: 3200, TRAIN: 4200, FLIGHT: 7800 },
      availableDays: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: false,
      bankAccountAdded: false,
    },
    {
      phone: "+919810001007",
      fullName: "Pandit Mahesh Chandra Pandey",
      displayName: "Pt. Mahesh Pandey",
      bio: "Delhi ke purane aur vishwasneey pandit. Rudrabhishek aur Vivah dono mein 20 saal ka anubhav. Samagri ki list pehle bhej deta hoon taaki koi pareshani na ho.",
      experienceYears: 20,
      specializations: ["Vivah Sanskar", "Rudrabhishek", "Griha Pravesh"],
      languages: ["Hindi", "Sanskrit"],
      sect: "Shaiva",
      gotra: "Sandilya",
      city: "Delhi",
      averageRating: 4.7,
      totalReviews: 278,
      totalBookings: 285,
      isVerified: true,
      basePricing: { SELF_DRIVE: 4200, TRAIN: 5800, FLIGHT: 10000 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001008",
      fullName: "Pandit Prakash Narayan Joshi",
      displayName: "Pt. Prakash Joshi",
      bio: "Ghaziabad aur East Delhi mein active pandit. Sabhi tarah ki pujas karta hoon — choti se badi. Reasonable rates aur time ki pabandhi meri pehchaan hai.",
      experienceYears: 8,
      specializations: ["Satyanarayan Katha", "Griha Pravesh", "Mundan Sanskar", "Namkaran Sanskar"],
      languages: ["Hindi", "Sanskrit", "Punjabi"],
      sect: "Smarta",
      gotra: "Kashyap",
      city: "Ghaziabad",
      averageRating: 4.4,
      totalReviews: 87,
      totalBookings: 91,
      isVerified: false,
      basePricing: { SELF_DRIVE: 2800, TRAIN: 3800, FLIGHT: 7000 },
      availableDays: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: false,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001009",
      fullName: "Pandit Santosh Kumar Shukla",
      displayName: "Pt. Santosh Shukla",
      bio: "Vedic parampara ke pakke anuyayi. Shudh Sanskrit uccharan aur sahi vidhi se puja karna meri prathimkta hai. Kisi bhi puja mein shortcut nahi leta.",
      experienceYears: 16,
      specializations: ["Shanti Path", "Rudrabhishek", "Vivah Sanskar"],
      languages: ["Hindi", "Sanskrit"],
      sect: "Shaiva",
      gotra: "Parashar",
      city: "Delhi",
      averageRating: 4.8,
      totalReviews: 201,
      totalBookings: 208,
      isVerified: true,
      basePricing: { SELF_DRIVE: 3900, TRAIN: 5200, FLIGHT: 9200 },
      availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001010",
      fullName: "Pandit Deepak Kumar Dwivedi",
      displayName: "Pt. Deepak Dwivedi",
      bio: "Katha vachak aur karmakandi dono. Satyanarayan Katha, Bhagwat Katha aur Ramkatha mein mahir. Family atmosphere ke saath puja ko ananda mahotsav banata hoon.",
      experienceYears: 15,
      specializations: ["Satyanarayan Katha", "Sunderkand Path", "Vivah Sanskar"],
      languages: ["Hindi", "Sanskrit", "Braj"],
      sect: "Vaishnava",
      gotra: "Bharadwaj",
      city: "Delhi",
      averageRating: 4.6,
      totalReviews: 167,
      totalBookings: 172,
      isVerified: true,
      basePricing: { SELF_DRIVE: 3600, TRAIN: 4800, FLIGHT: 8500 },
      availableDays: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001011",
      fullName: "Pandit Anand Prakash Trivedi",
      displayName: "Pt. Anand Trivedi",
      bio: "Shanti path aur pitru karma mein vishesh anubhav. Griha dosha, Vastu dosha aur pitru dosha nivaran mein daksh. Noida aur Greater Noida mein available.",
      experienceYears: 17,
      specializations: ["Shanti Path", "Rudrabhishek", "Satyanarayan Katha"],
      languages: ["Hindi", "Sanskrit"],
      sect: "Smarta",
      gotra: "Vashishtha",
      city: "Noida",
      averageRating: 4.5,
      totalReviews: 134,
      totalBookings: 139,
      isVerified: true,
      basePricing: { SELF_DRIVE: 3400, TRAIN: 4600, FLIGHT: 8200 },
      availableDays: ["Monday", "Tuesday", "Thursday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001012",
      fullName: "Pandit Ravi Shankar Gautam",
      displayName: "Pt. Ravi Gautam",
      bio: "Namkaran aur Mundan ke liye Gurgaon ka pasandida pandit. Bachcho ke sanskar ki sahi umra aur nakshatra dekhkar shubh muhurat nikalata hoon.",
      experienceYears: 11,
      specializations: ["Namkaran Sanskar", "Mundan Sanskar", "Griha Pravesh"],
      languages: ["Hindi", "Sanskrit", "Haryanvi"],
      sect: "Vaishnava",
      gotra: "Gautam",
      city: "Gurgaon",
      averageRating: 4.4,
      totalReviews: 76,
      totalBookings: 80,
      isVerified: false,
      basePricing: { SELF_DRIVE: 2900, TRAIN: 3900, FLIGHT: 7200 },
      availableDays: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: false,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001013",
      fullName: "Pandit Kishore Lal Bhardwaj",
      displayName: "Pt. Kishore Bhardwaj",
      bio: "Delhi ke senior pandit — 30 saal mein hazaron weddings. Mangalashtak, Saptapadi, Kanyadan sabhi Vivah vidhi puri niyam se karta hoon. Clients ki satisfaction meri priority hai.",
      experienceYears: 30,
      specializations: ["Vivah Sanskar", "Griha Pravesh", "Shanti Path"],
      languages: ["Hindi", "Sanskrit", "Punjabi"],
      sect: "Smarta",
      gotra: "Bharadwaj",
      city: "Delhi",
      averageRating: 4.9,
      totalReviews: 567,
      totalBookings: 580,
      isVerified: true,
      basePricing: { SELF_DRIVE: 6000, TRAIN: 8000, FLIGHT: 14000 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      aadhaarVerified: true,
      certificatesVerified: true,
      bankAccountAdded: true,
    },
    {
      phone: "+919810001014",
      fullName: "Pandit Hemant Kumar Vajpayee",
      displayName: "Pt. Hemant Vajpayee",
      bio: "Sunderkand aur Satyanarayan Katha mere favourite hain. Har puja mein bhajan aur kirtan bhi shaamil karta hoon. South Delhi aur Gurgaon mein 10 saal se active.",
      experienceYears: 10,
      specializations: ["Sunderkand Path", "Satyanarayan Katha", "Namkaran Sanskar"],
      languages: ["Hindi", "Sanskrit", "English"],
      sect: "Vaishnava",
      gotra: "Sandilya",
      city: "Delhi",
      averageRating: 4.3,
      totalReviews: 61,
      totalBookings: 65,
      isVerified: false,
      basePricing: { SELF_DRIVE: 2700, TRAIN: 3700, FLIGHT: 6800 },
      availableDays: ["Monday", "Thursday", "Friday", "Saturday", "Sunday"],
      aadhaarVerified: false,
      certificatesVerified: false,
      bankAccountAdded: false,
    },
    {
      phone: "+919810001015",
      fullName: "Pandit Sanjay Kumar Chaturvedi",
      displayName: "Pt. Sanjay Chaturvedi",
      bio: "Har tarah ki puja ke liye ek hi vishwasneey pandit. Choti puja ho ya badi ceremony — dono mein samaan dhyan aur bhakti deta hoon. WhatsApp par samagri list available.",
      experienceYears: 13,
      specializations: ["Satyanarayan Katha", "Griha Pravesh", "Rudrabhishek", "Shanti Path"],
      languages: ["Hindi", "Sanskrit", "Kannada"],
      sect: "Smarta",
      gotra: "Atri",
      city: "Delhi",
      averageRating: 4.2,
      totalReviews: 55,
      totalBookings: 58,
      isVerified: false,
      basePricing: { SELF_DRIVE: 2600, TRAIN: 3500, FLIGHT: 6500 },
      availableDays: ["Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
      aadhaarVerified: true,
      certificatesVerified: false,
      bankAccountAdded: true,
    },
  ];

  const panditMap: Record<string, { userId: string; panditId: string }> = {};

  for (const p of panditSeedData) {
    const user = await prisma.user.upsert({
      where: { phone: p.phone },
      update: {},
      create: {
        phone: p.phone,
        fullName: p.fullName,
        role: UserRole.PANDIT,
        isPhoneVerified: true,
        profileCompleted: true,
        preferredLanguage: "hindi",
      },
    });

    const pandit = await prisma.pandit.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: p.displayName,
        bio: p.bio,
        experienceYears: p.experienceYears,
        specializations: p.specializations,
        languages: p.languages,
        sect: p.sect,
        gotra: p.gotra,
        city: p.city,
        state: p.city === "Noida" || p.city === "Ghaziabad" ? "Uttar Pradesh" : p.city === "Gurgaon" || p.city === "Faridabad" ? "Haryana" : "Delhi",
        isVerified: p.isVerified,
        isActive: true,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        totalBookings: p.totalBookings,
        basePricing: p.basePricing,
        availableDays: p.availableDays,
        aadhaarVerified: p.aadhaarVerified,
        certificatesVerified: p.certificatesVerified,
        bankAccountAdded: p.bankAccountAdded,
      },
    });

    panditMap[p.phone] = { userId: user.id, panditId: pandit.id };
    console.log(`✅  Pandit: ${p.displayName} (${p.city})`);
  }

  // ── 4. Customer users ────────────────────────────────────────────────────
  const customerSeedData = [
    {
      phone: "+919810002001",
      fullName: "Amit Agarwal",
      email: "amit.agarwal@gmail.com",
      gender: GenderEnum.MALE,
      gotra: "Kashyap",
      addressLine1: "B-42, Sector 62",
      addressLine2: "Near Fortis Hospital",
      city: "Noida",
      postalCode: "201309",
    },
    {
      phone: "+919810002002",
      fullName: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      gender: GenderEnum.FEMALE,
      gotra: "Bharadwaj",
      addressLine1: "C-15, Vasant Kunj",
      addressLine2: "Block C",
      city: "Delhi",
      postalCode: "110070",
    },
    {
      phone: "+919810002003",
      fullName: "Rohit Gupta",
      email: "rohit.gupta@yahoo.com",
      gender: GenderEnum.MALE,
      gotra: "Gautam",
      addressLine1: "A-12, DLF Phase 2",
      addressLine2: "Sector 25",
      city: "Gurgaon",
      postalCode: "122002",
    },
    {
      phone: "+919810002004",
      fullName: "Sunita Verma",
      email: "sunita.verma@gmail.com",
      gender: GenderEnum.FEMALE,
      gotra: "Vashishtha",
      addressLine1: "H-78, Indirapuram",
      addressLine2: "Nyay Khand 1",
      city: "Ghaziabad",
      postalCode: "201014",
    },
    {
      phone: "+919810002005",
      fullName: "Vijay Kumar Singh",
      email: "vijay.singh@hotmail.com",
      gender: GenderEnum.MALE,
      gotra: "Sandilya",
      addressLine1: "E-234, Sector 14",
      city: "Faridabad",
      postalCode: "121007",
    },
  ];

  const customerMap: Record<string, { userId: string; customerId: string }> = {};

  for (const c of customerSeedData) {
    const user = await prisma.user.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        phone: c.phone,
        email: c.email,
        fullName: c.fullName,
        role: UserRole.CUSTOMER,
        isPhoneVerified: true,
        profileCompleted: true,
        preferredLanguage: "hindi",
      },
    });

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        gender: c.gender,
        gotra: c.gotra,
        addresses: {
          create: {
            label: "HOME",
            addressLine1: c.addressLine1,
            addressLine2: c.addressLine2 ?? null,
            city: c.city,
            state:
              c.city === "Noida" || c.city === "Ghaziabad"
                ? "Uttar Pradesh"
                : c.city === "Gurgaon" || c.city === "Faridabad"
                  ? "Haryana"
                  : "Delhi",
            postalCode: c.postalCode,
            isPrimary: true,
          },
        },
      },
    });

    customerMap[c.phone] = { userId: user.id, customerId: customer.id };
    console.log(`✅  Customer: ${c.fullName}`);
  }

  // ── 5. Bookings ──────────────────────────────────────────────────────────
  const p1 = panditMap["+919810001001"]!;  // Pt. Rajesh Sharma
  const p2 = panditMap["+919810001002"]!;  // Pt. Vikas Tiwari
  const p3 = panditMap["+919810001003"]!;  // Pt. Ramesh Dubey
  const p4 = panditMap["+919810001007"]!;  // Pt. Mahesh Pandey
  const p5 = panditMap["+919810001009"]!;  // Pt. Santosh Shukla

  const c1 = customerMap["+919810002001"]!;  // Amit Agarwal
  const c2 = customerMap["+919810002002"]!;  // Priya Sharma
  const c3 = customerMap["+919810002003"]!;  // Rohit Gupta
  const c4 = customerMap["+919810002004"]!;  // Sunita Verma
  const c5 = customerMap["+919810002005"]!;  // Vijay Kumar Singh

  const r_vivah = rituals["Vivah Sanskar"]!;
  const r_griha = rituals["Griha Pravesh"]!;
  const r_satya = rituals["Satyanarayan Katha"]!;
  const r_mundan = rituals["Mundan Sanskar"]!;
  const r_rudra = rituals["Rudrabhishek"]!;

  const bookingSeeds = [
    // ── COMPLETED × 3 ──────────────────────────────────────────────────────
    {
      bookingNumber: bookingNumber(),
      customerId: c1.customerId,
      panditId: p1.panditId,
      ritualId: r_vivah.id,
      status: BookingStatus.COMPLETED,
      eventDate: daysAgo(45),
      eventTime: "07:30",
      muhurat: "Brahma Muhurat — 05:48 to 07:36",
      venueAddress: { addressLine1: "C-12, Sector 50, Noida", city: "Noida", postalCode: "201301" },
      pricing: { base: 20000, travelCharges: 0, total: 20000, travelMode: "SELF_DRIVE" },
      paymentStatus: PaymentStatus.PAID,
      travelMode: "SELF_DRIVE",
      numberOfAttendees: 150,
      completedAt: daysAgo(45),
      panditAcceptedAt: daysAgo(50),
      customerNotes: "Sarson ka tel aur white cloth please arrange karo",
    },
    {
      bookingNumber: bookingNumber(),
      customerId: c2.customerId,
      panditId: p2.panditId,
      ritualId: r_satya.id,
      status: BookingStatus.COMPLETED,
      eventDate: daysAgo(20),
      eventTime: "18:00",
      venueAddress: { addressLine1: "C-15, Vasant Kunj, Block C", city: "Delhi", postalCode: "110070" },
      pricing: { base: 4500, travelCharges: 0, total: 4500, travelMode: "SELF_DRIVE" },
      paymentStatus: PaymentStatus.PAID,
      travelMode: "SELF_DRIVE",
      numberOfAttendees: 25,
      completedAt: daysAgo(20),
      panditAcceptedAt: daysAgo(25),
    },
    {
      bookingNumber: bookingNumber(),
      customerId: c3.customerId,
      panditId: p3.panditId,
      ritualId: r_rudra.id,
      status: BookingStatus.COMPLETED,
      eventDate: daysAgo(10),
      eventTime: "06:00",
      muhurat: "Brahma Muhurat",
      venueAddress: { addressLine1: "A-12, DLF Phase 2, Sector 25", city: "Gurgaon", postalCode: "122002" },
      pricing: { base: 6000, travelCharges: 1500, total: 7500, travelMode: "TRAIN" },
      paymentStatus: PaymentStatus.PAID,
      travelMode: "TRAIN",
      numberOfAttendees: 10,
      completedAt: daysAgo(10),
      panditAcceptedAt: daysAgo(15),
    },
    // ── CONFIRMED × 3 ──────────────────────────────────────────────────────
    {
      bookingNumber: bookingNumber(),
      customerId: c4.customerId,
      panditId: p4.panditId,
      ritualId: r_griha.id,
      status: BookingStatus.CONFIRMED,
      eventDate: daysFromNow(5),
      eventTime: "10:00",
      muhurat: "Abhijit Muhurat — 11:45 to 12:30",
      venueAddress: { addressLine1: "H-78, Indirapuram, Nyay Khand 1", city: "Ghaziabad", postalCode: "201014" },
      pricing: { base: 7000, travelCharges: 0, total: 7000, travelMode: "SELF_DRIVE" },
      paymentStatus: PaymentStatus.PAID,
      travelMode: "SELF_DRIVE",
      numberOfAttendees: 30,
      panditAcceptedAt: daysAgo(3),
      specialRequirements: "Nariyal, aam ki patti aur kumkum customer arrange karega",
    },
    {
      bookingNumber: bookingNumber(),
      customerId: c5.customerId,
      panditId: p5.panditId,
      ritualId: r_vivah.id,
      status: BookingStatus.CONFIRMED,
      eventDate: daysFromNow(12),
      eventTime: "06:15",
      muhurat: "Lagna muhurat — Magha nakshatra",
      venueAddress: { addressLine1: "E-234, Sector 14, Faridabad", city: "Faridabad", postalCode: "121007" },
      pricing: { base: 25000, travelCharges: 3000, total: 28000, travelMode: "TRAIN" },
      paymentStatus: PaymentStatus.PAID,
      travelMode: "TRAIN",
      numberOfAttendees: 200,
      panditAcceptedAt: daysAgo(2),
    },
    {
      bookingNumber: bookingNumber(),
      customerId: c1.customerId,
      panditId: p2.panditId,
      ritualId: r_mundan.id,
      status: BookingStatus.CONFIRMED,
      eventDate: daysFromNow(8),
      eventTime: "09:00",
      venueAddress: { addressLine1: "B-42, Sector 62, Noida", city: "Noida", postalCode: "201309" },
      pricing: { base: 3500, travelCharges: 0, total: 3500, travelMode: "SELF_DRIVE" },
      paymentStatus: PaymentStatus.PAID,
      travelMode: "SELF_DRIVE",
      numberOfAttendees: 40,
      panditAcceptedAt: daysAgo(1),
    },
    // ── PENDING × 2 ────────────────────────────────────────────────────────
    {
      bookingNumber: bookingNumber(),
      customerId: c2.customerId,
      panditId: p1.panditId,
      ritualId: r_griha.id,
      status: BookingStatus.PENDING,
      eventDate: daysFromNow(20),
      eventTime: "11:00",
      venueAddress: { addressLine1: "Flat 302, Lotus Heights, Sector 18", city: "Noida", postalCode: "201301" },
      pricing: { base: 6500, travelCharges: 0, total: 6500, travelMode: "SELF_DRIVE" },
      paymentStatus: PaymentStatus.PENDING,
      travelMode: "SELF_DRIVE",
      numberOfAttendees: 20,
      customerNotes: "Vastu ke hisaab se puja karni hai, please discuss before date",
    },
    {
      bookingNumber: bookingNumber(),
      customerId: c3.customerId,
      panditId: p3.panditId,
      ritualId: r_satya.id,
      status: BookingStatus.PENDING,
      eventDate: daysFromNow(15),
      eventTime: "17:30",
      venueAddress: { addressLine1: "Flat 801, Emaar Palm Square, Sector 66", city: "Gurgaon", postalCode: "122018" },
      pricing: { base: 5000, travelCharges: 1200, total: 6200, travelMode: "TRAIN" },
      paymentStatus: PaymentStatus.PENDING,
      travelMode: "TRAIN",
      numberOfAttendees: 50,
    },
    // ── CANCELLED × 1 ──────────────────────────────────────────────────────
    {
      bookingNumber: bookingNumber(),
      customerId: c4.customerId,
      panditId: p4.panditId,
      ritualId: r_vivah.id,
      status: BookingStatus.CANCELLED,
      eventDate: daysAgo(5),
      eventTime: "07:00",
      venueAddress: { addressLine1: "Community Hall, Indirapuram", city: "Ghaziabad", postalCode: "201014" },
      pricing: { base: 22000, travelCharges: 0, total: 22000, travelMode: "SELF_DRIVE" },
      paymentStatus: PaymentStatus.REFUNDED,
      travelMode: "SELF_DRIVE",
      numberOfAttendees: 100,
      cancelledAt: daysAgo(8),
      cancellationReason: "Family emergency — bride ki daadi ki tabiyat kharab ho gayi",
    },
    // ── IN_PROGRESS × 1 ────────────────────────────────────────────────────
    {
      bookingNumber: bookingNumber(),
      customerId: c5.customerId,
      panditId: p1.panditId,
      ritualId: r_satya.id,
      status: BookingStatus.IN_PROGRESS,
      eventDate: new Date(),
      eventTime: "17:00",
      venueAddress: { addressLine1: "E-234, Sector 14, Faridabad", city: "Faridabad", postalCode: "121007" },
      pricing: { base: 5500, travelCharges: 2000, total: 7500, travelMode: "TRAIN" },
      paymentStatus: PaymentStatus.PAID,
      travelMode: "TRAIN",
      numberOfAttendees: 35,
      panditAcceptedAt: daysAgo(5),
    },
  ];

  const bookingIds: string[] = [];
  for (const b of bookingSeeds) {
    const booking = await prisma.booking.create({ data: b });
    bookingIds.push(booking.id);
    console.log(`✅  Booking: ${booking.bookingNumber} (${booking.status})`);
  }

  // ── 6. Reviews (5 reviews on the 3 completed + 2 more) ──────────────────
  const reviewData = [
    {
      bookingId: bookingIds[0]!,
      customerId: c1.customerId,
      panditId: p1.panditId,
      overallRating: 5,
      ritualKnowledge: 5,
      punctuality: 5,
      communication: 5,
      comment: "Pt. Rajesh ji ne bahut hi shuddh aur sampoorn vidhi se shaadi karai. Samay par aaye, sab explain kiya. Bilkul sahi pandit the hamare liye. Next puja bhi inhi se karaenge!",
    },
    {
      bookingId: bookingIds[1]!,
      customerId: c2.customerId,
      panditId: p2.panditId,
      overallRating: 5,
      ritualKnowledge: 5,
      punctuality: 4,
      communication: 5,
      comment: "Satyanarayan Katha bahut achhi hui. Pandit ji ne sab kuch Hindi mein explain kiya — meri maa ko bhi samajh aaya. Thodi der se aaye par koi baat nahi, katha mast thi.",
    },
    {
      bookingId: bookingIds[2]!,
      customerId: c3.customerId,
      panditId: p3.panditId,
      overallRating: 5,
      ritualKnowledge: 5,
      punctuality: 5,
      communication: 4,
      comment: "Rudrabhishek ek alag hi anubhav tha. Pt. Ramesh ji ka Sanskrit uccharan ekdum sahi hai. Bilva patra arrange karne mein help ki. Highly recommended for Shiva puja.",
    },
    {
      bookingId: bookingIds[3]!,   // confirmed booking — review placed early (allowed by schema)
      customerId: c4.customerId,
      panditId: p4.panditId,
      overallRating: 4,
      ritualKnowledge: 4,
      punctuality: 4,
      communication: 4,
      comment: "Griha Pravesh ke liye Pt. Mahesh ji ne sab kuch theek se bataya. WhatsApp par samagri ki list bheji. Ab tak ka experience bahut acha raha, aage bhi dekhte hain.",
      isAnonymous: true,
    },
    {
      bookingId: bookingIds[5]!,   // confirmed mundan booking
      customerId: c1.customerId,
      panditId: p2.panditId,
      overallRating: 5,
      ritualKnowledge: 5,
      punctuality: 5,
      communication: 5,
      comment: "Mere bête ka pehla mundan — Pt. Vikas ji ne sab kuch bahut pyaar se explain kiya. Bachche ke nakshatra aur gotra ke hisaab se shubh samay nikala. Dil se shukriya!",
    },
  ];

  for (const rev of reviewData) {
    await prisma.review.create({
      data: {
        ...rev,
        isAnonymous: rev.isAnonymous ?? false,
      },
    });
    console.log(`✅  Review for booking ${rev.bookingId.slice(0, 8)}… — ${rev.overallRating}★`);
  }

  console.log("\n🎉  Seed complete!");
  console.log(`    Admin : +919999999999`);
  console.log(`    Pandits: 15  |  Customers: 5  |  Rituals: 8  |  Bookings: 10  |  Reviews: 5`);
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
