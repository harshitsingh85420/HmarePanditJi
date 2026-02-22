const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    for (const { search, replace } of replacements) {
        if (typeof search === 'string') {
            content = content.replace(search, replace);
        } else {
            content = content.replace(search, replace);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`No changes made to ${filePath}`);
    }
}

const SRC = path.join(__dirname, 'services/api/src');

// 1. booking.service.ts (createBooking)
replaceInFile(path.join(SRC, 'services/booking.service.ts'), [
    {
        search: `return booking;\n}`,
        replace: `
  const notificationService = new (require('./notification.service').NotificationService)();
  const getTemplate = require('./notification-templates').getNotificationTemplate;
  const user = await prisma.user.findUnique({ where: { id: customerId } });
  
  // Template 1 -> Customer
  const t1 = getTemplate("BOOKING_CREATED", { id: booking.id.substring(0,8).toUpperCase(), pujaType: eventType, date: eventDate.toISOString().split('T')[0] });
  await notificationService.notify({
    userId: customerId,
    type: "BOOKING_CREATED",
    title: t1.title,
    message: t1.message,
    smsMessage: t1.smsMessage
  });

  // Template 2 -> Pandit
  if (panditId) {
    const p1 = getTemplate("NEW_BOOKING_REQUEST", { pujaType: eventType, date: eventDate.toISOString().split('T')[0], city: venueCity, amount: booking.panditPayout || dakshinaAmount });
    await notificationService.notify({
      userId: panditId,
      type: "NEW_BOOKING_REQUEST",
      title: p1.title,
      message: p1.message,
      smsMessage: p1.smsMessage
    });
  }
  return booking;
}`
    }
]);

// 2. pandit.routes.ts (acceptBooking, decline, complete, arrived, start-journey, rate-customer)
replaceInFile(path.join(SRC, 'routes/pandit.routes.ts'), [
    {
        search: `import { AppError } from "../middleware/errorHandler";`,
        replace: `import { AppError } from "../middleware/errorHandler";
import { NotificationService } from "../services/notification.service";
import { getNotificationTemplate } from "../services/notification-templates";
const notificationService = new NotificationService();`
    },
    {
        search: "console.log(`[SMS to Customer]: \"Booking HPJ-${booking.id} confirmed! -HmarePanditJi\"`);",
        replace: `const t1 = getNotificationTemplate("BOOKING_CONFIRMED", { id: booking.id.substring(0,8).toUpperCase(), panditName: "Aapke Pandit", pujaType: booking.eventType, date: booking.eventDate.toISOString().split('T')[0] });
    await notificationService.notify({ userId: booking.customerId, type: "BOOKING_CONFIRMED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });
    
    const t2 = getNotificationTemplate("BOOKING_CONFIRMED_ACK", { id: booking.id.substring(0,8).toUpperCase(), date: booking.eventDate.toISOString().split('T')[0], city: booking.venueCity, pujaType: booking.eventType });
    await notificationService.notify({ userId: req.user!.id, type: "BOOKING_CONFIRMED_ACK", title: t2.title, message: t2.message, smsMessage: t2.smsMessage });`
    },
    {
        search: "console.log(`[ADMIN] Pandit declined booking ${booking.id} — needs reassignment`);",
        replace: `const t1 = getNotificationTemplate("CANCELLATION_REQUESTED", { id: booking.id.substring(0,8).toUpperCase(), customerName: "Unknown", reason: reason });
    console.log(t1.message); // Admin log
    // We don't notify customer directly for admin cancellation requests in Phase 1`
    },
    {
        search: "console.log(`[SMS to Customer]: \"Pandit Ji is on the way! Estimated arrival: ${req.body.eta}\"`);",
        replace: `const t1 = getNotificationTemplate("PANDIT_EN_ROUTE", { id: booking.id.substring(0,8).toUpperCase() });
    await notificationService.notify({ userId: booking.customerId, type: "PANDIT_EN_ROUTE", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });`
    },
    {
        search: "console.log(`[SMS to Customer]: \"Pandit Ji has arrived! 🙏\"`);",
        replace: `const t1 = getNotificationTemplate("PANDIT_ARRIVED", { id: booking.id.substring(0,8).toUpperCase() });
    await notificationService.notify({ userId: booking.customerId, type: "PANDIT_ARRIVED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });`
    },
    {
        search: "console.log(`[PAYOUT] Queued payout for Pandit ${booking.panditId}, Booking ${booking.id}`);\\n    console.log(`[SMS to Customer] Puja completed! Rate your experience...`);",
        replace: `// notify customer
    const t1 = getNotificationTemplate("PUJA_COMPLETED", { id: booking.id.substring(0,8).toUpperCase() });
    await notificationService.notify({ userId: booking.customerId, type: "PUJA_COMPLETED", title: t1.title, message: t1.message, smsMessage: t1.smsMessage });
    
    // notify pandit
    const t2 = getNotificationTemplate("PUJA_COMPLETED_PANDIT", { id: booking.id.substring(0,8).toUpperCase(), amount: booking.panditPayout });
    await notificationService.notify({ userId: req.user!.id, type: "PUJA_COMPLETED", title: t2.title, message: t2.message, smsMessage: t2.smsMessage });`
    },
    // Add rate-customer endpoint before calendar
    {
        search: "// ─── Calendar Endpoints ───────────────────────────────────────────────────────",
        replace: `/**
 * POST /pandits/bookings/:bookingId/rate-customer
 */
router.post("/bookings/:bookingId/rate-customer", authenticate, roleGuard("PANDIT"), async (req, res, next) => {
  try {
    const { punctuality, hospitality, foodArrangement, comment } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
    if (!booking || booking.panditId !== req.user!.id) throw new AppError("Invalid booking", 400);

    const rating = await prisma.customerRating.create({
      data: {
        bookingId: booking.id,
        panditId: req.user!.id,
        customerId: booking.customerId,
        punctuality: parseInt(punctuality),
        hospitality: parseInt(hospitality),
        foodArrangement: parseInt(foodArrangement),
        comment
      }
    });

    sendSuccess(res, rating, "Customer rated successfully");
  } catch(err) {
    next(err);
  }
});

// ─── Calendar Endpoints ───────────────────────────────────────────────────────`
    }
]);

// Let's modify adminRoutes next and payment routes, etc.
// But first let's see where they exist.
