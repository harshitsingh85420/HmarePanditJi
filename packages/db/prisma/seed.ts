import { PrismaClient, Role, VerificationStatus, BookingStatus, TravelStatus, PaymentStatus, PayoutStatus, RefundStatus, PackageType } from '@prisma/client';

const prisma = new PrismaClient();

const CITY_DISTANCES = [
  ['Delhi', 'Noida', 25, 0.75],
  ['Delhi', 'Gurgaon', 30, 1],
  ['Delhi', 'Faridabad', 35, 1],
  ['Delhi', 'Ghaziabad', 28, 0.75],
  ['Delhi', 'Greater Noida', 45, 1.25],
  ['Delhi', 'Haridwar', 240, 4],
  ['Delhi', 'Varanasi', 820, 14],
  ['Delhi', 'Jaipur', 280, 4.5]
];

const VIVAH_MUHURATS = [
  ["2026-05-01T00:00:00Z", "10:30 AM - 12:45 PM", "Highly auspicious"],
  ["2026-05-15T00:00:00Z", "07:00 AM - 09:30 AM", "Shukla Paksha Panchami"],
  ["2026-06-10T00:00:00Z", "10:00 AM - 12:00 PM", "Auspicious Saptami"],
  ["2026-07-28T00:00:00Z", "11:30 AM - 01:30 PM", "Sacred day"],
  ["2026-08-04T00:00:00Z", "09:00 AM - 11:00 AM", "Basant Panchami"]
];

const GRIHA_PRAVESH_MUHURATS = [
  ["2026-05-05T00:00:00Z", "11:00 AM - 01:00 PM", "Saptami"],
  ["2026-06-14T00:00:00Z", "09:00 AM - 11:00 AM", "Auspicious entry"],
  ["2026-07-04T00:00:00Z", "10:30 AM - 12:30 PM", "Goddess blessing"],
  ["2026-08-06T00:00:00Z", "09:30 AM - 11:30 AM", "Shukla Saptami"],
  ["2026-09-14T00:00:00Z", "08:00 AM - 10:00 AM", "Preceding week"]
];

const SATYANARAYAN_MUHURATS = [
  ["2026-05-03T00:00:00Z", "06:00 PM - 08:00 PM", "Purnima Sandhya"],
  ["2026-06-17T00:00:00Z", "10:00 AM - 12:00 PM", "Ekadashi"],
  ["2026-07-02T00:00:00Z", "06:00 PM - 08:00 PM", "Purnima"],
  ["2026-08-16T00:00:00Z", "05:00 PM - 07:00 PM", "Pradosh"],
  ["2026-09-03T00:00:00Z", "06:30 PM - 08:30 PM", "Purnima"]
];

const MUNDAN_MUHURATS = [
  ["2026-05-19T00:00:00Z", "10:00 AM - 12:00 PM", "Panchami"],
  ["2026-06-04T00:00:00Z", "09:00 AM - 11:00 AM", "Grace for children"],
  ["2026-07-21T00:00:00Z", "10:30 AM - 12:30 PM", "Tritiya"],
  ["2026-08-15T00:00:00Z", "09:00 AM - 11:00 AM", "Shukla Panchami"],
  ["2026-09-20T00:00:00Z", "10:00 AM - 11:00 AM", "Panchami"]
];

const ADMIN = { phone: '9000000001', name: 'HPJ Admin' };

const CUSTOMERS = [
  { phone: '9000000002', name: 'Rajesh Kumar', gotra: 'Bharadwaj' },
  { phone: '9000000003', name: 'Priya Sharma', gotra: 'Kashyap' },
  { phone: '9000000004', name: 'Vinod Gupta', gotra: 'Shandilya' }
];

