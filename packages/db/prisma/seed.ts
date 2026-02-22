import { PrismaClient, Role, VerificationStatus, BookingStatus, TravelStatus, TravelMode, PaymentStatus, PayoutStatus, RefundStatus, SamagriPreference, FoodArrangement, AccommodationArrangement, PackageType } from '@prisma/client';

const prisma = new PrismaClient();

const CITY_DISTANCES = [
  ['Delhi', 'Noida', 25, 0.75],
  ['Delhi', 'Gurgaon', 30, 1],
  ['Delhi', 'Faridabad', 35, 1],
  ['Delhi', 'Ghaziabad', 28, 0.75],
  ['Delhi', 'Greater Noida', 45, 1.25],
  ['Delhi', 'Mathura', 160, 3],
  ['Delhi', 'Agra', 210, 3.5],
  ['Delhi', 'Jaipur', 280, 4.5],
  ['Delhi', 'Haridwar', 240, 4],
  ['Delhi', 'Varanasi', 820, 14],
  ['Delhi', 'Lucknow', 550, 8],
  ['Delhi', 'Chandigarh', 250, 4],
  ['Delhi', 'Dehradun', 300, 5],
  ['Delhi', 'Rishikesh', 260, 5],
  ['Delhi', 'Mumbai', 1420, 24],
  ['Delhi', 'Pune', 1480, 25],
  ['Delhi', 'Bangalore', 2150, 36],
  ['Delhi', 'Hyderabad', 1580, 26],
  ['Delhi', 'Chennai', 2170, 36],
  ['Delhi', 'Kolkata', 1500, 24],
  ['Delhi', 'Bhopal', 770, 12],
  ['Delhi', 'Ujjain', 900, 14],
  ['Varanasi', 'Lucknow', 280, 4.5],
  ['Varanasi', 'Agra', 570, 9],
  ['Varanasi', 'Mumbai', 1600, 26],
  ['Mathura', 'Agra', 60, 1.5],
  ['Haridwar', 'Rishikesh', 25, 0.75],
  ['Haridwar', 'Dehradun', 55, 1.5]
];

const VIVAH_MUHURATS = [
  ["2026-01-15T00:00:00Z", "10:30 AM - 12:45 PM", "Makar Sankranti — highly auspicious"],
  ["2026-01-19T00:00:00Z", "07:00 AM - 09:30 AM", "Shukla Paksha Panchami"],
  ["2026-01-21T00:00:00Z", "10:00 AM - 12:00 PM", "Auspicious Saptami"],
  ["2026-01-28T00:00:00Z", "11:30 AM - 01:30 PM", "Maghi Purnima — sacred"],
  ["2026-02-04T00:00:00Z", "09:00 AM - 11:00 AM", "Basant Panchami — Goddess Saraswati's day"],
  ["2026-02-09T00:00:00Z", "10:30 AM - 12:30 PM", "Shukla Dasami"],
  ["2026-02-12T00:00:00Z", "08:00 AM - 10:00 AM", "Dvadashi — auspicious"],
  ["2026-04-14T00:00:00Z", "07:30 AM - 09:30 AM", "Baisakhi — new beginnings"],
  ["2026-04-21T00:00:00Z", "10:00 AM - 12:00 PM", "Akshaya Tritiya — most auspicious for weddings"],
  ["2026-05-07T00:00:00Z", "09:00 AM - 11:30 AM", "Shukla Saptami"],
  ["2026-05-20T00:00:00Z", "11:00 AM - 01:00 PM", "Vaisakh Purnima"],
  ["2026-06-03T00:00:00Z", "08:30 AM - 10:30 AM", "Auspicious Tritiya"]
];

