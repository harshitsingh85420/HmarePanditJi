export const getNotificationTemplate = (type: string, data: any) => {
    switch (type) {
        case 'BOOKING_CREATED':
            return {
                title: "Booking Created!",
                message: `🙏 Booking HPJ-${data.id} created! ${data.pujaType} on ${data.date}. Pandit ji will confirm within 6 hours. -HmarePanditJi`,
                smsMessage: `🙏 Booking HPJ-${data.id} created! ${data.pujaType} on ${data.date}. Pandit ji will confirm within 6 hours. -HmarePanditJi`
            };
        case 'NEW_BOOKING_REQUEST':
            return {
                title: "New Booking Request!",
                message: `🔔 Nayi booking aayi hai! ${data.pujaType}, ${data.date}, ${data.city}. Kamai: ₹${data.amount}. 6 ghante mein jawab dein. App kholein: [link] -HmarePanditJi`,
                smsMessage: `🔔 Nayi booking aayi hai! ${data.pujaType}, ${data.date}, ${data.city}. Kamai: ₹${data.amount}. 6 ghante mein jawab dein. App kholein: [link] -HmarePanditJi`
            };
        case 'BOOKING_CONFIRMED':
            return {
                title: "Pandit Confirmed!",
                message: `✅ Booking HPJ-${data.id} confirmed! Pt. ${data.panditName} will perform ${data.pujaType} on ${data.date}. -HmarePanditJi`,
                smsMessage: `✅ Booking HPJ-${data.id} confirmed! Pt. ${data.panditName} will perform ${data.pujaType} on ${data.date}. -HmarePanditJi`
            };
        case 'BOOKING_CONFIRMED_ACK':
            return {
                title: "Booking Accepted!",
                message: `✅ Aapne booking HPJ-${data.id} accept ki. ${data.date} ko ${data.city} mein ${data.pujaType}. Yatra ki jankari jald milegi. -HmarePanditJi`,
                smsMessage: `✅ Aapne booking HPJ-${data.id} accept ki. ${data.date} ko ${data.city} mein ${data.pujaType}. Yatra ki jankari jald milegi. -HmarePanditJi`
            };
        case 'TRAVEL_BOOKED':
            return {
                title: "Travel Arranged!",
                message: `✈️ HPJ-${data.id}: Pandit ji ki yatra book ho gayi! ${data.travelMode} — ${data.details}. Track in app. -HmarePanditJi`,
                smsMessage: `✈️ HPJ-${data.id}: Pandit ji ki yatra book ho gayi! ${data.travelMode} — ${data.details}. Track in app. -HmarePanditJi`
            };
        case 'TRAVEL_BOOKED_PANDIT':
            return {
                title: "Travel Booked!",
                message: `🎫 HPJ-${data.id}: Aapki yatra book! ${data.mode} — ${data.details}. PNR/Ref: ${data.reference}. App mein full plan dekhein. -HmarePanditJi`,
                smsMessage: `🎫 HPJ-${data.id}: Aapki yatra book! ${data.mode} — ${data.details}. PNR/Ref: ${data.reference}. App mein full plan dekhein. -HmarePanditJi`
            };
        case 'PANDIT_EN_ROUTE':
            return {
                title: "Pandit on the way!",
                message: `🚗 Pandit ji yatra shuru kar chuke hain! HPJ-${data.id}. Dashboard mein status dekhein. -HmarePanditJi`,
                smsMessage: `🚗 Pandit ji yatra shuru kar chuke hain! HPJ-${data.id}. Dashboard mein status dekhein. -HmarePanditJi`
            };
        case 'PANDIT_ARRIVED':
            return {
                title: "Pandit has arrived!",
                message: `🙏 Pandit ji pahunch gaye hain! Puja ki taiyari shuru karen. HPJ-${data.id}. -HmarePanditJi`,
                smsMessage: `🙏 Pandit ji pahunch gaye hain! Puja ki taiyari shuru karen. HPJ-${data.id}. -HmarePanditJi`
            };
        case 'PUJA_COMPLETED':
            return {
                title: "Puja Completed!",
                message: `🙏 Puja sampann hui! HPJ-${data.id}. Apna anubhav batayein — review dein app mein. Shubh ho! -HmarePanditJi`,
                smsMessage: `🙏 Puja sampann hui! HPJ-${data.id}. Apna anubhav batayein — review dein app mein. Shubh ho! -HmarePanditJi`
            };
        case 'PUJA_COMPLETED_PANDIT':
            return {
                title: "Puja Complete — Payout Queued",
                message: `🙏 Puja HPJ-${data.id} poori hui! ₹${data.amount} ka payment 24-48 ghante mein aapke account mein aayega. -HmarePanditJi`,
                smsMessage: `🙏 Puja HPJ-${data.id} poori hui! ₹${data.amount} ka payment 24-48 ghante mein aapke account mein aayega. -HmarePanditJi`
            };
        case 'PAYMENT_CAPTURED':
            return {
                title: "Payment Received",
                message: `💳 ₹${data.amount} payment received for HPJ-${data.id}. Receipt in app. -HmarePanditJi`,
                smsMessage: `💳 ₹${data.amount} payment received for HPJ-${data.id}. Receipt in app. -HmarePanditJi`
            };
        case 'PAYOUT_COMPLETED':
            return {
                title: "Payment Received!",
                message: `💰 ₹${data.amount} aapke bank account mein bhej diya gaya! Ref: ${data.transactionRef}. HPJ-${data.id}. -HmarePanditJi`,
                smsMessage: `💰 ₹${data.amount} aapke bank account mein bhej diya gaya! Ref: ${data.transactionRef}. HPJ-${data.id}. -HmarePanditJi`
            };
        case 'CANCELLATION_REQUESTED':
            return {
                title: "Cancellation Requested",
                message: `[ADMIN] Cancellation request: HPJ-${data.id} by ${data.customerName}. Reason: ${data.reason}. Review needed.`,
                smsMessage: `[ADMIN] Cancellation request: HPJ-${data.id} by ${data.customerName}. Reason: ${data.reason}. Review needed.`
            };
        case 'CANCELLATION_APPROVED':
            return {
                title: "Booking Cancelled",
                message: `❌ HPJ-${data.id} cancelled. Refund ₹${data.refundAmount} will be credited in 5-7 days. -HmarePanditJi`,
                smsMessage: `❌ HPJ-${data.id} cancelled. Refund ₹${data.refundAmount} will be credited in 5-7 days. -HmarePanditJi`
            };
        case 'CANCELLATION_APPROVED_PANDIT':
            return {
                title: "Booking Cancelled",
                message: `❌ HPJ-${data.id} customer ne cancel kiya. Aapka calendar free ho gaya. -HmarePanditJi`,
                smsMessage: `❌ HPJ-${data.id} customer ne cancel kiya. Aapka calendar free ho gaya. -HmarePanditJi`
            };
        // ── DEVANAGARI, 2026-07-31 (Isj ruling) ──────────────────────────
        // These two were roman transliteration — "Badhai ho! Aapki profile
        // verify ho gayi" — and the FIRST HONEST VERIFIED in this product's
        // history was announced to a Devanagari-only reader in a script he
        // does not read. Stronger than the FOUC that was promoted to a
        // defect for the same law: that was a flash on a screen; this is a
        // message delivered to a real person's phone, and every verified
        // pandit after him receives it.
        //
        // REGISTER: आप, never तुम. कीजिए/-इए, never करो. Same rules the
        // preset rejection reasons live under in packages/types.
        // The 🎉/⚠️ glyphs stay pending the icon-system ruling (Isj's).
        case 'VERIFICATION_APPROVED':
            return {
                // He is told WHAT is true and WHAT it enables — nothing more.
                // "आपकी पहचान" names WHICH verification: identity, not the
                // per-pooja video. The two must never collapse into one word.
                title: "पहचान सत्यापित हो गई",
                message: `🎉 बधाई हो! आपकी पहचान सत्यापित हो गई है। अब यजमान आपको खोज सकते हैं और बुकिंग भेज सकते हैं। — हमारे पंडित जी`,
                smsMessage: `🎉 बधाई हो! आपकी पहचान सत्यापित हो गई है। अब यजमान आपको खोज सकते हैं। — हमारे पंडित जी`
            };
        case 'VERIFICATION_REJECTED':
            return {
                // The reason arrives ALREADY in Devanagari — it comes from the
                // preset set in packages/types, resolved before it reaches
                // here. No duration is promised (we do not control the queue);
                // the closing line says resubmitting is easy, not that it is
                // quick.
                title: "पहचान की जाँच — एक बात",
                message: `⚠️ ${data.reason} कृपया दोबारा भेजिए — दोबारा भेजना आसान है। — हमारे पंडित जी`,
                smsMessage: `⚠️ ${data.reason} कृपया दोबारा भेजिए। — हमारे पंडित जी`
            };
        case 'REVIEW_RECEIVED':
            return {
                title: "New Review!",
                message: `⭐ Nayi ${data.rating}-star review mili! HPJ-${data.id}. App mein dekhein. -HmarePanditJi`,
                smsMessage: `⭐ Nayi ${data.rating}-star review mili! HPJ-${data.id}. App mein dekhein. -HmarePanditJi`
            };
        case 'REVIEW_REMINDER':
            return {
                title: "Rate your experience",
                message: `🙏 HPJ-${data.id} ke baare mein apna experience batayein! Review dein app mein. -HmarePanditJi`,
                smsMessage: `🙏 HPJ-${data.id} ke baare mein apna experience batayein! Review dein app mein. -HmarePanditJi`
            };
        default:
            return {
                title: "Notification",
                message: `You have a new notification!`,
                smsMessage: `You have a new notification!`
            };
    }
};