const PANDITS = [
  {
    phone: '9876543210', name: 'Pt. Ramesh Sharma', verificationStatus: VerificationStatus.VERIFIED,
    experienceYears: 15, rating: 4.8, totalReviews: 47, location: 'Delhi',
    travelPreferences: { maxDistanceKm: 500, preferredModes: ['TRAIN', 'CAB'] },
    services: [
      { pujaType: 'Satyanarayan Puja', dakshinaAmount: 3100, durationHours: 2 },
      { pujaType: 'Griha Pravesh', dakshinaAmount: 7000, durationHours: 3 },
      { pujaType: 'Annaprashan', dakshinaAmount: 4000, durationHours: 2 }
    ],
    packages: [
      { packageName: 'Basic', packageType: PackageType.BASIC, pujaType: 'Satyanarayan Puja', fixedPrice: 1500, items: [] },
      { packageName: 'Standard', packageType: PackageType.STANDARD, pujaType: 'Satyanarayan Puja', fixedPrice: 2500, items: [] },
      { packageName: 'Premium', packageType: PackageType.PREMIUM, pujaType: 'Satyanarayan Puja', fixedPrice: 4000, items: [] }
    ]
  },
  {
    phone: '9876543211', name: 'Pt. Suresh Tiwari', verificationStatus: VerificationStatus.VERIFIED,
    experienceYears: 25, rating: 4.6, totalReviews: 23, location: 'Haridwar',
    travelPreferences: { maxDistanceKm: 1000, preferredModes: ['TRAIN', 'FLIGHT', 'CAB'] },
    services: [
      { pujaType: 'Vivah', dakshinaAmount: 25000, durationHours: 6 },
      { pujaType: 'Mundan', dakshinaAmount: 5000, durationHours: 2 }
    ],
    packages: []
  },
  {
    phone: '9876543212', name: 'Pt. Vinod Kumar', verificationStatus: VerificationStatus.DOCUMENTS_SUBMITTED,
    experienceYears: 8, location: 'Varanasi', travelPreferences: {}, services: [], packages: []
  },
  {
    phone: '9876543213', name: 'Pt. Mohan Lal', verificationStatus: VerificationStatus.REJECTED,
    experienceYears: 3, location: 'Jaipur', travelPreferences: {}, services: [], packages: []
  }
];