const GRIHA_PRAVESH_MUHURATS = [
  ["2026-01-07T00:00:00Z", "11:00 AM - 01:00 PM", "Saptami — good for new homes"],
  ["2026-01-14T00:00:00Z", "09:00 AM - 11:00 AM", "Makar Sankranti — entry into auspicious period"],
  ["2026-02-04T00:00:00Z", "10:30 AM - 12:30 PM", "Basant Panchami — Saraswati blesses new home"],
  ["2026-03-06T00:00:00Z", "09:30 AM - 11:30 AM", "Phalgun Shukla Saptami"],
  ["2026-03-14T00:00:00Z", "08:00 AM - 10:00 AM", "Holi preceding week"],
  ["2026-04-14T00:00:00Z", "10:00 AM - 12:00 PM", "Baisakhi — excellent for housewarming"],
  ["2026-04-21T00:00:00Z", "11:30 AM - 01:30 PM", "Akshaya Tritiya — never diminishes"],
  ["2026-05-10T00:00:00Z", "09:00 AM - 11:00 AM", "Auspicious Dashami"]
];

const SATYANARAYAN_MUHURATS = [
  ["2026-01-03T00:00:00Z", "06:00 PM - 08:00 PM", "Purnima Sandhya"],
  ["2026-01-17T00:00:00Z", "10:00 AM - 12:00 PM", "Ekadashi"],
  ["2026-02-02T00:00:00Z", "06:00 PM - 08:00 PM", "Purnima — monthly Satyanarayan"],
  ["2026-02-16T00:00:00Z", "05:00 PM - 07:00 PM", "Pradosh"],
  ["2026-03-03T00:00:00Z", "06:30 PM - 08:30 PM", "Falgun Purnima"],
  ["2026-04-02T00:00:00Z", "06:00 PM - 08:00 PM", "Chaitra Purnima"],
  ["2026-05-01T00:00:00Z", "06:00 PM - 08:00 PM", "Vaisakh Purnima"],
  ["2026-05-31T00:00:00Z", "06:00 PM - 08:00 PM", "Jyeshtha Purnima"]
];

const MUNDAN_MUHURATS = [
  ["2026-01-19T00:00:00Z", "10:00 AM - 12:00 PM", "Panchami — auspicious for Mundan"],
  ["2026-02-04T00:00:00Z", "09:00 AM - 11:00 AM", "Basant Panchami — Saraswati's grace for children"],
  ["2026-04-21T00:00:00Z", "10:30 AM - 12:30 PM", "Akshaya Tritiya"],
  ["2026-05-15T00:00:00Z", "09:00 AM - 11:00 AM", "Shukla Panchami"]
];

const ADMIN = { phone: '+919999999999', name: 'Admin User' };

const CUSTOMERS = [
  { phone: '+919811111111', name: 'Rahul Sharma', languages: ['Hindi', 'English'], gotra: 'Bhardwaj', address: { label: 'Home', fullAddress: 'House 45, Sector 12, Dwarka, New Delhi', city: 'Delhi', state: 'Delhi', pincode: '110075' } },
  { phone: '+919822222222', name: 'Priya Gupta', languages: ['Hindi'], gotra: 'Kashyap', address: { label: 'Home', fullAddress: 'Flat 302, Supertech Emerald, Noida Sector 93', city: 'Noida', state: 'Uttar Pradesh', pincode: '201304' } },
  { phone: '+919833333333', name: 'Arun Verma', languages: ['Hindi', 'English'], gotra: null, address: { label: 'Home', fullAddress: 'Villa 7, DLF Phase 3, Gurgaon', city: 'Gurgaon', state: 'Haryana', pincode: '122002' } },
  { phone: '+919844444444', name: 'Sunita Joshi', languages: ['Hindi', 'Maithili'], gotra: 'Shandilya', address: { label: 'Home', fullAddress: 'Plot 123, Vasundhara Enclave, Delhi', city: 'Delhi', state: 'Delhi', pincode: '110096' } },
  { phone: '+919855555555', name: 'Kiran Singh', languages: ['Hindi', 'Punjabi'], gotra: null, address: { label: 'Home', fullAddress: 'H.No 78, Model Town, Delhi', city: 'Delhi', state: 'Delhi', pincode: '110009' } }
];

