/**
 * HmarePanditJi -- Prisma Seed Script
 * Run: pnpm --filter @hmarepanditji/db seed
 */

import {
  PrismaClient, Role, GenderEnum, RitualCategory,
  BookingStatus, PaymentStatus, VerificationStatus,
  TravelStatus, FoodArrangement, AccommodationArrangement,
  SamagriPreference, PayoutStatus, RefundStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number): Date { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n: number): Date { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function bn(): string { return `HPJ-2026-${Math.floor(10000 + Math.random() * 90000)}`; }

async function main() {
  console.log("Seeding HmarePanditJi database...");

  // ── 1. Admin ──────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { phone: "+919999999999" },
    update: {},
    create: {
      phone: "+919999999999",
      email: "admin@hmarepanditji.com",
      name: "Admin User",
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
      profileCompleted: true,
    },
  });
  console.log("Admin:", admin.phone);

  // ── 2. Customers ──────────────────────────────────────────────────────────
  const customerSeed = [
    {
      phone: "+919810002001", name: "Rahul Sharma", email: "rahul.sharma@gmail.com",
      gender: GenderEnum.MALE, gotra: "Kashyap",
      addresses: [
        { label: "Home", fullAddress: "B-42, Sector 12, Dwarka, New Delhi", city: "Delhi", state: "Delhi", pincode: "110075", isDefault: true },
        { label: "Office", fullAddress: "418, Statesman House, Barakhamba Road, Connaught Place", city: "Delhi", state: "Delhi", pincode: "110001", isDefault: false },
      ],
    },
    {
      phone: "+919810002002", name: "Priya Gupta", email: "priya.gupta@gmail.com",
      gender: GenderEnum.FEMALE, gotra: "Bharadwaj",
      addresses: [
        { label: "Home", fullAddress: "Flat 302, Lotus Heights, Sector 18, Noida", city: "Noida", state: "Uttar Pradesh", pincode: "201301", isDefault: true },
      ],
    },
    {
      phone: "+919810002003", name: "Amit Singh", email: "amit.singh@gmail.com",
      gender: GenderEnum.MALE, gotra: "Vashishtha",
      addresses: [
        { label: "Home", fullAddress: "A-12, DLF Phase 2, Sector 25, Gurgaon", city: "Gurgaon", state: "Haryana", pincode: "122002", isDefault: true },
      ],
    },
    {
      phone: "+919810002004", name: "Sneha Verma", email: "sneha.verma@gmail.com",
      gender: GenderEnum.FEMALE, gotra: "Atri",
      addresses: [
        { label: "Home", fullAddress: "H-78, Sector 31, Faridabad", city: "Faridabad", state: "Haryana", pincode: "121007", isDefault: true },
      ],
    },
    {
      phone: "+919810002005", name: "Vikram Joshi", email: "vikram.joshi@gmail.com",
      gender: GenderEnum.MALE, gotra: "Gautam",
      addresses: [
        { label: "Home", fullAddress: "E-234, Vasundhara, Sector 14, Ghaziabad", city: "Ghaziabad", state: "Uttar Pradesh", pincode: "201012", isDefault: true },
      ],
    },
  ];

  const cMap: Record<string, { userId: string; customerId: string }> = {};
  for (const c of customerSeed) {
    const user = await prisma.user.upsert({
      where: { phone: c.phone },
      update: {},
      create: { phone: c.phone, name: c.name, email: c.email, role: Role.CUSTOMER, isVerified: true, isActive: true, profileCompleted: true },
    });
    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        preferredLanguages: ["Hindi", "English"],
        gender: c.gender,
        gotra: c.gotra,
        addresses: { create: c.addresses },
      },
    });
    cMap[c.phone] = { userId: user.id, customerId: customer.id };
    console.log("Customer:", c.name);
  }

  // ── 3. Pandits ────────────────────────────────────────────────────────────
  const panditSeed = [
    {
      phone: "+919810001001", name: "Pandit Ramesh Shastri",
      displayName: "Pt. Ramesh Shastri",
      bio: "Experienced Vedic priest with 20 years of expertise in wedding ceremonies and Griha Pravesh rituals. Trained at Kashi Vidyapeeth, Varanasi. Fluent in Sanskrit, Hindi and English. Has officiated over 500 weddings across Delhi-NCR.",
      experienceYears: 20, rating: 4.9, averageRating: 4.9, totalReviews: 87, completedBookings: 120,
      specializations: ["Vivah", "Griha Pravesh", "Havan"],
      languages: ["Hindi", "Sanskrit", "English"],
      city: "Delhi", state: "Delhi", location: "Delhi",
      fullAddress: "C-12, Rohini Sector 8, New Delhi",
      sect: "Shaiva", gotra: "Bharadwaj",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Ramesh Shastri", bankAccountNumber: "12345678901234", bankIfscCode: "SBIN0001234", bankVerified: true, bankAccountAdded: true,
      panNumber: "ABCPS1234F",
      maxTravelDistance: 50,
      travelPreferences: { maxDistanceKm: 50, preferredModes: ["CAB"], selfDriveRatePerKm: 0 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      basePricing: { Vivah: 25000, "Griha Pravesh": 7500, Havan: 3500 },
      pujaServices: [
        { pujaType: "Vivah", dakshinaAmount: 25000, durationHours: 4, description: "Complete Vedic wedding ceremony with all rituals" },
        { pujaType: "Griha Pravesh", dakshinaAmount: 7500, durationHours: 2.5, description: "Vastu-compliant home entry ceremony" },
        { pujaType: "Havan", dakshinaAmount: 3500, durationHours: 1.5, description: "Navgraha and general purpose havan" },
      ],
    },
    {
      phone: "+919810001002", name: "Acharya Devendra Tiwari",
      displayName: "Acharya Devendra Tiwari",
      bio: "Renowned astrologer and puja specialist from Varanasi with 18 years of experience. Expert in Kundali matching, Satyanarayan Katha, and Pitru Puja. Travels across North India for major ceremonies.",
      experienceYears: 18, rating: 4.8, averageRating: 4.8, totalReviews: 64, completedBookings: 95,
      specializations: ["Satyanarayan Katha", "Pitra Puja", "Rudrabhishek"],
      languages: ["Hindi", "Sanskrit", "Bhojpuri"],
      city: "Varanasi", state: "Uttar Pradesh", location: "Varanasi",
      fullAddress: "Assi Ghat, Varanasi, Uttar Pradesh",
      sect: "Vaishnava", gotra: "Kashyap",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Devendra Tiwari", bankAccountNumber: "98765432101234", bankIfscCode: "HDFC0002345", bankVerified: true, bankAccountAdded: true,
      panNumber: "CDTPA5678G",
      maxTravelDistance: 2000,
      travelPreferences: { maxDistanceKm: 2000, preferredModes: ["TRAIN", "FLIGHT", "SELF_DRIVE"], selfDriveRatePerKm: 12 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      basePricing: { "Satyanarayan Katha": 5100, "Pitra Puja": 7000, Rudrabhishek: 8100 },
      pujaServices: [
        { pujaType: "Satyanarayan Katha", dakshinaAmount: 5100, durationHours: 3, description: "Complete Satyanarayan Puja with Prasad distribution" },
        { pujaType: "Pitra Puja", dakshinaAmount: 7000, durationHours: 3, description: "Ancestral rites and Shradh ceremony" },
        { pujaType: "Rudrabhishek", dakshinaAmount: 8100, durationHours: 2.5, description: "Sacred Shiva abhishek with Vedic mantras" },
      ],
    },
    {
      phone: "+919810001003", name: "Pandit Suresh Mishra",
      displayName: "Pt. Suresh Mishra",
      bio: "Delhi-based Vedic priest specializing in Mundan, Annaprashan and childhood samskaras. 12 years of experience conducting family ceremonies with warmth and precision. Known for clear explanations of rituals.",
      experienceYears: 12, rating: 4.7, averageRating: 4.7, totalReviews: 43, completedBookings: 68,
      specializations: ["Mundan", "Annaprashan", "Naamkaran"],
      languages: ["Hindi", "English", "Sanskrit"],
      city: "Delhi", state: "Delhi", location: "Delhi",
      fullAddress: "D-45, Pitampura, New Delhi",
      sect: "Smartha", gotra: "Vashishtha",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Suresh Mishra", bankAccountNumber: "11223344556677", bankIfscCode: "ICIC0003456", bankVerified: true, bankAccountAdded: true,
      panNumber: "EFGSM9012H",
      maxTravelDistance: 50,
      travelPreferences: { maxDistanceKm: 50, preferredModes: ["CAB"], selfDriveRatePerKm: 0 },
      availableDays: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      basePricing: { Mundan: 4000, Annaprashan: 3500, Naamkaran: 3100 },
      pujaServices: [
        { pujaType: "Mundan", dakshinaAmount: 4000, durationHours: 1.5, description: "Chudakarma samskara with full rituals" },
        { pujaType: "Annaprashan", dakshinaAmount: 3500, durationHours: 1.5, description: "First rice-feeding ceremony" },
        { pujaType: "Naamkaran", dakshinaAmount: 3100, durationHours: 1, description: "Baby naming ceremony with Jatakarma" },
      ],
    },
    {
      phone: "+919810001004", name: "Acharya Vinod Pandey",
      displayName: "Acharya Vinod Pandey",
      bio: "Haridwar-based Vedic scholar with 25 years of experience in yagnas, havans and Vastu puja. Has conducted Maha Rudrabhishek and Laghu Rudra for major corporate and residential clients. Travels pan-India.",
      experienceYears: 25, rating: 5.0, averageRating: 5.0, totalReviews: 112, completedBookings: 180,
      specializations: ["Rudrabhishek", "Havan", "Vastu Shanti"],
      languages: ["Hindi", "Sanskrit", "English"],
      city: "Haridwar", state: "Uttarakhand", location: "Haridwar",
      fullAddress: "Har Ki Pauri Area, Haridwar, Uttarakhand",
      sect: "Shaiva", gotra: "Atri",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Vinod Pandey", bankAccountNumber: "44556677889900", bankIfscCode: "PUNB0004567", bankVerified: true, bankAccountAdded: true,
      panNumber: "GHIVP3456I",
      maxTravelDistance: 2000,
      travelPreferences: { maxDistanceKm: 2000, preferredModes: ["TRAIN", "FLIGHT", "SELF_DRIVE"], selfDriveRatePerKm: 12 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
      basePricing: { Rudrabhishek: 11000, Havan: 5100, "Vastu Shanti": 9000 },
      pujaServices: [
        { pujaType: "Rudrabhishek", dakshinaAmount: 11000, durationHours: 3, description: "Laghu Rudra Abhishek with 11 priests" },
        { pujaType: "Havan", dakshinaAmount: 5100, durationHours: 2, description: "Navgraha shanti havan with Poornahu" },
        { pujaType: "Vastu Shanti", dakshinaAmount: 9000, durationHours: 3, description: "Complete Vastu puja with Griha Pravesh" },
      ],
    },
    {
      phone: "+919810001005", name: "Pandit Gopal Krishna Das",
      displayName: "Pt. Gopal Krishna Das",
      bio: "Mathura-born Vaishnava priest expert in Ganesh Puja, Lakshmi Puja and festival ceremonies. 15 years of experience. Performs ceremonies with authentic Braj tradition. Available for all of NCR region.",
      experienceYears: 15, rating: 4.6, averageRating: 4.6, totalReviews: 51, completedBookings: 82,
      specializations: ["Ganesh Puja", "Lakshmi Puja", "Satyanarayan Katha"],
      languages: ["Hindi", "Sanskrit", "Bhojpuri"],
      city: "Mathura", state: "Uttar Pradesh", location: "Mathura",
      fullAddress: "Vishram Ghat, Mathura, Uttar Pradesh",
      sect: "Vaishnava", gotra: "Gautam",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Gopal Krishna Das", bankAccountNumber: "55667788990011", bankIfscCode: "BARB0005678", bankVerified: true, bankAccountAdded: true,
      panNumber: "IJKGK7890J",
      maxTravelDistance: 300,
      travelPreferences: { maxDistanceKm: 300, preferredModes: ["SELF_DRIVE", "TRAIN"], selfDriveRatePerKm: 12 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday", "Sunday"],
      basePricing: { "Ganesh Puja": 2500, "Lakshmi Puja": 3100, "Satyanarayan Katha": 4500 },
      pujaServices: [
        { pujaType: "Ganesh Puja", dakshinaAmount: 2500, durationHours: 1, description: "Shodashopachara Ganesh puja with modak offering" },
        { pujaType: "Lakshmi Puja", dakshinaAmount: 3100, durationHours: 1.5, description: "Mahalakshmi puja for prosperity and wealth" },
        { pujaType: "Satyanarayan Katha", dakshinaAmount: 4500, durationHours: 2.5, description: "Satyanarayan katha with vrat katha recitation" },
      ],
    },
    {
      phone: "+919810001006", name: "Pandit Shiv Narayan Upadhyay",
      displayName: "Pt. Shiv Narayan Upadhyay",
      bio: "Noida-based priest with 10 years of experience in all types of puja ceremonies. Trained under Pt. Chandrashekhar Shastri. Available for same-day bookings. Specializes in corporate and office puja.",
      experienceYears: 10, rating: 4.5, averageRating: 4.5, totalReviews: 38, completedBookings: 55,
      specializations: ["Ganesh Puja", "Griha Pravesh", "Havan"],
      languages: ["Hindi", "English", "Sanskrit"],
      city: "Noida", state: "Uttar Pradesh", location: "Noida",
      fullAddress: "Sector 62, Noida, Uttar Pradesh",
      sect: "Shaiva", gotra: "Jamadagni",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Shiv Narayan Upadhyay", bankAccountNumber: "66778899001122", bankIfscCode: "AXIS0006789", bankVerified: true, bankAccountAdded: true,
      panNumber: "KLMSU2345K",
      maxTravelDistance: 50,
      travelPreferences: { maxDistanceKm: 50, preferredModes: ["CAB"], selfDriveRatePerKm: 0 },
      availableDays: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday", "Sunday"],
      basePricing: { "Ganesh Puja": 2100, "Griha Pravesh": 6000, Havan: 3000 },
      pujaServices: [
        { pujaType: "Ganesh Puja", dakshinaAmount: 2100, durationHours: 1, description: "Standard Ganesh puja for new beginnings" },
        { pujaType: "Griha Pravesh", dakshinaAmount: 6000, durationHours: 2, description: "Home entry puja with Vastu rituals" },
        { pujaType: "Havan", dakshinaAmount: 3000, durationHours: 1.5, description: "Purification havan for home and office" },
      ],
    },
    {
      phone: "+919810001007", name: "Acharya Mohan Lal Trivedi",
      displayName: "Acharya Mohan Lal Trivedi",
      bio: "Gurgaon-based priest and Vastu consultant with 8 years of combined experience. Expert in wedding ceremonies and office inaugurations. Speaks fluent English and is comfortable with NRI families.",
      experienceYears: 8, rating: 4.4, averageRating: 4.4, totalReviews: 29, completedBookings: 40,
      specializations: ["Vivah", "Vastu Shanti", "Ganesh Puja"],
      languages: ["Hindi", "English", "Sanskrit"],
      city: "Gurgaon", state: "Haryana", location: "Gurgaon",
      fullAddress: "DLF Cyber City, Gurgaon, Haryana",
      sect: "Smartha", gotra: "Bharadwaj",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Mohan Lal Trivedi", bankAccountNumber: "77889900112233", bankIfscCode: "KOTAK0007890", bankVerified: true, bankAccountAdded: true,
      panNumber: "NOMLT6789L",
      maxTravelDistance: 50,
      travelPreferences: { maxDistanceKm: 50, preferredModes: ["CAB"], selfDriveRatePerKm: 0 },
      availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      basePricing: { Vivah: 21000, "Vastu Shanti": 8000, "Ganesh Puja": 2100 },
      pujaServices: [
        { pujaType: "Vivah", dakshinaAmount: 21000, durationHours: 3.5, description: "Traditional Hindu wedding with all 7 pheras" },
        { pujaType: "Vastu Shanti", dakshinaAmount: 8000, durationHours: 2.5, description: "Vastu dosh nivaran and property blessing" },
        { pujaType: "Ganesh Puja", dakshinaAmount: 2100, durationHours: 1, description: "Auspicious Ganesh puja for new ventures" },
      ],
    },
    {
      phone: "+919810001008", name: "Pandit Kailash Nath Dubey",
      displayName: "Pt. Kailash Nath Dubey",
      bio: "Faridabad-based priest from a lineage of 4 generations of Vedic scholars. 22 years of experience in all types of ceremonies. Specializes in Shradh, Pitru Puja and death rites. Also conducts Sunderkand Path.",
      experienceYears: 22, rating: 4.8, averageRating: 4.8, totalReviews: 73, completedBookings: 105,
      specializations: ["Shradh", "Pitra Puja", "Sunderkand Path"],
      languages: ["Hindi", "Sanskrit", "Maithili"],
      city: "Faridabad", state: "Haryana", location: "Faridabad",
      fullAddress: "Sector 16, Faridabad, Haryana",
      sect: "Shaiva", gotra: "Kashyap",
      verificationStatus: VerificationStatus.VERIFIED, isVerified: true,
      aadhaarVerified: true, videoKycCompleted: true, certificatesVerified: true,
      bankAccountName: "Kailash Nath Dubey", bankAccountNumber: "88990011223344", bankIfscCode: "UNION0008901", bankVerified: true, bankAccountAdded: true,
      panNumber: "OPQKD0123M",
      maxTravelDistance: 50,
      travelPreferences: { maxDistanceKm: 50, preferredModes: ["CAB"], selfDriveRatePerKm: 0 },
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      basePricing: { Shradh: 6000, "Pitra Puja": 7000, "Sunderkand Path": 5100 },
      pujaServices: [
        { pujaType: "Shradh", dakshinaAmount: 6000, durationHours: 3, description: "Annual Shradh ceremony for ancestors" },
        { pujaType: "Pitra Puja", dakshinaAmount: 7000, durationHours: 3.5, description: "Complete Pitru tarpan and puja" },
        { pujaType: "Sunderkand Path", dakshinaAmount: 5100, durationHours: 4, description: "Ramcharitmanas Sunderkand recitation" },
      ],
    },
    {
      phone: "+919810001009", name: "Pandit Rajiv Sharma",
      displayName: "Pt. Rajiv Sharma",
      bio: "New pandit with 5 years of experience, recently verified. Trained under senior pandits at the Arya Samaj, Delhi. Specializes in simple pujas and havans for urban families. Available on weekends.",
      experienceYears: 5, rating: 4.1, averageRating: 4.1, totalReviews: 12, completedBookings: 15,
      specializations: ["Havan", "Ganesh Puja"],
      languages: ["Hindi", "English"],
      city: "Delhi", state: "Delhi", location: "Delhi",
      fullAddress: "Laxmi Nagar, New Delhi",
      sect: "Arya Samaj", gotra: "Vashishtha",
      verificationStatus: VerificationStatus.DOCUMENTS_SUBMITTED, isVerified: false,
      aadhaarVerified: true, videoKycCompleted: false, certificatesVerified: false,
      bankAccountName: null, bankAccountNumber: null, bankIfscCode: null, bankVerified: false, bankAccountAdded: false,
      panNumber: null,
      maxTravelDistance: 30,
      travelPreferences: { maxDistanceKm: 30, preferredModes: ["CAB"], selfDriveRatePerKm: 0 },
      availableDays: ["Saturday", "Sunday"],
      basePricing: { Havan: 2500, "Ganesh Puja": 2100 },
      pujaServices: [
        { pujaType: "Havan", dakshinaAmount: 2500, durationHours: 1.5, description: "Simple havan for purification and blessings" },
        { pujaType: "Ganesh Puja", dakshinaAmount: 2100, durationHours: 1, description: "Basic Ganesh puja for auspicious occasions" },
      ],
    },
    {
      phone: "+919810001010", name: "Acharya Prashant Misra",
      displayName: "Acharya Prashant Misra",
      bio: "Freshly registered pandit completing KYC process. Graduate from Sampurnanand Sanskrit University. Eager to serve families with proper Vedic knowledge. Specializes in modern-traditional fusion ceremonies.",
      experienceYears: 3, rating: 3.8, averageRating: 3.8, totalReviews: 5, completedBookings: 6,
      specializations: ["Satyanarayan Katha", "Lakshmi Puja"],
      languages: ["Hindi", "Sanskrit", "English"],
      city: "Delhi", state: "Delhi", location: "Delhi",
      fullAddress: "Mayur Vihar Phase 1, New Delhi",
      sect: "Smartha", gotra: "Jamadagni",
      verificationStatus: VerificationStatus.PENDING, isVerified: false,
      aadhaarVerified: false, videoKycCompleted: false, certificatesVerified: false,
      bankAccountName: null, bankAccountNumber: null, bankIfscCode: null, bankVerified: false, bankAccountAdded: false,
      panNumber: null,
      maxTravelDistance: 25,
      travelPreferences: { maxDistanceKm: 25, preferredModes: ["CAB"], selfDriveRatePerKm: 0 },
      availableDays: ["Friday", "Saturday", "Sunday"],
      basePricing: { "Satyanarayan Katha": 3100, "Lakshmi Puja": 2500 },
      pujaServices: [
        { pujaType: "Satyanarayan Katha", dakshinaAmount: 3100, durationHours: 2, description: "Satyanarayan vrat katha with family" },
        { pujaType: "Lakshmi Puja", dakshinaAmount: 2500, durationHours: 1, description: "Lakshmi puja for home and business" },
      ],
    },
  ];

  const pMap: Record<string, { userId: string; panditId: string }> = {};
  for (const p of panditSeed) {
    const user = await prisma.user.upsert({
      where: { phone: p.phone },
      update: {},
      create: { phone: p.phone, name: p.name, role: Role.PANDIT, isVerified: p.isVerified, isActive: true, profileCompleted: true },
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
        city: p.city,
        state: p.state,
        location: p.location,
        fullAddress: p.fullAddress,
        sect: p.sect,
        gotra: p.gotra,
        verificationStatus: p.verificationStatus,
        isVerified: p.isVerified,
        isActive: true,
        aadhaarVerified: p.aadhaarVerified,
        videoKycCompleted: p.videoKycCompleted,
        certificatesVerified: p.certificatesVerified,
        rating: p.rating,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        completedBookings: p.completedBookings,
        totalBookings: p.completedBookings,
        basePricing: p.basePricing,
        availableDays: p.availableDays,
        travelPreferences: p.travelPreferences,
        maxTravelDistance: p.maxTravelDistance,
        bankAccountName: p.bankAccountName,
        bankAccountNumber: p.bankAccountNumber,
        bankIfscCode: p.bankIfscCode,
        bankVerified: p.bankVerified,
        bankAccountAdded: p.bankAccountAdded,
        bankDetails: p.bankVerified
          ? { bankName: "SBI", accountNumber: p.bankAccountNumber, ifscCode: p.bankIfscCode }
          : null,
        panNumber: p.panNumber,
        pujaServices: { create: p.pujaServices },
      },
    });
    pMap[p.phone] = { userId: user.id, panditId: pandit.id };
    console.log("Pandit:", p.displayName);
  }

  // ── 4. Pandit Blocked Dates ────────────────────────────────────────────────
  await prisma.panditBlockedDate.createMany({
    skipDuplicates: true,
    data: [
      { panditId: pMap["+919810001001"]!.panditId, date: daysFromNow(5), reason: "Family function" },
      { panditId: pMap["+919810001001"]!.panditId, date: daysFromNow(12), reason: "Personal travel" },
      { panditId: pMap["+919810001002"]!.panditId, date: daysFromNow(3), reason: "Religious observance" },
      { panditId: pMap["+919810001002"]!.panditId, date: daysFromNow(18), reason: "Health checkup" },
      { panditId: pMap["+919810001003"]!.panditId, date: daysFromNow(7), reason: "Prior booking" },
      { panditId: pMap["+919810001004"]!.panditId, date: daysFromNow(2), reason: "Attending Haridwar mela" },
      { panditId: pMap["+919810001004"]!.panditId, date: daysFromNow(9), reason: "Personal" },
      { panditId: pMap["+919810001005"]!.panditId, date: daysFromNow(4), reason: "Festival duties at temple" },
      { panditId: pMap["+919810001008"]!.panditId, date: daysFromNow(6), isRecurring: true, recurringRule: "FREQ=WEEKLY;BYDAY=TU", reason: "Weekly temple duty every Tuesday" },
    ],
  });
  console.log("Pandit blocked dates created");

  // ── 5. Rituals ────────────────────────────────────────────────────────────
  const ritualSeed = [
    { name: "Vivah", nameHindi: "विवाह", description: "Traditional Hindu wedding ceremony with all Vedic rituals including Saptapadi", descriptionHindi: "सम्पूर्ण वैदिक विधि से हिंदू विवाह संस्कार", category: RitualCategory.WEDDING, basePriceMin: 21000, basePriceMax: 51000, durationHours: 4, iconUrl: null },
    { name: "Griha Pravesh", nameHindi: "गृह प्रवेश", description: "Housewarming and home entry ceremony with Vastu Shanti and Navgraha Puja", descriptionHindi: "नए घर में प्रवेश के लिए वास्तु शांति और गृह प्रवेश पूजा", category: RitualCategory.GRIHA, basePriceMin: 5100, basePriceMax: 15000, durationHours: 2.5, iconUrl: null },
    { name: "Satyanarayan Katha", nameHindi: "सत्यनारायण कथा", description: "Vrat katha of Lord Vishnu for blessings of truth and prosperity", descriptionHindi: "भगवान सत्यनारायण की कथा एवं पूजन", category: RitualCategory.PUJA, basePriceMin: 3100, basePriceMax: 7000, durationHours: 3, iconUrl: null },
    { name: "Mundan", nameHindi: "मुंडन", description: "First haircut ceremony (Chudakarma) for toddlers aged 1-5 years", descriptionHindi: "बच्चे के प्रथम मुंडन संस्कार की पूजा", category: RitualCategory.PUJA, basePriceMin: 3100, basePriceMax: 5100, durationHours: 1.5, iconUrl: null },
    { name: "Havan", nameHindi: "हवन", description: "Vedic fire ceremony for purification, healing and blessings", descriptionHindi: "शुद्धि और मंगल कामना के लिए वैदिक हवन", category: RitualCategory.PUJA, basePriceMin: 2100, basePriceMax: 5100, durationHours: 1.5, iconUrl: null },
    { name: "Ganesh Puja", nameHindi: "गणेश पूजा", description: "Worship of Lord Ganesha for auspicious beginnings and removal of obstacles", descriptionHindi: "विघ्नहर्ता श्री गणेश जी की पूजा अर्चना", category: RitualCategory.PUJA, basePriceMin: 2100, basePriceMax: 4100, durationHours: 1, iconUrl: null },
    { name: "Lakshmi Puja", nameHindi: "लक्ष्मी पूजा", description: "Worship of Goddess Lakshmi for wealth, prosperity and good fortune", descriptionHindi: "माता लक्ष्मी की विशेष पूजा और अर्चना", category: RitualCategory.PUJA, basePriceMin: 2100, basePriceMax: 5100, durationHours: 1.5, iconUrl: null },
    { name: "Pitra Puja", nameHindi: "पितृ पूजा", description: "Ancestral worship and Shradh ceremony to honor departed souls", descriptionHindi: "पूर्वजों की आत्मा की शांति के लिए पितृ पूजा", category: RitualCategory.DEATH_RITES, basePriceMin: 5100, basePriceMax: 11000, durationHours: 3, iconUrl: null },
  ];

  for (const r of ritualSeed) {
    await prisma.ritual.upsert({
      where: { name: r.name },
      update: {},
      create: { ...r, isActive: true },
    });
  }
  console.log("Rituals created:", ritualSeed.length);

  // ── 6. Muhurat Dates ──────────────────────────────────────────────────────
  const muhuratData = [
    // Vivah Muhurat 2026 (avoiding Pitru Paksha Sep 17 - Oct 2, Chaturmas Jul-Oct)
    { date: new Date("2026-01-15T06:30:00+05:30"), pujaType: "Vivah", timeWindow: "6:30 AM - 8:15 AM", significance: "Makar Sankranti tithi, highly auspicious for weddings" },
    { date: new Date("2026-01-17T10:15:00+05:30"), pujaType: "Vivah", timeWindow: "10:15 AM - 12:30 PM", significance: "Shukla Paksha Tritiya with Rohini nakshatra" },
    { date: new Date("2026-01-22T07:00:00+05:30"), pujaType: "Vivah", timeWindow: "7:00 AM - 9:00 AM", significance: "Shukla Ashtami with Mrigashira nakshatra" },
    { date: new Date("2026-02-05T08:00:00+05:30"), pujaType: "Vivah", timeWindow: "8:00 AM - 10:00 AM", significance: "Basant Panchami period, auspicious for weddings" },
    { date: new Date("2026-02-12T11:00:00+05:30"), pujaType: "Vivah", timeWindow: "11:00 AM - 1:00 PM", significance: "Shukla Paksha Chaturdashi with Uttara Phalguni" },
    { date: new Date("2026-02-18T06:00:00+05:30"), pujaType: "Vivah", timeWindow: "6:00 AM - 7:45 AM", significance: "Falgun Shukla Panchami, Brahma muhurat" },
    { date: new Date("2026-02-25T09:30:00+05:30"), pujaType: "Vivah", timeWindow: "9:30 AM - 11:30 AM", significance: "Falgun Shukla Dvadashi with Hasta nakshatra" },
    { date: new Date("2026-03-04T07:30:00+05:30"), pujaType: "Vivah", timeWindow: "7:30 AM - 9:30 AM", significance: "Falgun Shukla Ekadashi period" },
    { date: new Date("2026-04-14T06:45:00+05:30"), pujaType: "Vivah", timeWindow: "6:45 AM - 8:30 AM", significance: "Vaishakh begins, very auspicious wedding period" },
    { date: new Date("2026-04-20T10:00:00+05:30"), pujaType: "Vivah", timeWindow: "10:00 AM - 12:00 PM", significance: "Vaishakh Shukla Trayodashi with Anuradha" },
    { date: new Date("2026-04-25T08:15:00+05:30"), pujaType: "Vivah", timeWindow: "8:15 AM - 10:15 AM", significance: "Vaishakh Purnima approaching, auspicious" },
    { date: new Date("2026-05-06T07:00:00+05:30"), pujaType: "Vivah", timeWindow: "7:00 AM - 9:00 AM", significance: "Jyeshtha Shukla Panchami, strong marriage muhurat" },
    { date: new Date("2026-05-13T09:00:00+05:30"), pujaType: "Vivah", timeWindow: "9:00 AM - 11:00 AM", significance: "Jyeshtha Shukla Dvadashi with Uttarashada" },
    { date: new Date("2026-05-20T06:30:00+05:30"), pujaType: "Vivah", timeWindow: "6:30 AM - 8:30 AM", significance: "Jyeshtha month good period for weddings" },
    { date: new Date("2026-11-12T07:00:00+05:30"), pujaType: "Vivah", timeWindow: "7:00 AM - 9:00 AM", significance: "Dev Uthani Ekadashi, Tulsi Vivah period begins" },
    { date: new Date("2026-11-18T08:30:00+05:30"), pujaType: "Vivah", timeWindow: "8:30 AM - 10:30 AM", significance: "Kartik Shukla Paksha, post-Devotthan period" },
    { date: new Date("2026-12-03T10:00:00+05:30"), pujaType: "Vivah", timeWindow: "10:00 AM - 12:00 PM", significance: "Margashirsha month, auspicious wedding season" },
    { date: new Date("2026-12-10T07:30:00+05:30"), pujaType: "Vivah", timeWindow: "7:30 AM - 9:30 AM", significance: "Margashirsha Shukla Dvadashi, strong muhurat" },

    // Griha Pravesh Muhurat 2026
    { date: new Date("2026-01-10T08:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "8:00 AM - 10:00 AM", significance: "Makar Rashi entry period, Vastu auspicious" },
    { date: new Date("2026-01-20T09:30:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "9:30 AM - 11:30 AM", significance: "Shukla Dvadashi with Pushya nakshatra" },
    { date: new Date("2026-02-03T07:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "7:00 AM - 9:00 AM", significance: "Maagh Shukla Panchami, Saraswati puja period" },
    { date: new Date("2026-02-10T10:30:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "10:30 AM - 12:30 PM", significance: "Maagh Shukla Ekadashi, Lord Vishnu's blessings" },
    { date: new Date("2026-02-20T08:30:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "8:30 AM - 10:30 AM", significance: "Falgun Shukla Saptami with Hasta nakshatra" },
    { date: new Date("2026-03-06T07:30:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "7:30 AM - 9:30 AM", significance: "Phalguna month, strong Vastu alignment" },
    { date: new Date("2026-03-15T09:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "9:00 AM - 11:00 AM", significance: "Chaitra approaching, spring auspiciousness" },
    { date: new Date("2026-04-02T08:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "8:00 AM - 10:00 AM", significance: "Chaitra Navratri just ended, clean period" },
    { date: new Date("2026-04-08T10:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "10:00 AM - 12:00 PM", significance: "Chaitra Shukla Purnima approaching" },
    { date: new Date("2026-04-16T07:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "7:00 AM - 9:00 AM", significance: "Vaishakh Shukla Pratipada, new beginnings" },
    { date: new Date("2026-05-04T08:30:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "8:30 AM - 10:30 AM", significance: "Vaishakh Shukla Trayodashi, strong muhurat" },
    { date: new Date("2026-05-22T09:30:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "9:30 AM - 11:30 AM", significance: "Jyeshtha Shukla Pratipada, fresh Shukla paksha" },
    { date: new Date("2026-10-08T08:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "8:00 AM - 10:00 AM", significance: "Post Navratri period, Vijaya Dashami nearby" },
    { date: new Date("2026-10-20T09:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "9:00 AM - 11:00 AM", significance: "Kartik month, Govardhan Puja period" },
    { date: new Date("2026-11-05T07:30:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "7:30 AM - 9:30 AM", significance: "Post Diwali, highly auspicious for new homes" },
    { date: new Date("2026-11-14T10:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "10:00 AM - 12:00 PM", significance: "Kartik Shukla Chaturdashi, Vastu aligned" },
    { date: new Date("2026-12-01T08:00:00+05:30"), pujaType: "Griha Pravesh", timeWindow: "8:00 AM - 10:00 AM", significance: "Margashirsha month, auspicious for new homes" },

    // Mundan Muhurat 2026
    { date: new Date("2026-01-13T09:00:00+05:30"), pujaType: "Mundan", timeWindow: "9:00 AM - 11:00 AM", significance: "Makar Sankranti period, auspicious for samskaras" },
    { date: new Date("2026-02-07T08:30:00+05:30"), pujaType: "Mundan", timeWindow: "8:30 AM - 10:00 AM", significance: "Basant Panchami, strongly auspicious for Mundan" },
    { date: new Date("2026-03-10T09:30:00+05:30"), pujaType: "Mundan", timeWindow: "9:30 AM - 11:00 AM", significance: "Phalguna Shukla Paksha, spring muhurat" },
    { date: new Date("2026-04-12T08:00:00+05:30"), pujaType: "Mundan", timeWindow: "8:00 AM - 9:30 AM", significance: "Navratri period, divine blessings" },
    { date: new Date("2026-05-08T09:00:00+05:30"), pujaType: "Mundan", timeWindow: "9:00 AM - 10:30 AM", significance: "Vaishakh Purnima period, auspicious" },
    { date: new Date("2026-05-16T10:00:00+05:30"), pujaType: "Mundan", timeWindow: "10:00 AM - 11:30 AM", significance: "Jyeshtha month begins, summer muhurat" },
    { date: new Date("2026-11-08T09:00:00+05:30"), pujaType: "Mundan", timeWindow: "9:00 AM - 10:30 AM", significance: "Kartik month, auspicious period for samskaras" },
    { date: new Date("2026-11-20T08:30:00+05:30"), pujaType: "Mundan", timeWindow: "8:30 AM - 10:00 AM", significance: "Kartik Shukla Purnima approaching" },
    { date: new Date("2026-12-08T09:00:00+05:30"), pujaType: "Mundan", timeWindow: "9:00 AM - 10:30 AM", significance: "Margashirsha Shukla Panchami, strong samskara muhurat" },

    // Satyanarayan Katha - Purnima dates
    { date: new Date("2026-01-13T10:00:00+05:30"), pujaType: "Satyanarayan Katha", timeWindow: "10:00 AM - 1:00 PM", significance: "Paush Purnima - most sacred for Satyanarayan" },
    { date: new Date("2026-02-12T10:00:00+05:30"), pujaType: "Satyanarayan Katha", timeWindow: "10:00 AM - 1:00 PM", significance: "Maagh Purnima - Satyanarayan Vrat" },
    { date: new Date("2026-03-14T10:00:00+05:30"), pujaType: "Satyanarayan Katha", timeWindow: "10:00 AM - 1:00 PM", significance: "Holi Purnima - very auspicious" },
    { date: new Date("2026-04-13T10:00:00+05:30"), pujaType: "Satyanarayan Katha", timeWindow: "10:00 AM - 1:00 PM", significance: "Chaitra Purnima - Ram Navami period" },
    { date: new Date("2026-05-12T10:00:00+05:30"), pujaType: "Satyanarayan Katha", timeWindow: "10:00 AM - 1:00 PM", significance: "Vaishakh Purnima - Buddha Purnima" },
    { date: new Date("2026-06-11T10:00:00+05:30"), pujaType: "Satyanarayan Katha", timeWindow: "10:00 AM - 1:00 PM", significance: "Jyeshtha Purnima - Vat Savitri period" },

    // Ganesh Puja - Chaturthi dates
    { date: new Date("2026-01-07T07:00:00+05:30"), pujaType: "Ganesh Puja", timeWindow: "7:00 AM - 8:30 AM", significance: "Maagh Krishna Chaturthi - Sankashti Chaturthi" },
    { date: new Date("2026-01-22T09:00:00+05:30"), pujaType: "Ganesh Puja", timeWindow: "9:00 AM - 10:30 AM", significance: "Maagh Shukla Chaturthi - Vinayaka Chaturthi" },
    { date: new Date("2026-02-06T07:00:00+05:30"), pujaType: "Ganesh Puja", timeWindow: "7:00 AM - 8:30 AM", significance: "Falgun Krishna Chaturthi - Sankashti" },
    { date: new Date("2026-02-21T09:00:00+05:30"), pujaType: "Ganesh Puja", timeWindow: "9:00 AM - 10:30 AM", significance: "Falgun Shukla Chaturthi - Vinayaka" },
    { date: new Date("2026-03-07T07:00:00+05:30"), pujaType: "Ganesh Puja", timeWindow: "7:00 AM - 8:30 AM", significance: "Chaitra Krishna Chaturthi - Sankashti" },
    { date: new Date("2026-03-22T09:00:00+05:30"), pujaType: "Ganesh Puja", timeWindow: "9:00 AM - 10:30 AM", significance: "Chaitra Shukla Chaturthi - Vinayaka" },

    // Havan - most auspicious days
    { date: new Date("2026-01-14T07:00:00+05:30"), pujaType: "Havan", timeWindow: "7:00 AM - 8:30 AM", significance: "Makar Sankranti - extremely auspicious for Havan" },
    { date: new Date("2026-02-05T07:30:00+05:30"), pujaType: "Havan", timeWindow: "7:30 AM - 9:00 AM", significance: "Basant Panchami - Saraswati blessings" },
    { date: new Date("2026-03-21T07:00:00+05:30"), pujaType: "Havan", timeWindow: "7:00 AM - 8:30 AM", significance: "Spring equinox, powerful for Navgraha Havan" },
    { date: new Date("2026-04-14T07:30:00+05:30"), pujaType: "Havan", timeWindow: "7:30 AM - 9:00 AM", significance: "Baisakhi, new year for fire ceremonies" },
    { date: new Date("2026-05-01T07:00:00+05:30"), pujaType: "Havan", timeWindow: "7:00 AM - 8:30 AM", significance: "Vaishakh month, auspicious for Agni puja" },
    { date: new Date("2026-11-01T07:00:00+05:30"), pujaType: "Havan", timeWindow: "7:00 AM - 8:30 AM", significance: "Post Diwali, Kartik month purification Havan" },
    { date: new Date("2026-12-21T07:30:00+05:30"), pujaType: "Havan", timeWindow: "7:30 AM - 9:00 AM", significance: "Winter solstice, powerful time for Agni Havan" },
  ];

  await prisma.muhuratDate.createMany({ skipDuplicates: true, data: muhuratData });
  console.log("Muhurat dates created:", muhuratData.length);

  // ── 7. City Distances ─────────────────────────────────────────────────────
  const distances = [
    { fromCity: "Delhi", toCity: "Noida", distanceKm: 25, estimatedDriveHours: 0.75 },
    { fromCity: "Noida", toCity: "Delhi", distanceKm: 25, estimatedDriveHours: 0.75 },
    { fromCity: "Delhi", toCity: "Gurgaon", distanceKm: 32, estimatedDriveHours: 1.0 },
    { fromCity: "Gurgaon", toCity: "Delhi", distanceKm: 32, estimatedDriveHours: 1.0 },
    { fromCity: "Delhi", toCity: "Faridabad", distanceKm: 28, estimatedDriveHours: 1.0 },
    { fromCity: "Faridabad", toCity: "Delhi", distanceKm: 28, estimatedDriveHours: 1.0 },
    { fromCity: "Delhi", toCity: "Ghaziabad", distanceKm: 20, estimatedDriveHours: 0.75 },
    { fromCity: "Ghaziabad", toCity: "Delhi", distanceKm: 20, estimatedDriveHours: 0.75 },
    { fromCity: "Delhi", toCity: "Greater Noida", distanceKm: 45, estimatedDriveHours: 1.25 },
    { fromCity: "Greater Noida", toCity: "Delhi", distanceKm: 45, estimatedDriveHours: 1.25 },
    { fromCity: "Delhi", toCity: "Mathura", distanceKm: 180, estimatedDriveHours: 3.5 },
    { fromCity: "Mathura", toCity: "Delhi", distanceKm: 180, estimatedDriveHours: 3.5 },
    { fromCity: "Delhi", toCity: "Agra", distanceKm: 230, estimatedDriveHours: 4.0 },
    { fromCity: "Agra", toCity: "Delhi", distanceKm: 230, estimatedDriveHours: 4.0 },
    { fromCity: "Delhi", toCity: "Jaipur", distanceKm: 280, estimatedDriveHours: 5.0 },
    { fromCity: "Jaipur", toCity: "Delhi", distanceKm: 280, estimatedDriveHours: 5.0 },
    { fromCity: "Delhi", toCity: "Haridwar", distanceKm: 230, estimatedDriveHours: 4.5 },
    { fromCity: "Haridwar", toCity: "Delhi", distanceKm: 230, estimatedDriveHours: 4.5 },
    { fromCity: "Delhi", toCity: "Varanasi", distanceKm: 820, estimatedDriveHours: 13.0 },
    { fromCity: "Varanasi", toCity: "Delhi", distanceKm: 820, estimatedDriveHours: 13.0 },
    { fromCity: "Delhi", toCity: "Lucknow", distanceKm: 555, estimatedDriveHours: 8.5 },
    { fromCity: "Lucknow", toCity: "Delhi", distanceKm: 555, estimatedDriveHours: 8.5 },
    { fromCity: "Delhi", toCity: "Chandigarh", distanceKm: 250, estimatedDriveHours: 4.5 },
    { fromCity: "Chandigarh", toCity: "Delhi", distanceKm: 250, estimatedDriveHours: 4.5 },
    { fromCity: "Delhi", toCity: "Dehradun", distanceKm: 255, estimatedDriveHours: 5.0 },
    { fromCity: "Dehradun", toCity: "Delhi", distanceKm: 255, estimatedDriveHours: 5.0 },
    { fromCity: "Delhi", toCity: "Rishikesh", distanceKm: 240, estimatedDriveHours: 4.75 },
    { fromCity: "Rishikesh", toCity: "Delhi", distanceKm: 240, estimatedDriveHours: 4.75 },
    { fromCity: "Noida", toCity: "Gurgaon", distanceKm: 45, estimatedDriveHours: 1.25 },
    { fromCity: "Gurgaon", toCity: "Noida", distanceKm: 45, estimatedDriveHours: 1.25 },
    { fromCity: "Noida", toCity: "Faridabad", distanceKm: 30, estimatedDriveHours: 1.0 },
    { fromCity: "Faridabad", toCity: "Noida", distanceKm: 30, estimatedDriveHours: 1.0 },
    { fromCity: "Noida", toCity: "Ghaziabad", distanceKm: 15, estimatedDriveHours: 0.5 },
    { fromCity: "Ghaziabad", toCity: "Noida", distanceKm: 15, estimatedDriveHours: 0.5 },
    { fromCity: "Noida", toCity: "Greater Noida", distanceKm: 20, estimatedDriveHours: 0.5 },
    { fromCity: "Greater Noida", toCity: "Noida", distanceKm: 20, estimatedDriveHours: 0.5 },
  ];

  await prisma.cityDistance.createMany({ skipDuplicates: true, data: distances });
  console.log("City distances created:", distances.length);

  // ── 8. Sample Bookings ────────────────────────────────────────────────────
  const ritualGrihaPravesh = await prisma.ritual.findUnique({ where: { name: "Griha Pravesh" } });
  const ritualVivah = await prisma.ritual.findUnique({ where: { name: "Vivah" } });
  const ritualSatyanarayan = await prisma.ritual.findUnique({ where: { name: "Satyanarayan Katha" } });
  const ritualMundan = await prisma.ritual.findUnique({ where: { name: "Mundan" } });
  const ritualHavan = await prisma.ritual.findUnique({ where: { name: "Havan" } });

  // Booking 1: COMPLETED Griha Pravesh (local pandit, no travel)
  const b1DakshiNa = 7500;
  const b1PlatformFee = Math.round(b1DakshiNa * 0.15);
  const b1PlatformFeeGst = Math.round(b1PlatformFee * 0.18);
  const b1GrandTotal = b1DakshiNa + b1PlatformFee + b1PlatformFeeGst;
  const b1PanditPayout = b1DakshiNa;

  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: "HPJ-2026-10001",
      customerId: cMap["+919810002001"]!.customerId,
      panditId: pMap["+919810001001"]!.panditId,
      ritualId: ritualGrihaPravesh?.id,
      status: BookingStatus.COMPLETED,
      eventType: "Griha Pravesh",
      eventDate: daysAgo(30),
      venueAddress: "B-42, Sector 12, Dwarka, New Delhi",
      venueCity: "Delhi",
      venuePincode: "110075",
      attendees: 20,
      muhuratTime: "9:30 AM - 11:30 AM",
      travelRequired: false,
      travelStatus: TravelStatus.NOT_REQUIRED,
      foodArrangement: FoodArrangement.CUSTOMER_PROVIDES,
      samagriPreference: SamagriPreference.PANDIT_BRINGS,
      dakshinaAmount: b1DakshiNa,
      platformFee: b1PlatformFee,
      platformFeeGst: b1PlatformFeeGst,
      grandTotal: b1GrandTotal,
      panditPayout: b1PanditPayout,
      payoutStatus: PayoutStatus.COMPLETED,
      paymentStatus: PaymentStatus.CAPTURED,
      razorpayOrderId: "order_mock_001",
      razorpayPaymentId: "pay_mock_001",
      panditAcceptedAt: daysAgo(35),
      completedAt: daysAgo(30),
      customerNotes: "Please bring all samagri. House is on 2nd floor.",
    },
  });

  await prisma.bookingStatusUpdate.createMany({
    data: [
      { bookingId: booking1.id, fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.CONFIRMED, updatedBy: admin.id, note: "Pandit confirmed", createdAt: daysAgo(35) },
      { bookingId: booking1.id, fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.PANDIT_EN_ROUTE, updatedBy: pMap["+919810001001"]!.userId, note: "Starting for venue", createdAt: daysAgo(30) },
      { bookingId: booking1.id, fromStatus: BookingStatus.PANDIT_EN_ROUTE, toStatus: BookingStatus.PANDIT_ARRIVED, updatedBy: pMap["+919810001001"]!.userId, note: "Arrived at venue", createdAt: daysAgo(30) },
      { bookingId: booking1.id, fromStatus: BookingStatus.PANDIT_ARRIVED, toStatus: BookingStatus.PUJA_IN_PROGRESS, updatedBy: pMap["+919810001001"]!.userId, note: "Puja started", createdAt: daysAgo(30) },
      { bookingId: booking1.id, fromStatus: BookingStatus.PUJA_IN_PROGRESS, toStatus: BookingStatus.COMPLETED, updatedBy: pMap["+919810001001"]!.userId, note: "Puja completed successfully", createdAt: daysAgo(30) },
    ],
  });

  // Booking 2: CONFIRMED Vivah with outstation pandit from Varanasi
  const b2Dakshina = 31000;
  const b2TravelCost = 4800; // Train Delhi-Varanasi AC 2-tier
  const b2FoodAllowance = 2000; // 2 days
  const b2PlatformFee = Math.round(b2Dakshina * 0.15);
  const b2TravelServiceFee = Math.round(b2TravelCost * 0.05);
  const b2PlatformFeeGst = Math.round(b2PlatformFee * 0.18);
  const b2TravelServiceFeeGst = Math.round(b2TravelServiceFee * 0.18);
  const b2GrandTotal = b2Dakshina + b2TravelCost + b2FoodAllowance + b2PlatformFee + b2TravelServiceFee + b2PlatformFeeGst + b2TravelServiceFeeGst;
  const b2PanditPayout = b2Dakshina + b2TravelCost + b2FoodAllowance;

  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: "HPJ-2026-10002",
      customerId: cMap["+919810002002"]!.customerId,
      panditId: pMap["+919810001002"]!.panditId,
      ritualId: ritualVivah?.id,
      status: BookingStatus.TRAVEL_BOOKED,
      eventType: "Vivah",
      eventDate: daysFromNow(15),
      venueAddress: "Flat 302, Lotus Heights, Sector 18, Noida",
      venueCity: "Noida",
      venuePincode: "201301",
      attendees: 200,
      muhuratTime: "11:00 AM - 1:00 PM",
      travelRequired: true,
      travelMode: "TRAIN",
      travelDistanceKm: 820,
      travelStatus: TravelStatus.BOOKED,
      travelBookingRef: "PNR-1234567890",
      travelNotes: "Train: Prayagraj Express, Coach B-4, Seat 23. Depart Varanasi 6:00 PM, Arrive Delhi 7:30 AM",
      foodArrangement: FoodArrangement.PLATFORM_ALLOWANCE,
      foodAllowanceDays: 2,
      accommodationArrangement: AccommodationArrangement.CUSTOMER_ARRANGES,
      accommodationNotes: "Customer will arrange accommodation near venue",
      samagriPreference: SamagriPreference.PANDIT_BRINGS,
      dakshinaAmount: b2Dakshina,
      travelCost: b2TravelCost,
      foodAllowanceAmount: b2FoodAllowance,
      platformFee: b2PlatformFee,
      travelServiceFee: b2TravelServiceFee,
      platformFeeGst: b2PlatformFeeGst,
      travelServiceFeeGst: b2TravelServiceFeeGst,
      grandTotal: b2GrandTotal,
      panditPayout: b2PanditPayout,
      payoutStatus: PayoutStatus.PENDING,
      paymentStatus: PaymentStatus.CAPTURED,
      razorpayOrderId: "order_mock_002",
      razorpayPaymentId: "pay_mock_002",
      panditAcceptedAt: daysAgo(5),
    },
  });

  await prisma.bookingStatusUpdate.createMany({
    data: [
      { bookingId: booking2.id, fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.PANDIT_REQUESTED, updatedBy: admin.id, note: "Pandit assigned", createdAt: daysAgo(7) },
      { bookingId: booking2.id, fromStatus: BookingStatus.PANDIT_REQUESTED, toStatus: BookingStatus.CONFIRMED, updatedBy: pMap["+919810001002"]!.userId, note: "Acharya Devendra accepted", createdAt: daysAgo(5) },
      { bookingId: booking2.id, fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.TRAVEL_BOOKED, updatedBy: admin.id, note: "Train ticket booked: Prayagraj Express PNR-1234567890", createdAt: daysAgo(3) },
    ],
  });

  // Booking 3: CREATED Satyanarayan Katha, pending pandit acceptance
  const b3Dakshina = 4500;
  const b3PlatformFee = Math.round(b3Dakshina * 0.15);
  const b3PlatformFeeGst = Math.round(b3PlatformFee * 0.18);
  const b3GrandTotal = b3Dakshina + b3PlatformFee + b3PlatformFeeGst;

  const booking3 = await prisma.booking.create({
    data: {
      bookingNumber: "HPJ-2026-10003",
      customerId: cMap["+919810002003"]!.customerId,
      ritualId: ritualSatyanarayan?.id,
      status: BookingStatus.CREATED,
      eventType: "Satyanarayan Katha",
      eventDate: daysFromNow(10),
      venueAddress: "A-12, DLF Phase 2, Sector 25, Gurgaon",
      venueCity: "Gurgaon",
      venuePincode: "122002",
      attendees: 30,
      muhuratTime: "10:00 AM - 1:00 PM",
      travelRequired: false,
      travelStatus: TravelStatus.NOT_REQUIRED,
      foodArrangement: FoodArrangement.CUSTOMER_PROVIDES,
      samagriPreference: SamagriPreference.CUSTOMER_ARRANGES,
      dakshinaAmount: b3Dakshina,
      platformFee: b3PlatformFee,
      platformFeeGst: b3PlatformFeeGst,
      grandTotal: b3GrandTotal,
      payoutStatus: PayoutStatus.PENDING,
      paymentStatus: PaymentStatus.AUTHORIZED,
      razorpayOrderId: "order_mock_003",
      customerNotes: "This is for Satyanarayan puja on the occasion of housewarming.",
    },
  });
  console.log("Booking 3 created:", booking3.bookingNumber);

  // Booking 4: CANCELLED Mundan (customer cancelled 5 days before, 50% refund)
  const b4Dakshina = 4000;
  const b4PlatformFee = Math.round(b4Dakshina * 0.15);
  const b4PlatformFeeGst = Math.round(b4PlatformFee * 0.18);
  const b4GrandTotal = b4Dakshina + b4PlatformFee + b4PlatformFeeGst;
  const b4RefundAmount = Math.round(b4GrandTotal * 0.5);

  const booking4 = await prisma.booking.create({
    data: {
      bookingNumber: "HPJ-2026-10004",
      customerId: cMap["+919810002004"]!.customerId,
      panditId: pMap["+919810001003"]!.panditId,
      ritualId: ritualMundan?.id,
      status: BookingStatus.CANCELLED,
      eventType: "Mundan",
      eventDate: daysAgo(2),
      venueAddress: "H-78, Sector 31, Faridabad",
      venueCity: "Faridabad",
      venuePincode: "121007",
      attendees: 15,
      travelRequired: false,
      travelStatus: TravelStatus.NOT_REQUIRED,
      foodArrangement: FoodArrangement.CUSTOMER_PROVIDES,
      samagriPreference: SamagriPreference.PANDIT_BRINGS,
      dakshinaAmount: b4Dakshina,
      platformFee: b4PlatformFee,
      platformFeeGst: b4PlatformFeeGst,
      grandTotal: b4GrandTotal,
      payoutStatus: PayoutStatus.FAILED,
      paymentStatus: PaymentStatus.REFUNDED,
      razorpayOrderId: "order_mock_004",
      razorpayPaymentId: "pay_mock_004",
      cancelledBy: cMap["+919810002004"]!.userId,
      cancellationReason: "Child is unwell, ceremony postponed to next month",
      cancellationRequestedAt: daysAgo(7),
      refundAmount: b4RefundAmount,
      refundStatus: RefundStatus.COMPLETED,
      refundReference: "rfnd_mock_004",
      cancelledAt: daysAgo(7),
      panditAcceptedAt: daysAgo(14),
    },
  });

  await prisma.bookingStatusUpdate.createMany({
    data: [
      { bookingId: booking4.id, fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.CONFIRMED, updatedBy: admin.id, note: "Pandit confirmed", createdAt: daysAgo(14) },
      { bookingId: booking4.id, fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.CANCELLATION_REQUESTED, updatedBy: cMap["+919810002004"]!.userId, note: "Customer: child unwell, postponing", createdAt: daysAgo(7) },
      { bookingId: booking4.id, fromStatus: BookingStatus.CANCELLATION_REQUESTED, toStatus: BookingStatus.CANCELLED, updatedBy: admin.id, note: "Cancellation approved, 50% refund processed", createdAt: daysAgo(7) },
    ],
  });

  // Booking 5: PUJA_IN_PROGRESS Havan (currently happening)
  const b5Dakshina = 3500;
  const b5PlatformFee = Math.round(b5Dakshina * 0.15);
  const b5PlatformFeeGst = Math.round(b5PlatformFee * 0.18);
  const b5GrandTotal = b5Dakshina + b5PlatformFee + b5PlatformFeeGst;

  const booking5 = await prisma.booking.create({
    data: {
      bookingNumber: "HPJ-2026-10005",
      customerId: cMap["+919810002005"]!.customerId,
      panditId: pMap["+919810001001"]!.panditId,
      ritualId: ritualHavan?.id,
      status: BookingStatus.PUJA_IN_PROGRESS,
      eventType: "Havan",
      eventDate: new Date(),
      venueAddress: "E-234, Vasundhara, Sector 14, Ghaziabad",
      venueCity: "Ghaziabad",
      venuePincode: "201012",
      attendees: 10,
      muhuratTime: "7:00 AM - 9:00 AM",
      travelRequired: false,
      travelStatus: TravelStatus.NOT_REQUIRED,
      foodArrangement: FoodArrangement.CUSTOMER_PROVIDES,
      samagriPreference: SamagriPreference.PANDIT_BRINGS,
      dakshinaAmount: b5Dakshina,
      platformFee: b5PlatformFee,
      platformFeeGst: b5PlatformFeeGst,
      grandTotal: b5GrandTotal,
      payoutStatus: PayoutStatus.PENDING,
      paymentStatus: PaymentStatus.CAPTURED,
      razorpayOrderId: "order_mock_005",
      razorpayPaymentId: "pay_mock_005",
      panditAcceptedAt: daysAgo(2),
    },
  });

  await prisma.bookingStatusUpdate.createMany({
    data: [
      { bookingId: booking5.id, fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.CONFIRMED, updatedBy: admin.id, note: "Booking confirmed", createdAt: daysAgo(3) },
      { bookingId: booking5.id, fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.PANDIT_EN_ROUTE, updatedBy: pMap["+919810001001"]!.userId, note: "Pandit departing for venue", createdAt: new Date() },
      { bookingId: booking5.id, fromStatus: BookingStatus.PANDIT_EN_ROUTE, toStatus: BookingStatus.PANDIT_ARRIVED, updatedBy: pMap["+919810001001"]!.userId, note: "Pandit arrived at venue", createdAt: new Date() },
      { bookingId: booking5.id, fromStatus: BookingStatus.PANDIT_ARRIVED, toStatus: BookingStatus.PUJA_IN_PROGRESS, updatedBy: pMap["+919810001001"]!.userId, note: "Havan started, agni prajwalit", createdAt: new Date() },
    ],
  });

  // Booking 6: COMPLETED — Satyanarayan Katha (45 days ago, local pandit from Mathura visited NCR)
  const b6Dakshina = 4500;
  const b6TravelCost = 2160; // Self-drive 180km * 12/km
  const b6PlatformFee = Math.round(b6Dakshina * 0.15);
  const b6TravelServiceFee = Math.round(b6TravelCost * 0.05);
  const b6PlatformFeeGst = Math.round(b6PlatformFee * 0.18);
  const b6TravelServiceFeeGst = Math.round(b6TravelServiceFee * 0.18);
  const b6GrandTotal = b6Dakshina + b6TravelCost + b6PlatformFee + b6TravelServiceFee + b6PlatformFeeGst + b6TravelServiceFeeGst;

  const booking6 = await prisma.booking.create({
    data: {
      bookingNumber: "HPJ-2026-10006",
      customerId: cMap["+919810002002"]!.customerId,
      panditId: pMap["+919810001005"]!.panditId,
      ritualId: ritualSatyanarayan?.id,
      status: BookingStatus.COMPLETED,
      eventType: "Satyanarayan Katha",
      eventDate: daysAgo(45),
      venueAddress: "Flat 302, Lotus Heights, Sector 18, Noida",
      venueCity: "Noida",
      venuePincode: "201301",
      attendees: 25,
      muhuratTime: "10:00 AM - 1:00 PM",
      travelRequired: true,
      travelMode: "SELF_DRIVE",
      travelDistanceKm: 180,
      travelStatus: TravelStatus.ARRIVED,
      foodArrangement: FoodArrangement.CUSTOMER_PROVIDES,
      samagriPreference: SamagriPreference.PANDIT_BRINGS,
      dakshinaAmount: b6Dakshina,
      travelCost: b6TravelCost,
      platformFee: b6PlatformFee,
      travelServiceFee: b6TravelServiceFee,
      platformFeeGst: b6PlatformFeeGst,
      travelServiceFeeGst: b6TravelServiceFeeGst,
      grandTotal: b6GrandTotal,
      panditPayout: b6Dakshina + b6TravelCost,
      payoutStatus: PayoutStatus.COMPLETED,
      paymentStatus: PaymentStatus.CAPTURED,
      razorpayOrderId: "order_mock_006",
      razorpayPaymentId: "pay_mock_006",
      panditAcceptedAt: daysAgo(50),
      completedAt: daysAgo(45),
    },
  });

  await prisma.bookingStatusUpdate.createMany({
    data: [
      { bookingId: booking6.id, fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.CONFIRMED, updatedBy: admin.id, note: "Pandit confirmed", createdAt: daysAgo(50) },
      { bookingId: booking6.id, fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.PANDIT_EN_ROUTE, updatedBy: pMap["+919810001005"]!.userId, note: "Driving from Mathura", createdAt: daysAgo(45) },
      { bookingId: booking6.id, fromStatus: BookingStatus.PANDIT_EN_ROUTE, toStatus: BookingStatus.PANDIT_ARRIVED, updatedBy: pMap["+919810001005"]!.userId, note: "Arrived at Noida venue", createdAt: daysAgo(45) },
      { bookingId: booking6.id, fromStatus: BookingStatus.PANDIT_ARRIVED, toStatus: BookingStatus.PUJA_IN_PROGRESS, updatedBy: pMap["+919810001005"]!.userId, note: "Katha started", createdAt: daysAgo(45) },
      { bookingId: booking6.id, fromStatus: BookingStatus.PUJA_IN_PROGRESS, toStatus: BookingStatus.COMPLETED, updatedBy: pMap["+919810001005"]!.userId, note: "Katha completed, prasad distributed", createdAt: daysAgo(45) },
    ],
  });

  // Booking 7: COMPLETED — Ganesh Puja (20 days ago, local Noida pandit)
  const b7Dakshina = 2100;
  const b7PlatformFee = Math.round(b7Dakshina * 0.15);
  const b7PlatformFeeGst = Math.round(b7PlatformFee * 0.18);
  const b7GrandTotal = b7Dakshina + b7PlatformFee + b7PlatformFeeGst;

  const booking7 = await prisma.booking.create({
    data: {
      bookingNumber: "HPJ-2026-10007",
      customerId: cMap["+919810002003"]!.customerId,
      panditId: pMap["+919810001006"]!.panditId,
      ritualId: await prisma.ritual.findUnique({ where: { name: "Ganesh Puja" } }).then(r => r?.id),
      status: BookingStatus.COMPLETED,
      eventType: "Ganesh Puja",
      eventDate: daysAgo(20),
      venueAddress: "A-12, DLF Phase 2, Sector 25, Gurgaon",
      venueCity: "Gurgaon",
      venuePincode: "122002",
      attendees: 12,
      muhuratTime: "9:00 AM - 10:30 AM",
      travelRequired: false,
      travelStatus: TravelStatus.NOT_REQUIRED,
      foodArrangement: FoodArrangement.CUSTOMER_PROVIDES,
      samagriPreference: SamagriPreference.NEED_HELP,
      samagriNotes: "Pandit ji suggested samagri list, we arranged",
      dakshinaAmount: b7Dakshina,
      platformFee: b7PlatformFee,
      platformFeeGst: b7PlatformFeeGst,
      grandTotal: b7GrandTotal,
      panditPayout: b7Dakshina,
      payoutStatus: PayoutStatus.COMPLETED,
      paymentStatus: PaymentStatus.CAPTURED,
      razorpayOrderId: "order_mock_007",
      razorpayPaymentId: "pay_mock_007",
      panditAcceptedAt: daysAgo(25),
      completedAt: daysAgo(20),
    },
  });

  await prisma.bookingStatusUpdate.createMany({
    data: [
      { bookingId: booking7.id, fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.CONFIRMED, updatedBy: admin.id, note: "Pandit confirmed", createdAt: daysAgo(25) },
      { bookingId: booking7.id, fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.PANDIT_EN_ROUTE, updatedBy: pMap["+919810001006"]!.userId, note: "On the way", createdAt: daysAgo(20) },
      { bookingId: booking7.id, fromStatus: BookingStatus.PANDIT_EN_ROUTE, toStatus: BookingStatus.PANDIT_ARRIVED, updatedBy: pMap["+919810001006"]!.userId, note: "Reached", createdAt: daysAgo(20) },
      { bookingId: booking7.id, fromStatus: BookingStatus.PANDIT_ARRIVED, toStatus: BookingStatus.PUJA_IN_PROGRESS, updatedBy: pMap["+919810001006"]!.userId, note: "Ganesh puja started", createdAt: daysAgo(20) },
      { bookingId: booking7.id, fromStatus: BookingStatus.PUJA_IN_PROGRESS, toStatus: BookingStatus.COMPLETED, updatedBy: pMap["+919810001006"]!.userId, note: "Puja completed", createdAt: daysAgo(20) },
    ],
  });

  console.log("Bookings created: 7");

  // ── 9. Reviews ────────────────────────────────────────────────────────────
  // Review 1: Booking 1 — Griha Pravesh by Rahul Sharma for Pt. Ramesh Shastri
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      reviewerId: cMap["+919810002001"]!.userId,
      revieweeId: pMap["+919810001001"]!.userId,
      panditId: pMap["+919810001001"]!.panditId,
      overallRating: 5.0,
      knowledgeRating: 5.0,
      punctualityRating: 4.5,
      communicationRating: 5.0,
      comment: "Pt. Ramesh ji bahut acche hain. Puja bilkul sahi tarike se ki. Samagri sab leke aaye the. Ghar mein bahut shubh mahaul ban gaya. 5 star!",
      isAnonymous: false,
    },
  });

  // Review 2: Booking 6 — Satyanarayan Katha by Priya Gupta for Pt. Gopal Krishna Das
  await prisma.review.create({
    data: {
      bookingId: booking6.id,
      reviewerId: cMap["+919810002002"]!.userId,
      revieweeId: pMap["+919810001005"]!.userId,
      panditId: pMap["+919810001005"]!.panditId,
      overallRating: 4.5,
      knowledgeRating: 5.0,
      punctualityRating: 4.0,
      communicationRating: 4.5,
      comment: "Gopal ji ne bahut achhi katha sunaayi. Mathura se drive karke aaye, thoda late ho gaye but puja mein koi kami nahi thi. Prasad bhi bahut achha tha. Family was very happy with the ceremony. Would recommend for Satyanarayan puja.",
      isAnonymous: false,
    },
  });

  // Review 3: Booking 7 — Ganesh Puja by Amit Singh for Pt. Shiv Narayan Upadhyay
  await prisma.review.create({
    data: {
      bookingId: booking7.id,
      reviewerId: cMap["+919810002003"]!.userId,
      revieweeId: pMap["+919810001006"]!.userId,
      panditId: pMap["+919810001006"]!.panditId,
      overallRating: 4.0,
      knowledgeRating: 4.5,
      punctualityRating: 3.5,
      communicationRating: 4.0,
      comment: "Decent experience overall. Pandit ji ka knowledge achha hai but time pe aana thoda improve kar sakte hain. Ganesh puja properly ki gayi thi. Samagri list pehle se share karna helpful tha. Good for small pujas.",
      isAnonymous: false,
    },
  });

  // Update pandit review stats
  await prisma.pandit.update({
    where: { id: pMap["+919810001001"]!.panditId },
    data: { totalReviews: { increment: 1 } },
  });
  await prisma.pandit.update({
    where: { id: pMap["+919810001005"]!.panditId },
    data: { totalReviews: { increment: 1 } },
  });
  await prisma.pandit.update({
    where: { id: pMap["+919810001006"]!.panditId },
    data: { totalReviews: { increment: 1 } },
  });

  console.log("Reviews created: 3");

  // ── 10. Favorites ─────────────────────────────────────────────────────────
  await prisma.favoritePandit.createMany({
    skipDuplicates: true,
    data: [
      { customerId: cMap["+919810002001"]!.userId, panditId: pMap["+919810001001"]!.userId },
      { customerId: cMap["+919810002001"]!.userId, panditId: pMap["+919810001003"]!.userId },
    ],
  });
  console.log("Favorites created: 2");

  console.log("\nSeeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