async function main() {
  console.log('🔄 Cleaning up existing data...');

  // Delete in dependency order
  await prisma.notification.deleteMany();
  await prisma.customerRating.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favoritePandit.deleteMany();
  await prisma.bookingStatusUpdate.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.address.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.samagriPackage.deleteMany();
  await prisma.pujaService.deleteMany();
  await prisma.panditBlockedDate.deleteMany();
  await prisma.panditProfile.deleteMany();
  await prisma.supportTicket.deleteMany();
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
            preferredLanguages: ['Hindi'], gotra: c.gotra,
            addresses: i === 0 ? {
              create: [
                { label: 'Delhi', fullAddress: 'A-42, Sector 62, Noida, UP', city: 'Delhi', state: 'Delhi', pincode: '110001', isDefault: true },
                { label: 'Noida', fullAddress: 'C-15, Sector 4, Indirapuram, UP', city: 'Noida', state: 'UP', pincode: '201301', isDefault: false }
              ]
            } : {}
          }
        },
        // FamilyMember belongs to User directly
        familyMembers: i === 0 ? {
          create: [
            { name: 'Sunita Devi', relation: 'Spouse', dob: new Date('1990-01-01') },
            { name: 'Arjun', relation: 'Son', dob: new Date('2015-01-01') }
          ]
        } : {}
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
            experienceYears: p.experienceYears || 0, languages: ['Hindi', 'Sanskrit'],
            verificationStatus: p.verificationStatus,
            location: p.location, fullAddress: p.location, rating: p.rating || 0,
            totalReviews: p.totalReviews || 0,
            travelPreferences: p.travelPreferences || {},
            pujaServices: { create: p.services || [] },
            samagriPackages: { create: p.packages || [] }
          }
        }
      }
    });
    panditMap[`pandit${i + 1}`] = user;
  }

  console.log('🌱 Seeding Favorites...');
  await prisma.favoritePandit.create({ data: { customerId: customerMap.customer1.id, panditId: panditMap.pandit1.id } });
  await prisma.favoritePandit.create({ data: { customerId: customerMap.customer1.id, panditId: panditMap.pandit2.id } });
  await prisma.favoritePandit.create({ data: { customerId: customerMap.customer2.id, panditId: panditMap.pandit1.id } });

  console.log('🌱 Seeding Bookings...');
  // HPJ-001: Customer 1 → Pandit 1, COMPLETED, Satyanarayan, Delhi
  const b1 = await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-001', customerId: customerMap.customer1.id, panditId: panditMap.pandit1.id,
      status: BookingStatus.COMPLETED, eventType: 'Satyanarayan Puja', eventDate: new Date('2026-05-03T00:00:00Z'),
      venueCity: 'Delhi', venueAddress: 'A-42, Sector 62, Noida, UP, 201301', venuePincode: '110001',
      travelRequired: false, dakshinaAmount: 3100, platformFee: 465, platformFeeGst: 83, grandTotal: 3648,
      paymentStatus: PaymentStatus.CAPTURED, payoutStatus: PayoutStatus.COMPLETED,
      panditPayout: 2635, payoutReference: 'UTR123456',
      statusUpdates: {
        create: [
          { fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.PANDIT_REQUESTED, updatedById: customerMap.customer1.id },
          { fromStatus: BookingStatus.PUJA_IN_PROGRESS, toStatus: BookingStatus.COMPLETED, updatedById: panditMap.pandit1.id }
        ]
      }
    }
  });

  // HPJ-002: Customer 1 → Pandit 2, CONFIRMED, Vivah, Delhi
  const b2 = await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-002', customerId: customerMap.customer1.id, panditId: panditMap.pandit2.id,
      status: BookingStatus.CONFIRMED, eventType: 'Vivah', eventDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
      venueCity: 'Delhi', venueAddress: 'A-42, Sector 62, Noida, UP, 201301', venuePincode: '110001',
      travelRequired: true, travelStatus: TravelStatus.PENDING, dakshinaAmount: 25000, platformFee: 3750, platformFeeGst: 675, grandTotal: 29425,
      paymentStatus: PaymentStatus.CAPTURED,
      statusUpdates: {
        create: [
          { fromStatus: BookingStatus.CREATED, toStatus: BookingStatus.CONFIRMED, updatedById: customerMap.customer1.id }
        ]
      }
    }
  });

  // HPJ-003: Customer 2 → Pandit 1, TRAVEL_BOOKED, Griha Pravesh
  const b3 = await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-003', customerId: customerMap.customer2.id, panditId: panditMap.pandit1.id,
      status: BookingStatus.TRAVEL_BOOKED, eventType: 'Griha Pravesh', eventDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
      venueCity: 'Noida', venueAddress: 'C-15, Sector 4, Indirapuram, UP, 201014', venuePincode: '201301',
      travelRequired: true, travelStatus: TravelStatus.BOOKED, dakshinaAmount: 7000, platformFee: 1050, platformFeeGst: 189, grandTotal: 8239,
      paymentStatus: PaymentStatus.CAPTURED, payoutStatus: PayoutStatus.PENDING, panditPayout: 5950
    }
  });

  // HPJ-004: Customer 3 → Pandit 2, PANDIT_REQUESTED, Mundan
  const b4 = await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-004', customerId: customerMap.customer3.id, panditId: panditMap.pandit2.id,
      status: BookingStatus.PANDIT_REQUESTED, eventType: 'Mundan', eventDate: new Date('2026-06-04T00:00:00Z'),
      venueCity: 'Delhi', venueAddress: 'Delhi Address', venuePincode: '110001',
      dakshinaAmount: 5000, platformFee: 750, platformFeeGst: 135, grandTotal: 5885,
      paymentStatus: PaymentStatus.CAPTURED
    }
  });

  // HPJ-005: Customer 2 → Pandit 1, CANCELLED, Satyanarayan
  const b5 = await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-005', customerId: customerMap.customer2.id, panditId: panditMap.pandit1.id,
      status: BookingStatus.CANCELLED, eventType: 'Satyanarayan Puja', eventDate: new Date('2026-07-02T00:00:00Z'),
      venueCity: 'Delhi', venueAddress: 'Delhi Address', venuePincode: '110001',
      dakshinaAmount: 3100, platformFee: 465, platformFeeGst: 83, grandTotal: 3648,
      paymentStatus: PaymentStatus.CAPTURED, refundStatus: RefundStatus.COMPLETED,
      cancelledBy: 'CUSTOMER'
    }
  });

  // HPJ-006: Customer 3 → Pandit 1, CREATED, Annaprashan
  const b6 = await prisma.booking.create({
    data: {
      bookingNumber: 'HPJ-006', customerId: customerMap.customer3.id, panditId: panditMap.pandit1.id,
      status: BookingStatus.CREATED, eventType: 'Annaprashan', eventDate: new Date('2026-08-04T00:00:00Z'),
      venueCity: 'Delhi', venueAddress: 'Delhi Address', venuePincode: '110001',
      dakshinaAmount: 4000, platformFee: 600, platformFeeGst: 108, grandTotal: 4708,
      paymentStatus: PaymentStatus.PENDING
    }
  });

  console.log('🌱 Seeding Reviews...');
  // Review for completed booking HPJ-001
  await prisma.review.create({
    data: {
      bookingId: b1.id,
      reviewerId: customerMap.customer1.id, revieweeId: panditMap.pandit1.id,
      overallRating: 5.0, knowledgeRating: 5.0, punctualityRating: 5.0, communicationRating: 5.0,
      comment: 'Bahut acchi puja hui. Pandit ji ne sab vidhi-vidhaan se karwayi.'
    }
  });

  console.log('🌱 Seeding Notifications...');
  await prisma.notification.create({ data: { userId: customerMap.customer1.id, title: 'Booking Confirmed', message: 'Your booking HPJ-002 is confirmed.', type: 'BOOKING_UPDATE' } });
  await prisma.notification.create({ data: { userId: customerMap.customer1.id, title: 'Pandit Assigned', message: 'Pandit has been assigned to HPJ-002.', type: 'BOOKING_UPDATE' } });
  await prisma.notification.create({ data: { userId: panditMap.pandit1.id, title: 'Nayi Booking Request', message: 'Aapke liye HPJ-006 ki nayi request aayi hai.', type: 'BOOKING_REQUEST' } });
  await prisma.notification.create({ data: { userId: panditMap.pandit1.id, title: 'Payout Processed', message: 'HPJ-001 ka payout ₹2,635 aapke account mein aa gaya hai.', type: 'PAYOUT_UPDATE' } });
  await prisma.notification.create({ data: { userId: panditMap.pandit2.id, title: 'Travel Details Added', message: 'HPJ-002 ke liye travel details add ho gayi hain.', type: 'TRAVEL_UPDATE' } });

  console.log('✅ Seed completed successfully!');
  console.log(`
📊 Seeded Data Summary:
   • 1 Admin, 3 Customers, 4 Pandits (2 verified, 1 pending, 1 rejected)
   • 6 Bookings (1 completed, 1 confirmed, 1 travel_booked, 1 requested, 1 cancelled, 1 created)
   • 16 City Distances (8 pairs, bidirectional)
   • 20 Muhurat Dates (Vivah, Griha Pravesh, Satyanarayan, Mundan)
   • 3 Favorite Pandits
   • 1 Review
   • 5 Notifications
   • 3 Samagri Packages (for Pandit 1)
   
🔑 Test Login Phones:
   Admin:    9000000001
   Customer: 9000000002 / 9000000003 / 9000000004
   Pandit:   9876543210 (verified) / 9876543211 (verified)
   OTP:      Any 6 digits (MOCK_OTP=true)
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