const vivahBasicItems = [{ itemName: "Ghee 500g" }, { itemName: "Mauli 2pcs" }, { itemName: "Akshat 500g" }, { itemName: "Flowers (mixed) 1kg" }, { itemName: "Camphor 50g" }, { itemName: "Incense sticks 2packs" }, { itemName: "Janeu 2pcs" }, { itemName: "Panchpallav (5 leaves)" }];
const vivahStandardItems = [...vivahBasicItems, { itemName: "Havan Samagri 500g" }, { itemName: "Red cloth 2m" }, { itemName: "Coconut 5pcs" }, { itemName: "Supari 100g" }, { itemName: "Meetha Pan 10pcs" }];
const vivahPremiumItems = [...vivahStandardItems, { itemName: "Mango wood (lathi) 5kg" }, { itemName: "Kalash 1pc" }, { itemName: "Flowers premium 2kg" }, { itemName: "Sindoor 50g" }, { itemName: "Alta 2bottles" }, { itemName: "Chandan 100g" }];

const blockNext3Tuesdays = () => {
  const dates = [];
  let d = new Date();
  for (let i = 0; i < 3; i++) {
    d.setDate(d.getDate() + ((2 + 7 - d.getDay()) % 7 || 7));
    dates.push(new Date(d.setHours(0, 0, 0, 0)));
  }
  return dates;
};

const blockJan20To25 = () => {
  const dates = [];
  for (let d = 20; d <= 25; d++) {
    dates.push(new Date(`2026-01-${d}T00:00:00Z`));
  }
  return dates;
};

