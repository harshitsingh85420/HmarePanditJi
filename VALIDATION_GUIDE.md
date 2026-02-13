# Phase 1 MVP Validation Guide

This guide outlines how to verify the new features implemented during the Phase 1 audit.

## 1. Pandit Dashboard & Voice Features
**URL**: `http://localhost:3001` (Pandit App)

### Voice Help Button
- **What to check**: A floating speaker icon at the bottom-right of the screen.
- **Action**: Click the button to toggle "Voice Help Mode".
- **Verification**:
  - When active, the button turns orange/highlighted.
  - **Text-to-Speech**: Hover your mouse over any text (e.g., stats, bookings). The app should read it aloud.
  - **Voice Commands**: Click the microphone icon (when active) and say:
    - "Bookings" -> Navigates to /bookings
    - "Home" -> Navigates to Dashboard

### Booking Detail & Actions
- **Navigate to**: `http://localhost:3001/bookings/mock` (or a real booking ID)
- **Features**:
  - **Accept/Reject**: If status is `PENDING`, you should see large "Accept Booking" and "Reject" buttons.
  - **Status Updates**: If confirmed, you see "I'm On My Way", "I've Arrived", etc.
  - **Voice Commands**: With Voice Help active, try saying:
    - "Accept" -> Triggers accept action
    - "Reject" -> Triggers reject action
    - "On my way" -> Updates status

## 2. Customer Booking Wizard - Muhurat
**URL**: `http://localhost:3000/booking/new`

### Check Muhurat Feature
- **Step**: "Event Details" (Step 1)
- **Action**: Use the **"Check Muhurat"** button next to the time input.
- **Verification**:
  - A list of "Auspicious Timings" should appear below the inputs.
  - Click on any suggestion (e.g., "09:15 AM - 10:45 AM") to auto-fill the time input.

## 3. Admin Travel Queue
**URL**: `http://localhost:3002/travel-queue`

### Travel Management
- **Action**: Click on a booking in the table.
- **Verification**:
  - A side panel opens.
  - You can enter a PNR number and Notes.
  - Click "Mark Booked" to update the status to `BOOKED`.
  - Verify the status badge updates in the table.

## 4. Notifications (Backend)
- **Action**: Trigger a booking or status update.
- **Verification**: Check the terminal logs for `[SMS-STUB]` or `[WA-STUB]` messages, indicating the notification system is working (mock mode).

## 5. Troubleshooting
If you encounter build errors, ensure all dependencies are installed and run:
```bash
npx turbo run build --filter=@hmarepanditji/ui
npx turbo run build --filter=@hmarepanditji/pandit
npx turbo run build --filter=@hmarepanditji/web
```