const PANDITS = [
  {
    phone: '+919700100001', name: 'Pt. Rajesh Tiwari', verificationStatus: VerificationStatus.VERIFIED, aadhaarVerified: true, videoKycCompleted: true,
    bio: '25+ years experience in Vivah and Griha Pravesh ceremonies. Trained from Kashi Vidyapeeth.', experienceYears: 25, languages: ['Hindi', 'Sanskrit'],
    specializations: ['Vivah', 'Griha Pravesh', 'Satyanarayan Puja', 'Havan'], location: 'Delhi', fullAddress: 'Paschim Vihar, Delhi',
    rating: 4.9, totalReviews: 87, completedBookings: 234, travelPreferences: { maxDistanceKm: 100, preferredModes: ['SELF_DRIVE', 'CAB'], selfDriveRatePerKm: 12, vehicleType: 'Car', hotelPreference: 'BUDGET', advanceNoticeDays: 1 },
    bankAccountName: 'Rajesh Kumar Tiwari', bankAccountNumber: '1234567890', bankIfscCode: 'HDFC0001234', bankName: 'HDFC Bank', bankVerified: true, deviceOs: 'Android 12', deviceModel: 'Samsung Galaxy A52', isOnline: true,
    services: [
      { pujaType: 'Vivah', dakshinaAmount: 21000, durationHours: 5, description: 'Complete wedding rituals with proper vidhi' },
      { pujaType: 'Griha Pravesh', dakshinaAmount: 7000, durationHours: 3 },
      { pujaType: 'Satyanarayan Puja', dakshinaAmount: 3500, durationHours: 2 },
      { pujaType: 'Havan', dakshinaAmount: 5000, durationHours: 2.5 }
    ],
    packages: [
      { packageName: 'BASIC', packageType: PackageType.BASIC, pujaType: 'Vivah', fixedPrice: 3500, items: vivahBasicItems },
      { packageName: 'STANDARD', packageType: PackageType.STANDARD, pujaType: 'Vivah', fixedPrice: 6000, items: vivahStandardItems },
      { packageName: 'PREMIUM', packageType: PackageType.PREMIUM, pujaType: 'Vivah', fixedPrice: 9500, items: vivahPremiumItems }
    ],
    blockedDates: blockNext3Tuesdays()
  },
  {
    phone: '+919700100002', name: 'Pt. Vishnu Shastri', verificationStatus: VerificationStatus.VERIFIED, aadhaarVerified: true, videoKycCompleted: true,
    bio: 'Maithil Brahmin with 30+ years. Specialized in Maithili traditions. 500+ weddings performed.', experienceYears: 30, languages: ['Hindi', 'Sanskrit', 'Maithili', 'English'],
    specializations: ['Vivah', 'Mundan', 'Namkaran', 'Annaprashan', 'Upanayana'], location: 'Varanasi', fullAddress: 'Assi Ghat, Varanasi',
    rating: 4.9, totalReviews: 156, completedBookings: 512, travelPreferences: { maxDistanceKm: 2000, preferredModes: ['TRAIN', 'FLIGHT', 'SELF_DRIVE'], selfDriveRatePerKm: 12, vehicleType: 'Car', hotelPreference: '3_STAR', advanceNoticeDays: 7 },
    bankAccountName: 'Vishnu Shastri', bankAccountNumber: '0987654321', bankIfscCode: 'SBIN0001234', bankName: 'SBI', bankVerified: true, deviceOs: 'Android 11', deviceModel: 'Redmi Note 10', isOnline: true,
    services: [
      { pujaType: 'Vivah', dakshinaAmount: 35000, durationHours: 6 },
      { pujaType: 'Mundan', dakshinaAmount: 8000, durationHours: 2.5 },
      { pujaType: 'Namkaran', dakshinaAmount: 5000, durationHours: 2 },
      { pujaType: 'Annaprashan', dakshinaAmount: 4000, durationHours: 1.5 },
      { pujaType: 'Upanayana', dakshinaAmount: 15000, durationHours: 4 }
    ],
    packages: [
      { packageName: 'BASIC', packageType: PackageType.BASIC, pujaType: 'Vivah', fixedPrice: 3500, items: vivahBasicItems },
      { packageName: 'STANDARD', packageType: PackageType.STANDARD, pujaType: 'Vivah', fixedPrice: 6000, items: vivahStandardItems },
      { packageName: 'PREMIUM', packageType: PackageType.PREMIUM, pujaType: 'Vivah', fixedPrice: 12000, items: vivahPremiumItems }
    ],
    blockedDates: blockJan20To25()
  },
  {
    phone: '+919700100003', name: 'Pt. Suresh Dubey', verificationStatus: VerificationStatus.VERIFIED, experienceYears: 18, rating: 4.7, totalReviews: 63, completedBookings: 145, specializations: ['Griha Pravesh', 'Satyanarayan Puja', 'Vastu Shanti'],
    location: 'Noida', travelPreferences: { maxDistanceKm: 200, preferredModes: ['CAB', 'SELF_DRIVE'], vehicleType: 'Car', hotelPreference: 'BUDGET', advanceNoticeDays: 2 },
    services: [{ pujaType: 'Griha Pravesh', dakshinaAmount: 8000, durationHours: 3 }, { pujaType: 'Satyanarayan Puja', dakshinaAmount: 4000, durationHours: 2 }, { pujaType: 'Vastu Shanti', dakshinaAmount: 12000, durationHours: 4 }]
  },
  {
    phone: '+919700100004', name: 'Pt. Hariprasad', verificationStatus: VerificationStatus.VERIFIED, experienceYears: 22, rating: 4.8, totalReviews: 92, specializations: ['Havan', 'Rudra Abhishek', 'Ganges Puja', 'Shradh'],
    location: 'Haridwar', travelPreferences: { maxDistanceKm: 1000, preferredModes: ['TRAIN', 'SELF_DRIVE', 'CAB'], vehicleType: 'Car', hotelPreference: 'BUDGET', advanceNoticeDays: 3 },
    services: [{ pujaType: 'Havan', dakshinaAmount: 10000, durationHours: 2 }, { pujaType: 'Rudra Abhishek', dakshinaAmount: 15000, durationHours: 4 }, { pujaType: 'Shradh', dakshinaAmount: 6000, durationHours: 2 }]
  },
  {
    phone: '+919700100005', name: 'Pt. Krishnakant', verificationStatus: VerificationStatus.VERIFIED, rating: 4.6, totalReviews: 44, specializations: ['Janmashtami Puja', 'Govardhan Puja', 'Vivah', 'Satyanarayan Puja'],
    location: 'Mathura', travelPreferences: { maxDistanceKm: 500, preferredModes: ['SELF_DRIVE', 'TRAIN'], vehicleType: 'Car', hotelPreference: 'BUDGET', advanceNoticeDays: 2 }
  },
  {
    phone: '+919700100006', name: 'Pt. Amit Mishra', verificationStatus: VerificationStatus.VERIFIED, experienceYears: 12, rating: 4.5, totalReviews: 31, specializations: ['Corporate Puja', 'Griha Pravesh', 'Navratri Puja'],
    location: 'Gurgaon', travelPreferences: { maxDistanceKm: 150, preferredModes: ['CAB', 'SELF_DRIVE'], vehicleType: 'Car', hotelPreference: 'BUDGET', advanceNoticeDays: 1 }
  },
  { phone: '+919700100007', name: 'Pt. Akash Sharma', verificationStatus: VerificationStatus.DOCUMENTS_SUBMITTED, location: 'Delhi', specializations: ['Vivah', 'Havan'] },
  { phone: '+919700100008', name: 'Pt. Shivam Pandey', verificationStatus: VerificationStatus.DOCUMENTS_SUBMITTED, location: 'Noida', specializations: ['Satyanarayan Puja', 'Ganesh Puja'] },
  { phone: '+919700100009', name: 'Pt. Rahul Upadhyay', verificationStatus: VerificationStatus.PENDING, location: 'Delhi', specializations: ['Vivah'] },
  {
    phone: '+919700100010', name: 'Pt. Manoj Shukla', verificationStatus: VerificationStatus.VERIFIED, experienceYears: 20, rating: 4.7, totalReviews: 58, specializations: ['Vivah', 'Griha Pravesh', 'Mundan'],
    location: 'Lucknow', travelPreferences: { maxDistanceKm: 800, preferredModes: ['TRAIN', 'FLIGHT'], vehicleType: 'Car', hotelPreference: '3_STAR', advanceNoticeDays: 5 }
  }
];

async function main() {
  console.log('🔄 Cleaning up existing data...');
  await prisma.review.deleteMany();
  await prisma.favoritePandit.deleteMany();
  await prisma.bookingStatusUpdate.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.samagriPackage.deleteMany();
  await prisma.pujaService.deleteMany();
  await prisma.panditBlockedDate.deleteMany();
  await prisma.panditProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cityDistance.deleteMany();
  await prisma.muhuratDate.deleteMany();
  console.log('✅ Cleanup complete.');

  console.log('🌱 Seeding City Distances...');
  for (const [from, to, dist, hrs] of CITY_DISTANCES) {
    const fromCity = from as string;
    const toCity = to as string;
    const distanceKm = dist as number;
    const estimatedDriveHours = hrs as number;
    await prisma.cityDistance.create({ data: { fromCity, toCity, distanceKm, estimatedDriveHours } });
    await prisma.cityDistance.create({ data: { fromCity: toCity, toCity: fromCity, distanceKm, estimatedDriveHours } });
  }

  console.log('🌱 Seeding Muhurats...');
  const upsertMuhurat = async (date: string, pujaType: string, timeWindow: string, significance: string) => {
    await prisma.muhuratDate.create({ data: { date: new Date(date), pujaType, timeWindow, significance, source: "Hindu Panchang 2026" } });
  };
  for (const m of VIVAH_MUHURATS) await upsertMuhurat(m[0], "Vivah", m[1], m[2]);
  for (const m of GRIHA_PRAVESH_MUHURATS) await upsertMuhurat(m[0], "Griha Pravesh", m[1], m[2]);
  for (const m of SATYANARAYAN_MUHURATS) await upsertMuhurat(m[0], "Satyanarayan Puja", m[1], m[2]);
  for (const m of MUNDAN_MUHURATS) await upsertMuhurat(m[0], "Mundan", m[1], m[2]);

  console.log('🌱 Seeding Admin & Customers...');
  await prisma.user.create({ data: { phone: ADMIN.phone, name: ADMIN.name, role: Role.ADMIN, isVerified: true } });

  const customerMap: Record<string, any> = {};
  for (let i = 0; i < CUSTOMERS.length; i++) {
    const c = CUSTOMERS[i];
    const user = await prisma.user.create({
      data: {
        phone: c.phone, name: c.name, role: Role.CUSTOMER, isVerified: true,
        customerProfile: {
          create: {
            preferredLanguages: c.languages, gotra: c.gotra,
            addresses: {
              create: [
                {
                  label: c.address.label, fullAddress: c.address.fullAddress, city: c.address.city,
                  state: c.address.state, pincode: c.address.pincode, isDefault: true
                }
              ]
            }
          }
        }
      }
    });
    customerMap[`customer${i + 1}`] = user;
  }

  console.log('🌱 Seeding Pandits...');
  const panditMap: Record<string, any> = {};
  for (let i = 0; i < PANDITS.length; i++) {
    const p = PANDITS[i];
    const user = await prisma.user.create({
      data: {
        phone: p.phone, name: p.name, role: Role.PANDIT, isVerified: p.verificationStatus === VerificationStatus.VERIFIED,
        panditProfile: {
          create: {
            bio: p.bio, experienceYears: p.experienceYears || 0, languages: p.languages || ['Hindi', 'Sanskrit'],
            specializations: p.specializations, verificationStatus: p.verificationStatus,
            aadhaarVerified: p.aadhaarVerified || false, videoKycCompleted: p.videoKycCompleted || false,
            location: p.location, fullAddress: p.fullAddress, rating: p.rating || 0,
            totalReviews: p.totalReviews || 0, completedBookings: p.completedBookings || 0,
            travelPreferences: p.travelPreferences || {}, bankAccountName: p.bankAccountName,
            bankAccountNumber: p.bankAccountNumber, bankIfscCode: p.bankIfscCode,
            bankName: p.bankName, bankVerified: p.bankVerified || false,
            deviceOs: p.deviceOs, deviceModel: p.deviceModel, isOnline: p.isOnline || false,
            pujaServices: { create: p.services || [] },
            samagriPackages: { create: p.packages || [] },
            blockedDates: { create: (p.blockedDates || []).map(date => ({ date })) }
          }
        }
      }
    });
    panditMap[`pandit${i + 1}`] = user;
  }

  console.log('🌱 Seeding Favorites...');
  await prisma.favoritePandit.create({ data: { customerId: customerMap.customer1.id, panditId: panditMap.pandit2.id } });
  await prisma.favoritePandit.create({ data: { customerId: customerMap.customer2.id, panditId: panditMap.pandit1.id } });

  console.log('🌱 Seeding Bookings...');
  // Booking 1 (COMPLETED)
  const b1 = await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-2026-DEMO1', customerId: customerMap.customer1.id, panditId: panditMap.pandit1.id,
      status: BookingStatus.COMPLETED, eventType: 'Vivah', eventDate: new Date('2026-01-15T00:00:00Z'), muhuratTime: '10:30 AM - 12:45 PM',
      venueCity: 'Delhi', venueAddress: 'House 45, Sector 12, Dwarka', venuePincode: '110075',
      travelRequired: false, dakshinaAmount: 21000, samagriAmount: 9500, platformFee: 3150, platformFeeGst: 567, grandTotal: 34217,
      paymentStatus: PaymentStatus.CAPTURED, payoutStatus: PayoutStatus.COMPLETED,
      statusUpdates: {
        create: [
          { fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.PANDIT_REQUESTED, updatedById: customerMap.customer1.id },
          { fromStatus: BookingStatus.PANDIT_REQUESTED, toStatus: BookingStatus.CONFIRMED, updatedById: panditMap.pandit1.id },
          { fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.PANDIT_ARRIVED, updatedById: panditMap.pandit1.id },
          { fromStatus: BookingStatus.PANDIT_ARRIVED, toStatus: BookingStatus.PUJA_IN_PROGRESS, updatedById: panditMap.pandit1.id },
          { fromStatus: BookingStatus.PUJA_IN_PROGRESS, toStatus: BookingStatus.COMPLETED, updatedById: panditMap.pandit1.id }
        ]
      },
      review: {
        create: {
          reviewerId: customerMap.customer1.id, revieweeId: panditMap.pandit1.id,
          overallRating: 5.0, knowledgeRating: 5.0, punctualityRating: 4.5, communicationRating: 5.0,
          comment: 'Rajesh ji performed our wedding ceremony with utmost devotion and proper vidhi. Every ritual was explained beautifully. Highly recommend!'
        }
      }
    }
  });

  // Booking 2 (CONFIRMED)
  await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-2026-DEMO2', customerId: customerMap.customer2.id, panditId: panditMap.pandit2.id,
      status: BookingStatus.CONFIRMED, eventType: 'Vivah', eventDate: new Date('2026-02-12T00:00:00Z'),
      venueCity: 'Noida', venueAddress: 'Flat 302, Supertech Emerald', venuePincode: '201304',
      travelRequired: true, travelMode: TravelMode.TRAIN, travelDistanceKm: 845, travelCost: 7800, travelStatus: TravelStatus.BOOKED,
      foodAllowanceDays: 3, foodAllowanceAmount: 3000, foodArrangement: FoodArrangement.PLATFORM_ALLOWANCE,
      dakshinaAmount: 35000, samagriAmount: 12000, platformFee: 5250, platformFeeGst: 945, travelServiceFee: 390, travelServiceFeeGst: 70, grandTotal: 64455,
      paymentStatus: PaymentStatus.CAPTURED
    }
  });

  // Booking 3 (CREATED -> just paid, waiting for pandit)
  await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-2026-DEMO3', customerId: customerMap.customer3.id, status: BookingStatus.PANDIT_REQUESTED, paymentStatus: PaymentStatus.CAPTURED,
      eventType: 'Griha Pravesh', eventDate: new Date('2026-02-04T00:00:00Z'), venueCity: 'Gurgaon', venueAddress: 'Villa 7, DLF Phase 3', venuePincode: '122002',
      dakshinaAmount: 7000, platformFee: 1050, platformFeeGst: 189, grandTotal: 8239
    }
  });

  // Booking 4 (CANCELLED)
  await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-2026-DEMO4', customerId: customerMap.customer4.id, status: BookingStatus.CANCELLED,
      eventType: 'Satyanarayan Puja', eventDate: new Date('2026-03-03T00:00:00Z'), venueCity: 'Delhi', venueAddress: 'Plot 123, Vasundhara Enclave', venuePincode: '110096',
      dakshinaAmount: 3500, platformFee: 525, platformFeeGst: 94, grandTotal: 4119, paymentStatus: PaymentStatus.CAPTURED,
      cancelledBy: 'CUSTOMER', refundStatus: RefundStatus.COMPLETED, refundAmount: 3150
    }
  });

  // Booking 5 (COMPLETED — has a review)
  await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-2026-DEMO5', customerId: customerMap.customer5.id, panditId: panditMap.pandit3.id,
      status: BookingStatus.COMPLETED, paymentStatus: PaymentStatus.CAPTURED, payoutStatus: PayoutStatus.COMPLETED,
      eventType: 'Griha Pravesh', eventDate: new Date('2026-01-07T00:00:00Z'), venueCity: 'Delhi', venueAddress: 'H.No 78, Model Town', venuePincode: '110009',
      dakshinaAmount: 8000, platformFee: 1200, platformFeeGst: 216, grandTotal: 9416,
      statusUpdates: {
        create: [
          { fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.PANDIT_REQUESTED, updatedById: customerMap.customer5.id },
          { fromStatus: BookingStatus.PUJA_IN_PROGRESS, toStatus: BookingStatus.COMPLETED, updatedById: panditMap.pandit3.id }
        ]
      },
      review: {
        create: {
          reviewerId: customerMap.customer5.id, revieweeId: panditMap.pandit3.id,
          overallRating: 4.5, knowledgeRating: 5.0, punctualityRating: 4.0, communicationRating: 4.5,
          comment: 'Very knowledgeable pandit ji. Arrived a bit late but performed the puja perfectly.'
        }
      }
    }
  });

  console.log('✅ Seed completed:');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Pandits (verified): ${await prisma.panditProfile.count({ where: { verificationStatus: 'VERIFIED' } })}`);
  console.log(`   Muhurat dates: ${await prisma.muhuratDate.count()}`);
  console.log(`   City distances: ${await prisma.cityDistance.count()}`);
  console.log(`   Bookings: ${await prisma.booking.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
