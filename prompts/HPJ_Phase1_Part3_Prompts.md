# HMAREPANDITJI — PHASE 1 PROMPT LIBRARY: PART 3
## Pandit Dashboard — Onboarding, Operations, Earnings & Growth
### Prompts 4.1 – 5.3 | Sprint 4 & Sprint 5 | Weeks 7–10

> **Architecture Reminder:** The Pandit dashboard lives at `apps/pandit/` (running on `localhost:3002`). It has NO login page of its own — all unauthenticated requests are redirected to `http://localhost:3000/login?redirect=pandit&next=<path>`. The app is designed **voice-first**: every form and critical action must have a Hindi voice narration option. Non-tech pandits are the primary users; assume low digital literacy for all UX decisions in this app.

---

## SPRINT 4: PANDIT ONBOARDING & CORE DASHBOARD (Weeks 7–8)

---

### PROMPT 4.1 — VOICE-FIRST PANDIT ONBOARDING WIZARD + VIDEO KYC

```
Build the complete Pandit onboarding experience in `apps/pandit/`. 
This is the first thing a new pandit sees after logging in for the 
first time. It is a multi-step wizard designed for non-tech users 
with low digital literacy. Every step must have a voice narration 
button that reads instructions aloud in Hindi using the Web Speech 
API (SpeechSynthesis).

════════════════════════════════════════════════════════════════
ROUTE & FILE STRUCTURE
════════════════════════════════════════════════════════════════

apps/pandit/app/onboarding/
├── page.tsx                   # Shell — loads wizard from URL step param
├── layout.tsx                 # Minimal layout (no sidebar, no header nav)
├── components/
│   ├── OnboardingWizard.tsx   # Step router (reads ?step=1..6)
│   ├── StepProgress.tsx       # Top progress bar with step labels
│   ├── VoiceButton.tsx        # 🔊 Hindi narration button (reusable)
│   ├── steps/
│   │   ├── Step1_BasicInfo.tsx
│   │   ├── Step2_PujaSpecializations.tsx
│   │   ├── Step3_TravelPreferences.tsx
│   │   ├── Step4_SamagriSetup.tsx
│   │   ├── Step5_VideoKYC.tsx
│   │   └── Step6_BankDetails.tsx
│   └── KYCVideoCapture.tsx    # Camera component for Step 5
hooks/
│   ├── useOnboarding.ts       # Wizard state + persistence
│   └── useVoiceNarration.ts   # Web Speech API wrapper

════════════════════════════════════════════════════════════════
WIZARD STATE TYPE (apps/pandit/types/onboarding.ts)
════════════════════════════════════════════════════════════════

export interface OnboardingState {
  currentStep: number;           // 1–6
  completedSteps: number[];
  basicInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    homeCity: string;
    homeState: string;
    experienceYears: number;
    bio: string;                 // 50–300 chars
    profilePhotoUrl: string;
    aadhaarNumber: string;       // Last 4 digits only in state — full sent directly to backend
    panNumber: string;
  };
  specializations: {
    pujaTypes: string[];         // From CONSTANTS.SUPPORTED_PUJA_TYPES
    languages: string[];         // From CONSTANTS.SUPPORTED_LANGUAGES
    gotra: string;               // Optional
    vedicDegree: string;         // e.g., "Shastri", "Acharya", "Vedaparayi"
    specialCertifications: string[];
  };
  travelPreferences: {
    willingToTravel: boolean;
    maxTravelDistanceKm: number; // 0 if not willing
    preferredTravelModes: TravelMode[];
    requiresAccommodation: boolean;
    requiresFoodArrangement: boolean;
    localServiceRadius: number;  // km for local bookings
    outOfDelhiAvailable: boolean;
  };
  samagriSetup: {
    canBringSamagri: boolean;
    packages: {
      packageType: PackageType;
      name: string;
      description: string;
      price: number;
      items: string[];
    }[];
  };
  kycStatus: {
    videoUploaded: boolean;
    videoUrl: string;
    aadhaarFrontUrl: string;
    aadhaarBackUrl: string;
    selfieWithAadhaarUrl: string;
    submittedAt: string;
  };
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: 'SAVINGS' | 'CURRENT';
  };
}

════════════════════════════════════════════════════════════════
VOICE NARRATION SYSTEM (VoiceButton.tsx + useVoiceNarration.ts)
════════════════════════════════════════════════════════════════

useVoiceNarration.ts:
```typescript
export function useVoiceNarration() {
  const speak = (text: string, lang: 'hi-IN' | 'en-IN' = 'hi-IN') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing narration
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;  // Slightly slower for clarity
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => window.speechSynthesis?.cancel();

  return { speak, stop };
}
```

VoiceButton.tsx:
Props: { text: string; label?: string; size?: 'sm' | 'md' }
- Renders a 🔊 button with label "सुनें" (Listen)
- Orange color, pill shape
- While speaking: shows animated sound wave icon + "बंद करें" (Stop)
- On click: calls speak(text) or stop() if already playing
- Size 'sm': icon only; size 'md' (default): icon + "सुनें" label

Each step MUST have VoiceButton at the top with the full Hindi 
instruction text for that step pre-written.

════════════════════════════════════════════════════════════════
STEP PROGRESS BAR (StepProgress.tsx)
════════════════════════════════════════════════════════════════

Props: { currentStep: number; completedSteps: number[] }

Display: 6 labeled steps in a horizontal bar.
Labels: 
  1: "जानकारी"     (Basic Info)
  2: "पूजा"         (Specializations)
  3: "यात्रा"        (Travel)
  4: "सामग्री"      (Samagri)
  5: "KYC"
  6: "बैंक"         (Bank)

Each step circle:
  - Completed: green filled circle with ✓
  - Current: amber filled circle with step number, pulsing ring
  - Future: gray empty circle with step number

Connecting lines between circles: green if both endpoints done, 
gray otherwise. Mobile: show only current step label. Desktop: 
show all labels.

════════════════════════════════════════════════════════════════
STEP 1 — BASIC INFORMATION
════════════════════════════════════════════════════════════════

File: steps/Step1_BasicInfo.tsx

Hindi voice text: "नमस्ते Pandit Ji! पहले हम आपकी बुनियादी जानकारी 
भरेंगे। अपना पूरा नाम, जन्म तारीख, और शहर का नाम भरें। यह जानकारी 
ग्राहकों को दिखाई नहीं देगी — सिर्फ हमारी टीम देखेगी।"

Layout:
  Header: "अपनी जानकारी भरें" (Fill Your Information)
  Subtitle: "Step 1 of 6 — Basic Details"
  VoiceButton (full Hindi text above)

  Profile Photo Upload:
    - Large circular avatar (120px) with camera icon overlay
    - "अपनी फोटो लगाएं" caption below
    - On click: opens file picker (accept: image/*)
    - On upload: POST /api/upload/profile-photo (multipart)
    - Preview uploaded photo in circle immediately
    - Show error if file > 5MB or not jpg/png

  Fields (all with Hindi labels + English placeholder):
    - पूरा नाम (Full Name): text input, required, min 3 chars
    - जन्म तारीख (Date of Birth): date picker, max today-18y
    - लिंग (Gender): 3 radio pill buttons: पुरुष / महिला / अन्य
    - गृह नगर (Home City): searchable dropdown using CONSTANTS.SUPPORTED_CITIES
    - गृह राज्य (Home State): text input, auto-populated when city selected
    - अनुभव (Experience): number input + "वर्ष" suffix, min 0, max 60
    - परिचय (About You): textarea, placeholder "अपने बारे में 2-3 वाक्य लिखें...",
      char counter shown (min 50 / max 300), shown to customers on profile
    - आधार नंबर (Aadhaar): 12-digit masked input (show ****-****-XXXX),
      validation: /^\d{12}$/
    - पैन नंबर (PAN): uppercase text, validation: /^[A-Z]{5}\d{4}[A-Z]$/

  Footer: [Save & Continue →] button
    - POST /api/pandit/onboarding/step1 with full basicInfo object
    - On success: navigate to ?step=2, update completedSteps

════════════════════════════════════════════════════════════════
STEP 2 — PUJA SPECIALIZATIONS
════════════════════════════════════════════════════════════════

File: steps/Step2_PujaSpecializations.tsx

Hindi voice text: "अब बताएं आप कौन-कौन सी पूजाएं करते हैं। जितनी 
ज़्यादा पूजाएं चुनेंगे, उतने ज़्यादा बुकिंग मिलेंगी। भाषाएं भी ज़रूर 
चुनें।"

Layout:
  पूजा के प्रकार (Puja Types):
    - Grid of checkboxes using all CONSTANTS.SUPPORTED_PUJA_TYPES
    - Each checkbox is a clickable pill/card (not plain checkbox)
    - Selected: amber filled pill; unselected: gray outlined pill
    - Min 1 must be selected

  भाषाएं (Languages you perform puja in):
    - Same pill-grid pattern using CONSTANTS.SUPPORTED_LANGUAGES
    - Min 1 (Hindi pre-selected by default)

  वैदिक उपाधि (Vedic Degree/Qualification):
    - Select dropdown: 
      Options: "कोई नहीं", "पंडित", "शास्त्री", "आचार्य", "महामहोपाध्याय",
               "वेदपारायणी", "ज्योतिषाचार्य"

  गोत्र (Gotra — Optional):
    - Text input, placeholder "e.g., Bharadwaj, Kashyap, Vashisht"
    - Note: "यह जानकारी देना ज़रूरी नहीं है"

  विशेष प्रमाणपत्र (Special Certifications — Optional):
    - Tag-input: type a cert name, press Enter to add
    - Max 5 certifications
    - Examples: "Kashi Vidyapeeth", "ISKCON Certified", etc.

  Footer: [← Back] [Save & Continue →]
    - POST /api/pandit/onboarding/step2 with specializations object

════════════════════════════════════════════════════════════════
STEP 3 — TRAVEL PREFERENCES
════════════════════════════════════════════════════════════════

File: steps/Step3_TravelPreferences.tsx

Hindi voice text: "क्या आप दूर-दूर जाकर पूजा करना चाहते हैं? 
अगर हाँ, तो बताएं आप कितनी दूर जा सकते हैं और किस तरह से 
यात्रा करना पसंद करेंगे।"

Layout:
  Big toggle at top: "क्या आप बाहर जाकर पूजा करना चाहते हैं?"
    YES / NO pill toggle (default YES)
    When NO: collapse all travel fields. Show message:
    "आप सिर्फ अपने शहर में सेवाएं देंगे।"

  When YES (expanded):
    अधिकतम दूरी (Max Travel Distance):
      - Slider: 50km to 3000km, step 50, with bubble showing current value
      - Presets below slider: [100 km] [500 km] [1000 km] [Pan-India]
      - Pan-India sets value to 3000

    पसंदीदा यात्रा का तरीका (Preferred Travel Modes):
      - Multi-select cards: 🚗 खुद की गाड़ी / 🚂 ट्रेन / ✈️ फ्लाइट / 🚕 टैक्सी / 🚌 बस
      - Can select multiple
      - Min 1 required if willingToTravel

    क्या रहने की व्यवस्था चाहिए? (Need Accommodation?):
      - Toggle YES/NO
      - If YES: "हम ग्राहक से आपके ठहरने का इंतज़ाम करवाएंगे"

    क्या खाने का भत्ता चाहिए? (Need Food Allowance?):
      - Toggle YES/NO
      - If YES: show note "₹1,000/दिन का भत्ता दिया जाएगा"

    स्थानीय सेवा क्षेत्र (Local Service Radius):
      - Slider: 5 to 50km, step 5
      - "आपके घर से कितनी दूर तक बिना अतिरिक्त खर्च के जाएंगे?"

    दिल्ली से बाहर (Out of Delhi available?):
      - Toggle: default YES if willingToTravel

  Footer: [← Back] [Save & Continue →]
    - POST /api/pandit/onboarding/step3 with travelPreferences object

════════════════════════════════════════════════════════════════
STEP 4 — SAMAGRI SETUP
════════════════════════════════════════════════════════════════

File: steps/Step4_SamagriSetup.tsx

Hindi voice text: "क्या आप पूजा सामग्री साथ लेकर आते हैं? अगर हाँ, 
तो अपने पैकेज का नाम और कीमत बताएं। इससे ग्राहकों को सब कुछ एक 
जगह मिल जाएगा।"

Layout:
  Toggle at top: "क्या आप सामग्री साथ लेकर आते हैं?"
    YES / NO (default YES)
    When NO: message "ग्राहक खुद सामग्री की व्यवस्था करेंगे।" 
    Skip rest of step, Save & Continue enabled.

  When YES:
    Package builder section:
    Header: "अपने सामग्री पैकेज बनाएं" (Build Your Samagri Packages)
    
    For each PackageType (BASIC, STANDARD, PREMIUM), show a card:
    
    Card layout (collapsible):
      Title: "बेसिक पैकेज" / "स्टैंडर्ड पैकेज" / "प्रीमियम पैकेज"
      Toggle: "यह पैकेज उपलब्ध है" (Is this package available?)
      
      When enabled:
        पैकेज का नाम (Package Name): text input, 
          placeholder "e.g., साधारण पूजा सामग्री"
        कीमत (Price): number input with "₹" prefix, min 100
        विवरण (Description): textarea, 50–200 chars
        सामग्री की सूची (Item List): tag-input for item names
          Min 3 items. Examples shown: "कुमकुम, चावल, अगरबत्ती, घी..."
          Add item button (+) — shows text input, press Enter or click Add

    NOTE: At least 1 package must be enabled to proceed.
    
    Preview card at bottom showing how package will look to customers.

  Footer: [← Back] [Save & Continue →]
    - POST /api/pandit/onboarding/step4 with samagriSetup object

════════════════════════════════════════════════════════════════
STEP 5 — VIDEO KYC & DOCUMENT UPLOAD
════════════════════════════════════════════════════════════════

File: steps/Step5_VideoKYC.tsx + KYCVideoCapture.tsx

Hindi voice text: "अब हमें आपकी पहचान वेरीफाई करनी है। इसके लिए 
एक छोटी वीडियो रिकॉर्ड करें जिसमें आप अपना आधार कार्ड पकड़कर 
अपना नाम और पूजा का अनुभव बोलें। यह वीडियो सिर्फ हमारी टीम देखेगी।"

Layout:
  Section 1 — Documents:
    "दस्तावेज़ अपलोड करें" (Upload Documents)
    
    3 upload zones (each with drag-drop or click):
    a) आधार कार्ड (सामने) — Aadhaar Front
       Accept: jpg, png, pdf. Max 5MB.
       On upload: POST /api/upload/kyc-document?type=AADHAAR_FRONT
       Show thumbnail after upload.

    b) आधार कार्ड (पीछे) — Aadhaar Back
       Same handling, type=AADHAAR_BACK

    c) आधार के साथ सेल्फी — Selfie with Aadhaar
       Accept: jpg, png. Max 5MB.
       type=AADHAAR_SELFIE
       Note below: "एक हाथ में आधार कार्ड और दूसरे हाथ से सेल्फी लें"

  Section 2 — Video Recording:
    KYCVideoCapture component:
    
    Step A — Instructions card:
      "📹 वीडियो में यह बोलें:"
      (Numbered list — show as styled cards)
      1. "मेरा नाम [अपना नाम] है"
      2. "मैं पिछले [X] वर्षों से पंडित हूं"
      3. "मैं [शहर] से हूं"
      4. "यह मेरा आधार कार्ड है" — (hold aadhaar to camera)
      "वीडियो 30 सेकंड से ज़्यादा नहीं होनी चाहिए।"
      
      [🎥 वीडियो रिकॉर्ड करें] button (orange, large)

    Step B (camera active):
      Browser camera feed (getUserMedia, video element)
      Recording timer countdown: 00:30 (auto-stop at 30s)
      [⏹ रिकॉर्डिंग बंद करें] red button
      
      Implementation:
      ```typescript
      const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, audio: true 
        });
        videoRef.current.srcObject = stream;
        const recorder = new MediaRecorder(stream, { 
          mimeType: 'video/webm' 
        });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          setVideoBlob(blob);
          setVideoUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach(t => t.stop());
        };
        recorder.start();
        setMediaRecorder(recorder);
        // Auto-stop at 30 seconds
        setTimeout(() => recorder.stop(), 30000);
      };
      ```

    Step C (review):
      <video> element with recorded video, controls
      [✅ यह ठीक है — अपलोड करें] green button
      [🔄 फिर से रिकॉर्ड करें] orange outline button
      
      On upload: POST /api/upload/kyc-video (multipart, blob)
      Show progress bar during upload.
      On success: setKycStatus({ videoUploaded: true, videoUrl })

  Section 3 — Submission Status:
    When all 3 docs + video uploaded:
    Green success card: 
      "✅ सभी दस्तावेज़ जमा हो गए!
       हमारी टीम 24-48 घंटों में वेरीफाई करेगी।
       वेरीफिकेशन के बाद आपको SMS आएगा।"

  Footer: [← Back] [Save & Continue →]
    - Enabled only when all 4 uploads done
    - POST /api/pandit/onboarding/step5 with kycStatus

════════════════════════════════════════════════════════════════
STEP 6 — BANK DETAILS
════════════════════════════════════════════════════════════════

File: steps/Step6_BankDetails.tsx

Hindi voice text: "आखिरी चरण! अपनी बैंक की जानकारी भरें जिससे 
हम आपकी कमाई सीधे आपके खाते में भेज सकें।"

Layout:
  Warning card (amber):
    "⚠️ ध्यान दें: सिर्फ अपनी खुद की बैंक अकाउंट की जानकारी भरें।
     किसी और का अकाउंट नंबर न दें।"

  Fields:
    - खाताधारक का नाम (Account Holder Name): text, required
      Note: "बैंक पासबुक पर जो नाम है वही भरें"
    - बैंक का नाम (Bank Name): searchable select
      Options: SBI, HDFC, ICICI, PNB, Axis, Kotak, BOB, Canara, Union, 
               Indian, UCO, IDBI, Yes Bank, IndusInd, Federal, Other
    - खाता नंबर (Account Number): number input, 9–18 digits
    - खाता नंबर दोबारा (Confirm Account Number): must match
    - IFSC कोड: text uppercase, validation /^[A-Z]{4}0[A-Z0-9]{6}$/
      Below field: clickable [?] that opens modal explaining what IFSC is
      with example image of passbook showing IFSC location
    - खाता प्रकार (Account Type): 
      Pill toggle: बचत खाता (Savings) | चालू खाता (Current)

  IFSC Explanation Modal (open on [?] click):
    "IFSC code क्या होता है?"
    "यह 11 अंकों का कोड होता है जो आपकी बैंक शाखा को पहचानता है।
     यह आपकी बैंक पासबुक के पहले पन्ने पर लिखा होता है।
     Example: SBIN0001234"
    Image placeholder (bank passbook highlighting IFSC area)

  Footer: [← Back] [🎉 प्रोफाइल पूरी करें] (Submit)
    - POST /api/pandit/onboarding/complete with bankDetails
    - On success: redirect to /dashboard with confetti + welcome toast

════════════════════════════════════════════════════════════════
ONBOARDING COMPLETION PAGE (/onboarding/complete)
════════════════════════════════════════════════════════════════

Show after Step 6 submission:

Large celebration animation (CSS confetti — no library):
"🙏 बधाई हो, [Pandit Name] जी!"

Status card:
  "आपकी प्रोफाइल जमा हो गई है"
  
  What happens next (timeline):
  ✅ प्रोफाइल जमा हुई
  ⏳ टीम दस्तावेज़ जांचेगी (24-48 घंटे)
  ⏳ वीडियो KYC जांच होगी
  ⏳ SMS आएगा वेरीफिकेशन के बाद
  ⏳ आप बुकिंग लेना शुरू कर सकते हैं

[डैशबोर्ड पर जाएं →] button → /dashboard

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS FOR ONBOARDING
════════════════════════════════════════════════════════════════

All routes: POST /api/pandit/onboarding/step[1-6]
Auth: PANDIT role required. Middleware: verifyToken + requireRole('PANDIT')

Step 1 — POST /api/pandit/onboarding/step1:
  Body: basicInfo object
  Logic:
    1. Update User.name from basicInfo.fullName
    2. Update PanditProfile: homeCity, homeState, experienceYears, bio
    3. Store profilePhotoUrl (already uploaded via /api/upload/profile-photo)
    4. Store Aadhaar number ENCRYPTED (use bcrypt or AES-256)
    5. Store PAN number
    6. Increment completedSteps to include 1
  Return: { success: true, step: 1 }

Step 2 — POST /api/pandit/onboarding/step2:
  Body: specializations
  Logic:
    1. Upsert PanditSpecialization records (delete old + insert new)
    2. Update PanditProfile.languages, vedicDegree, gotra, certifications
    3. Increment completedSteps
  Return: { success: true, step: 2 }

Step 3 — POST /api/pandit/onboarding/step3:
  Body: travelPreferences
  Logic:
    1. Update PanditProfile travel fields
    2. If willingToTravel=false: set maxTravelDistanceKm=0, 
       preferredTravelModes=[]
    3. Increment completedSteps
  Return: { success: true, step: 3 }

Step 4 — POST /api/pandit/onboarding/step4:
  Body: samagriSetup
  Logic:
    1. Delete old PanditSamagriPackage records for this pandit
    2. Insert new packages (only enabled ones)
    3. Update PanditProfile.canBringSamagri
    4. Increment completedSteps
  Return: { success: true, step: 4 }

Step 5 — POST /api/pandit/onboarding/step5:
  Body: kycStatus (document URLs already set via /api/upload/)
  Logic:
    1. Create KYCSubmission record with all URLs and timestamps
    2. Update PanditProfile.verificationStatus = 'DOCUMENTS_SUBMITTED'
    3. Log admin notification (mock): 
       "[KYC] New submission from Pandit ID: {panditId}"
    4. Increment completedSteps
  Return: { success: true, step: 5 }

Step 6 — POST /api/pandit/onboarding/complete:
  Body: bankDetails
  Logic:
    1. Validate account numbers match
    2. Store BankAccount record (account number encrypted)
    3. Update PanditProfile:
       - completedSteps: [1,2,3,4,5,6]
       - onboardingComplete: true
       - profileCompletionPercent: 80 (doc review pending)
    4. Update User.profileCompleted = true
    5. Send SMS (mock): "Namaste Pandit Ji! Profile submitted. 
       Verification in 24-48 hours. -HmarePanditJi"
  Return: { success: true, redirectTo: '/dashboard' }

FILE UPLOAD ENDPOINT — POST /api/upload/:type
  Auth: PANDIT role required
  Accepted types: profile-photo, kyc-document?type=..., kyc-video
  Logic:
    1. Use multer for multipart parsing
    2. Validate file size (5MB for images, 50MB for video)
    3. Generate unique filename: `{userId}_{type}_{timestamp}.{ext}`
    4. In Phase 1: save to local disk at /uploads/ 
       (use express.static to serve)
    5. Return { url: '/uploads/filename.ext' }
  Note: In production, replace with S3/Cloudinary upload.
```

---

### PROMPT 4.2 — PANDIT HOME DASHBOARD + BOOKING REQUEST NOTIFICATIONS

```
Build the Pandit Home Dashboard at apps/pandit/app/dashboard/page.tsx.
This is the main screen a pandit sees every day. It must be 
information-dense but visually simple enough for low-tech users.
Everything important must be visible without scrolling on desktop.
Mobile view must be finger-friendly (large tap targets, min 44px).

════════════════════════════════════════════════════════════════
ROUTE & FILE STRUCTURE
════════════════════════════════════════════════════════════════

apps/pandit/app/dashboard/
├── page.tsx
├── layout.tsx              # Sidebar nav + top header (shared across all pandit pages)
└── components/
    ├── DashboardLayout.tsx
    ├── SidebarNav.tsx
    ├── TopHeader.tsx
    ├── TodayCard.tsx
    ├── UpcomingBookingCard.tsx
    ├── EarningsSummaryWidget.tsx
    ├── NewBookingAlert.tsx      # Urgent notification card
    ├── ProfileCompletionBanner.tsx
    └── QuickStatsRow.tsx

════════════════════════════════════════════════════════════════
SIDEBAR NAVIGATION (SidebarNav.tsx)
════════════════════════════════════════════════════════════════

Props: { activePage: string }

Desktop (width ≥ 768px): Fixed left sidebar, 240px wide, dark brown 
(#2d1b00) background, white text.

Mobile: Bottom tab bar (5 items max), fixed at bottom.

Nav items:
  🏠  डैशबोर्ड          /dashboard
  📋  बुकिंग            /bookings
  📅  कैलेंडर           /calendar
  💰  कमाई             /earnings
  👤  प्रोफाइल          /profile

Active item: amber (#f09942) left border on desktop; amber dot on mobile.

At bottom of sidebar (desktop only):
  Pandit avatar + name + verification badge
  "वेरीफिकेशन: [status badge]" line
  [📞 सहायता] link → tel:+919XXXXXXXXX (HmarePanditJi support line)

════════════════════════════════════════════════════════════════
TOP HEADER (TopHeader.tsx)
════════════════════════════════════════════════════════════════

Left: HmarePanditJi logo (small) + "Pandit Portal" label
Right:
  🔔 Notification bell with red dot (unread count badge)
  Avatar + dropdown: { Profile, Settings, Logout }

Notification bell on click: opens NotificationsPanel (slide-in from right)
  - List of recent notifications (newest first)
  - Each item: icon, title, time ago, read/unread state
  - Types: new booking request, booking confirmed, payment received,
           verification status changed, system message
  - "सभी पढ़ें" (Mark all read) button
  - On click of notification: navigate to relevant page + mark read

════════════════════════════════════════════════════════════════
DASHBOARD PAGE LAYOUT
════════════════════════════════════════════════════════════════

Data to fetch on mount:
  GET /api/pandit/dashboard-summary
  Returns: {
    pandit: { name, profilePhotoUrl, verificationStatus, profileCompletionPercent },
    todaysBooking: Booking | null,
    upcomingBookings: Booking[],          // Next 5
    pendingRequests: BookingRequest[],    // Requests awaiting accept/decline
    earningsSummary: {
      thisMonthTotal: number,
      pendingPayout: number,
      lastPayoutDate: string,
      lastPayoutAmount: number,
    },
    stats: {
      totalBookingsAllTime: number,
      averageRating: number,
      completionRate: number,             // % of accepted bookings completed
      totalReviews: number,
    }
  }

────────────────────────────────────────────────────────────────
SECTION A — Urgent Alerts (shown ONLY when pending requests exist)
────────────────────────────────────────────────────────────────

NewBookingAlert.tsx:
  Shown at the VERY TOP when pendingRequests.length > 0.
  Pulsing amber border, eye-catching design.
  
  Header: "🔔 नई बुकिंग आई है!" + badge showing count
  
  For each pending request (show max 2, then "और देखें" link):
    Card with:
      - Event type: "विवाह पूजा" (large text)
      - Date: "15 मार्च 2026" + "कल" / "3 दिन बाद" relative
      - Location: "दिल्ली — सफदरजंग एन्क्लेव"
      - Customer name (first name only): "राजेश जी"
      - Estimated earning: "₹21,000 - ₹24,000" range
      - TIMER: "जवाब देने का समय: 04:32:18" (countdown)
        Timer starts from when request was sent, expires in 6 hours.
        When < 1 hour: show in red.
      - [✅ स्वीकार करें] [❌ मना करें] buttons (large, full-width on mobile)
        Both open confirmation modals before acting.

  ACCEPT MODAL:
    "क्या आप यह बुकिंग स्वीकार करना चाहते हैं?"
    Booking summary (event, date, location, amount)
    "स्वीकार करने के बाद ग्राहक को सूचना मिलेगी।"
    [हाँ, स्वीकार करें] [नहीं, रद्द करें]
    → POST /api/pandit/bookings/{bookingId}/accept

  DECLINE MODAL:
    "बुकिंग मना करने का कारण बताएं:"
    Radio options:
      - "उस दिन मेरी उपलब्धता नहीं है"
      - "यात्रा दूरी बहुत ज़्यादा है"
      - "यह पूजा का प्रकार मुझे नहीं आता"
      - "अन्य कारण" (shows text input)
    [मना करें] button
    → POST /api/pandit/bookings/{bookingId}/decline with { reason }

────────────────────────────────────────────────────────────────
SECTION B — Profile Completion Banner
────────────────────────────────────────────────────────────────

ProfileCompletionBanner.tsx:
  Show only when profileCompletionPercent < 100 AND 
  verificationStatus !== 'VERIFIED'

  Amber background, horizontal card:
    "आपकी प्रोफाइल [75%] पूरी है"
    Thin progress bar (amber fill)
    Pending item summary: "वेरीफिकेशन: दस्तावेज़ जांच में"
    [प्रोफाइल पूरी करें →] link

  Different messages per verificationStatus:
    PENDING: "दस्तावेज़ जमा करें और बुकिंग पाना शुरू करें"
    DOCUMENTS_SUBMITTED: "हमारी टीम दस्तावेज़ जांच रही है (24-48 घंटे)"
    VIDEO_KYC_DONE: "अंतिम वेरीफिकेशन हो रही है"
    VERIFIED: Don't show banner
    REJECTED: Red banner: "वेरीफिकेशन अस्वीकार — [कारण देखें]"

────────────────────────────────────────────────────────────────
SECTION C — Quick Stats Row (QuickStatsRow.tsx)
────────────────────────────────────────────────────────────────

4 stat cards in a row (2×2 grid on mobile):
  1. इस महीने की कमाई: "₹32,500" (amber value)
  2. कुल बुकिंग: "47" (total all time)
  3. औसत रेटिंग: "4.8 ★" (gold stars)
  4. पूर्णता दर: "94%" (completion rate)

Each card: white card, small label above, large number, subtle icon.

────────────────────────────────────────────────────────────────
SECTION D — Today's Booking (TodayCard.tsx)
────────────────────────────────────────────────────────────────

Show only when todaysBooking is not null.

Large highlighted card (amber left border):
  "🗓️ आज की पूजा"
  
  Event: "सत्यनारायण पूजा" (large)
  Time: "सुबह 10:00 बजे"
  Customer: "विनोद शर्मा जी" + masked phone: "+91 98765-XXXXX"
    Note: "पूजा शुरू होने के 30 मिनट पहले नंबर दिखेगा"
    (Reveal timer: countdown to 30 min before event)
  Address: "B-42, Saket, New Delhi" [📍 Maps खोलें] link
  
  Action buttons:
    If status = TRAVEL_BOOKED or PANDIT_EN_ROUTE:
      [📍 लाइव ट्रैकिंग शुरू करें] → /bookings/{id}/live-tracking
    If status = CONFIRMED:
      [🗺️ रास्ता देखें] → opens Google Maps with address
    If status = PANDIT_ARRIVED or PUJA_IN_PROGRESS:
      [✅ पूजा पूरी करें] → confirmation modal → POST /api/pandit/bookings/{id}/complete

  If todaysBooking is null:
    Light gray card: "आज कोई पूजा नहीं है। आराम करें! 🙏"

────────────────────────────────────────────────────────────────
SECTION E — Upcoming Bookings
────────────────────────────────────────────────────────────────

"आगामी बुकिंग" header + [सभी देखें →] link to /bookings

List of up to 5 upcoming bookings (compact card each):
  - Event type + date (relative: "2 दिन बाद", "अगले सप्ताह")
  - Location city
  - Amount: "₹X,XXX"
  - Status badge (using Badge component from packages/ui)
  - [विवरण देखें] → /bookings/{id}

────────────────────────────────────────────────────────────────
SECTION F — Earnings Summary Widget
────────────────────────────────────────────────────────────────

EarningsSummaryWidget.tsx:
  Two panels side-by-side (stacked on mobile):
  
  Left panel: "इस महीने" (This month)
    Large amount: "₹32,500" (amber)
    Subline: "5 बुकिंग से"
    Progress bar vs last month: "+12% पिछले महीने से"
  
  Right panel: "पेंडिंग पेमेंट" (Pending Payout)
    Amount in gray/neutral: "₹8,200"
    Subline: "2 बुकिंग का बाकी है"
    [विवरण देखें →] → /earnings

════════════════════════════════════════════════════════════════
REAL-TIME BOOKING NOTIFICATIONS (WebSocket / Polling)
════════════════════════════════════════════════════════════════

Since Phase 1 uses simple infrastructure, implement polling 
(not WebSocket) for new booking alerts.

Create useBookingPolling.ts hook:
```typescript
export function useBookingPolling(intervalMs = 30000) {
  const [pendingRequests, setPendingRequests] = useState<BookingRequest[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const previousCount = useRef(0);

  useEffect(() => {
    const poll = async () => {
      const res = await fetch('/api/pandit/pending-requests', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.requests.length > previousCount.current) {
        setHasNew(true);
        // Play notification sound
        new Audio('/sounds/booking-alert.mp3').play().catch(() => {});
        // Browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification('नई बुकिंग!', {
            body: `${data.requests[0].eventType} — ${data.requests[0].location}`,
            icon: '/icons/logo-192.png'
          });
        }
      }
      previousCount.current = data.requests.length;
      setPendingRequests(data.requests);
    };

    poll(); // Immediate first poll
    const interval = setInterval(poll, intervalMs);
    
    // Request notification permission on first load
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [intervalMs]);

  return { pendingRequests, hasNew, clearNew: () => setHasNew(false) };
}
```

Add /sounds/booking-alert.mp3 (short bell sound, base64 encoded inline
or reference a static file in apps/pandit/public/).

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS FOR DASHBOARD
════════════════════════════════════════════════════════════════

GET /api/pandit/dashboard-summary (PANDIT auth required)
Logic:
  1. Find pandit profile for req.user.id
  2. Find today's booking: Booking where panditId=panditId AND 
     eventDate=today AND status NOT IN [CANCELLED, REFUNDED]
  3. Find upcoming: Booking where eventDate > today, next 5, 
     ordered by eventDate
  4. Find pending requests: Booking where status=PANDIT_REQUESTED 
     AND panditId=panditId AND createdAt > (now - 6h)
  5. Aggregate this month's earnings from Booking where 
     paymentStatus=CAPTURED AND eventDate in current month
  6. Return assembled dashboard object

POST /api/pandit/bookings/:bookingId/accept (PANDIT auth)
Logic:
  1. Verify booking.panditId = req.user.panditProfile.id
  2. Verify booking.status = 'PANDIT_REQUESTED'
  3. Update booking.status = 'CONFIRMED'
  4. Create BookingStatusUpdate: PANDIT_REQUESTED → CONFIRMED
  5. Log SMS to console:
     [SMS to Customer]: "Booking HPJ-XXXX confirmed! Pandit [name] 
     will arrive on [date]. -HmarePanditJi"
  6. Return { success: true }

POST /api/pandit/bookings/:bookingId/decline (PANDIT auth)
Body: { reason: string }
Logic:
  1. Verify booking.panditId = req.user.panditProfile.id
  2. Verify booking.status = 'PANDIT_REQUESTED'
  3. Update booking.status = 'CANCELLATION_REQUESTED'
  4. Store decline reason in BookingStatusUpdate notes
  5. Admin notification: "[ADMIN] Pandit declined booking — 
     needs reassignment"
  6. Return { success: true }

POST /api/pandit/bookings/:bookingId/complete (PANDIT auth)
Logic:
  1. Verify booking.status IN ['PANDIT_ARRIVED','PUJA_IN_PROGRESS']
  2. Update booking.status = 'COMPLETED'
  3. Update booking.completedAt = now()
  4. Calculate final payout = panditPayout field (already set at payment)
  5. Create Payout record: { bookingId, panditId, amount, status: PENDING }
  6. Log: "[PAYOUT] Queued payout of ₹X for Pandit Y, Booking Z"
  7. Log SMS: "[SMS to Customer] Puja completed! Rate your experience..."
  8. Return { success: true }
```

---

### PROMPT 4.3 — DETAILED BOOKING VIEW + JOURNEY TRACKING + LIVE MODE

```
Build three interconnected screens for the pandit:
1. Detailed Booking Request page — full info about a single booking
2. Travel Itinerary view — multi-modal journey plan
3. Live Journey Tracking — "I'm on the way" mode with status updates

════════════════════════════════════════════════════════════════
ROUTE STRUCTURE
════════════════════════════════════════════════════════════════

apps/pandit/app/bookings/
├── page.tsx                      # All bookings list
├── [bookingId]/
│   ├── page.tsx                  # Detailed booking view
│   ├── itinerary/
│   │   └── page.tsx              # Travel itinerary
│   └── live-tracking/
│       └── page.tsx              # Live journey mode

════════════════════════════════════════════════════════════════
BOOKINGS LIST PAGE — /bookings
════════════════════════════════════════════════════════════════

apps/pandit/app/bookings/page.tsx:

Filter tabs at top (horizontal scrollable):
  [सभी] [पेंडिंग] [कन्फर्म] [यात्रा बुक] [पूरी हुई] [रद्द]

Each tab maps to BookingStatus values:
  सभी: no filter
  पेंडिंग: PANDIT_REQUESTED
  कन्फर्म: CONFIRMED, TRAVEL_BOOKED, PANDIT_EN_ROUTE, 
             PANDIT_ARRIVED, PUJA_IN_PROGRESS
  पूरी हुई: COMPLETED
  रद्द: CANCELLED, REFUNDED

Booking list item (compact card):
  - Event type (large) + Status badge
  - Date + Location
  - Customer name (first name)
  - Earned/Expected amount
  - Arrow → goes to /bookings/{id}

Pagination: 10 per page, load more button.

Fetch: GET /api/pandit/bookings?status=&page=&limit=10

════════════════════════════════════════════════════════════════
DETAILED BOOKING REQUEST PAGE — /bookings/[bookingId]
════════════════════════════════════════════════════════════════

apps/pandit/app/bookings/[bookingId]/page.tsx

Fetch: GET /api/pandit/bookings/:bookingId

VoiceButton at top with Hindi summary of the booking:
  "यह बुकिंग [नाम] के घर [शहर] में [तारीख] को [पूजा] के लिए है।
   कुल आमदनी [राशि] रुपये होगी।"

════════ SECTION 1: Event Details ════════
  Card — "पूजा की जानकारी":
    - पूजा का नाम: "विवाह पूजा"
    - तारीख: "शनिवार, 15 मार्च 2026"
    - समय: "सुबह 10:00 बजे"
    - अवधि: "2 दिन"
    - पता: Full address (revealed only after booking confirmed)
      Pre-confirmation: "सफदरजंग एन्क्लेव, नई दिल्ली" (area only)
    - विशेष निर्देश: Customer's special notes if any

════════ SECTION 2: Customer Information ════════
  Card — "ग्राहक की जानकारी":
    - नाम: "राजेश जी" (first name only before confirmation)
    - गोत्र: "Bharadwaj" (if provided)
    - परिवार की जानकारी: from booking (familyTree if set)
    - ग्राहक की भाषा: "Hindi"
    - फोन नंबर: Masked until 30min before event
      Show countdown timer: "नंबर [2:30:45] में दिखेगा"

════════ SECTION 3: Samagri / Requirements ════════
  Card — "सामग्री की जानकारी":
    samagriPreference display:
      PANDIT_BRINGS → "आप सामग्री लेकर आएंगे"
        Show selected package: "स्टैंडर्ड पैकेज — ₹5,500"
        Item list expandable
      CUSTOMER_ARRANGES → "ग्राहक खुद व्यवस्था करेगा"
        Custom list provided by customer (if any)
      NEED_HELP → "हमारी टीम सामग्री व्यवस्था में मदद करेगी"

════════ SECTION 4: Travel Information ════════
  Card — "यात्रा की जानकारी" (shown only if outstation):
    - आपका शहर: "Haridwar"
    - पूजा का शहर: "Delhi"
    - दूरी: "~230 km"
    - चुना गया तरीका: "ट्रेन (Shatabdi Express)" OR "Admin arranging"
    - यात्रा तारीख: "14 मार्च 2026"
    - यात्रा लागत: "₹1,200" (Pandit sees this as fully reimbursed)
    - खाने का भत्ता: "₹3,000 (3 दिन × ₹1,000)"
    - ठहरने की व्यवस्था: "ग्राहक करेंगे" OR "होटल [name, address]"
    
    If travelStatus = BOOKED:
      [🗺️ यात्रा प्लान देखें →] → /bookings/{id}/itinerary

════════ SECTION 5: Earnings Breakdown ════════
  Card — "आपकी कमाई":
    Use PriceBreakdown component but show ONLY pandit-relevant rows:
    - दक्षिणा: ₹17,850  (dakshina minus platform fee)
    - यात्रा खर्च: ₹1,200  (full reimbursement)
    - खाना भत्ता: ₹3,000
    - सामग्री: ₹5,500
    ──────────────
    कुल आमदनी: ₹27,550
    
    Note: "(प्लेटफॉर्म की 15% सेवा शुल्क काटकर)"
    Note: "भुगतान पूजा पूरी होने के 24 घंटे में होगा"

════════ SECTION 6: Status Timeline ════════
  Use StatusTimeline component from packages/ui
  Show all status steps relevant to this booking.

════════ SECTION 7: Action Buttons ════════
  Dynamic based on booking.status:

  PANDIT_REQUESTED (pending decision — only if not expired):
    [✅ बुकिंग स्वीकार करें] [❌ मना करें]
    Timer: "X घंटे X मिनट बाकी"

  CONFIRMED (accepted, travel not yet booked):
    [📅 कैलेंडर में जोड़ें] (adds to pandit's Google Calendar)
    [💬 सहायता से बात करें] (helpline link)

  TRAVEL_BOOKED:
    [🗺️ यात्रा प्लान देखें] → /bookings/{id}/itinerary

  PANDIT_EN_ROUTE (pandit has started journey):
    [📍 लाइव मोड] → /bookings/{id}/live-tracking
    [✅ मैं पहुँच गया] → confirm arrival → POST /api/pandit/bookings/{id}/arrived

  PANDIT_ARRIVED:
    [🙏 पूजा शुरू करें] → POST /api/pandit/bookings/{id}/start-puja
    [📍 लाइव मोड] → /bookings/{id}/live-tracking

  PUJA_IN_PROGRESS:
    [✅ पूजा पूरी हुई] → POST /api/pandit/bookings/{id}/complete
    (opens completion confirmation modal)

  COMPLETED:
    [⭐ रेटिंग देखें] (if review exists)
    [💰 भुगतान देखें] → /earnings

════════════════════════════════════════════════════════════════
TRAVEL ITINERARY PAGE — /bookings/[bookingId]/itinerary
════════════════════════════════════════════════════════════════

apps/pandit/app/bookings/[bookingId]/itinerary/page.tsx

Fetch: GET /api/pandit/bookings/:bookingId/itinerary

VoiceButton with full Hindi itinerary narration:
  "आपकी यात्रा का प्लान: [date] को [departure city] से [arrival city] 
   जाना है। [travel mode] से यात्रा करनी है। 
   [departure details]. [arrival details]."

Journey Header:
  [Haridwar] →→→→→ [New Delhi]
  Arrow visualization with distance in center

OUTBOUND JOURNEY card:
  Header: "जाते समय — 14 मार्च 2026"
  
  Per leg of journey (one or more legs):
    Leg card:
      - Mode icon (🚂🚕✈️🚗) + Mode name
      - From: "Haridwar Railway Station"
      - To: "New Delhi Railway Station"
      - Departure: "07:15 AM"
      - Arrival: "11:30 AM"
      - Train/Flight number: "12055 Dehradun Shatabdi Express"
      - PNR/booking reference: "4521839203" (if booked by admin)
      - Class: "CC (Chair Car)"
      - Note from admin: "Platform 3 — arrive 20 min early"

  [Google Maps से निर्देश लें] button for each leg origin

ACCOMMODATION card (if booked):
  "🏨 ठहरने की व्यवस्था"
  Hotel name, address, check-in/out dates, confirmation number
  [📍 Maps में देखें] button

AT PUJA LOCATION card:
  - Arrival Date: "14 March (Evening)"
  - Puja Date: "15 March, 10:00 AM"
  - Full address: "[address] — [area], [city]"
  - Customer contact (shown 24h before event): "+91 XXXXXX"

RETURN JOURNEY card:
  Header: "वापसी — 17 मार्च 2026"
  Same leg card structure as outbound.

EXPENSE SUMMARY:
  "आपके सभी खर्चे वापस मिलेंगे:"
  - Train (to): ₹850
  - Train (return): ₹850
  - Local cab: ₹400
  ─────────────────
  कुल यात्रा खर्च: ₹2,100
  नोट: "पूजा पूरी होने के 24 घंटे में आपके खाते में"

[⬇️ PDF डाउनलोड करें] button → /api/pandit/bookings/{id}/itinerary.pdf

════════════════════════════════════════════════════════════════
LIVE JOURNEY TRACKING PAGE — /bookings/[bookingId]/live-tracking
════════════════════════════════════════════════════════════════

apps/pandit/app/bookings/[bookingId]/live-tracking/page.tsx

This is a minimal, large-button interface for use while traveling.
The pandit should be able to operate this one-handed on mobile.

Design: Dark background (#1a1a2e), amber text/buttons.
Font size: 18px minimum everywhere.

TOP: Booking summary strip
  "सत्यनारायण पूजा — राजेश जी के यहाँ" (small text)
  "15 मार्च, 10:00 AM" (date/time)

CURRENT STATUS DISPLAY (huge, center):
  Large status badge showing current status with icon:
  
  TRAVEL_BOOKED:
    🗺️ "यात्रा के लिए तैयार हों"
    Button (full-width, amber, 64px tall):
    "🚀 यात्रा शुरू कर दी" 
    → POST /api/pandit/bookings/{id}/start-journey
    → status becomes PANDIT_EN_ROUTE

  PANDIT_EN_ROUTE:
    🚂 "रास्ते में हैं..."
    "ग्राहक को आपकी लाइव लोकेशन मिल रही है"
    ETA input: "अनुमानित पहुँचने का समय" + [Update] button
    Big button: "📍 मैं पहुँच गया"
    → POST /api/pandit/bookings/{id}/arrived
    → status becomes PANDIT_ARRIVED

  PANDIT_ARRIVED:
    🙏 "पहुँच गए — पूजा शुरू करें"
    Time shown: "आप [HH:MM] पर पहुँचे"
    Big button: "🕉️ पूजा शुरू करें"
    → POST /api/pandit/bookings/{id}/start-puja
    → status becomes PUJA_IN_PROGRESS

  PUJA_IN_PROGRESS:
    🔥 "पूजा जारी है"
    Timer: how long since puja started (counting up)
    "जब पूजा खत्म हो जाए तो नीचे दबाएं:"
    Big red button: "✅ पूजा पूरी हुई"
    → opens completion modal → POST /api/pandit/bookings/{id}/complete

COMPLETION MODAL:
  "पूजा पूरी हुई — बधाई हो! 🙏"
  "ग्राहक को रेटिंग के लिए SMS जाएगा।"
  "आपका भुगतान ₹X,XXX 24 घंटे में होगा।"
  [बंद करें] → redirects to /bookings/{id}

BOTTOM SECTION (always visible):
  "मदद चाहिए?" → tel:+91XXXXXXXXX (support line)
  "समस्या रिपोर्ट करें" → opens text modal → POST /api/support/issue

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS
════════════════════════════════════════════════════════════════

GET /api/pandit/bookings (PANDIT auth)
  Query: ?status=&page=1&limit=10
  Returns: paginated list of pandit's bookings

GET /api/pandit/bookings/:bookingId (PANDIT auth)
  Verify: booking.panditId = authenticated pandit's profile id
  Returns: full booking with related customer (masked), 
           travel info, samagri, pricing breakdown, status history

GET /api/pandit/bookings/:bookingId/itinerary (PANDIT auth)
  Returns: structured itinerary object with all legs, 
           accommodation, expense summary

Journey status transitions (PANDIT auth, own booking only):

POST /api/pandit/bookings/:bookingId/start-journey
  TRAVEL_BOOKED → PANDIT_EN_ROUTE
  Update: travelStatus = IN_TRANSIT, journeyStartedAt = now()
  SMS to customer: "Pandit Ji is on the way! Estimated arrival: [eta]"

POST /api/pandit/bookings/:bookingId/arrived
  PANDIT_EN_ROUTE → PANDIT_ARRIVED
  Update: travelStatus = ARRIVED, arrivedAt = now()
  SMS to customer: "Pandit Ji has arrived! 🙏"
  Reveal full phone number to pandit (for 24h after arrival)

POST /api/pandit/bookings/:bookingId/start-puja
  PANDIT_ARRIVED → PUJA_IN_PROGRESS
  Update: pujaStartedAt = now()

POST /api/pandit/bookings/:bookingId/complete
  PUJA_IN_PROGRESS → COMPLETED
  Update: completedAt = now()
  Create: Payout record { panditId, bookingId, amount: panditPayout, status: PENDING }
  SMS to customer: "Puja completed! Please rate your experience: [link]"
  Log: "[PAYOUT QUEUE] ₹X for Pandit Y — booking Z"
```

---

## SPRINT 5: PANDIT OPERATIONS, EARNINGS & GROWTH (Weeks 9–10)

---

### PROMPT 5.1 — WORK CALENDAR + BLACKOUT DATE MANAGEMENT

```
Build the Pandit Work Calendar at apps/pandit/app/calendar/.
This is how a pandit manages their availability. The calendar must 
show booked dates clearly and let the pandit block personal leave 
dates. It is critical for accurate availability display to customers.

════════════════════════════════════════════════════════════════
ROUTE STRUCTURE
════════════════════════════════════════════════════════════════

apps/pandit/app/calendar/
├── page.tsx                   # Main calendar view
└── components/
    ├── MonthCalendar.tsx      # Custom month grid calendar
    ├── DayDetailPanel.tsx     # Slide-in panel for selected day
    ├── BlockDateModal.tsx     # Modal to block a date/range
    ├── LegendBar.tsx          # Color key
    └── UpcomingList.tsx       # Side panel: next 10 events

════════════════════════════════════════════════════════════════
PAGE LAYOUT
════════════════════════════════════════════════════════════════

Two-column on desktop (calendar left 65%, upcoming right 35%).
Single column on mobile (calendar on top, upcoming below).

Top controls:
  ← [March 2026] → (month navigator, prev/next buttons)
  [आज] (Today) button
  [+ छुट्टी जोड़ें] (Add Leave) amber button → opens BlockDateModal

VoiceButton: "आपका कैलेंडर। [month] में [N] पूजाएं बुक हैं। 
  अगली पूजा [date] को [city] में है।"

════════════════════════════════════════════════════════════════
MONTH CALENDAR COMPONENT (MonthCalendar.tsx)
════════════════════════════════════════════════════════════════

Build a CUSTOM calendar grid (do NOT use any calendar library).

Grid: 7 columns (Sun–Sat), 4-6 rows of days.
Each day cell (min-height 80px on desktop, 56px on mobile):

Color coding:
  White/normal: available
  Amber (#fde9c3) fill: has a booking on this date
  Red (#fee2e2) fill: blocked/blackout date
  Gray (#f3f4f6): past dates
  Dark amber border: today

Day cell contents:
  - Day number (top-left, small)
  - If booking exists: colored dot/badge 
    + first 2 words of event type (e.g., "विवाह पूजा") truncated
    + small amber badge with time "10:00 AM"
  - If blocked: 🔴 "छुट्टी" label
  - If multiple events same day: show first + "+X और"

Day cell click: opens DayDetailPanel (slide-in from right on desktop,
slide-up sheet on mobile) for that date.

LegendBar.tsx (below calendar):
  ■ बुकिंग  ■ ब्लॉक  □ उपलब्ध  ▣ आज

════════════════════════════════════════════════════════════════
DAY DETAIL PANEL (DayDetailPanel.tsx)
════════════════════════════════════════════════════════════════

Props: { date: string; bookings: Booking[]; blockedDate: BlockedDate | null; onClose; onBlock; onUnblock }

Header: "[Day, Date Month YEAR]" + close button (×)

If has bookings:
  Each booking:
    - Event type
    - Customer name (first name)
    - Time
    - Status badge
    - [विवरण देखें →] link

If blocked:
  Red card: "🔴 यह दिन ब्लॉक है"
  Reason: [reason shown]
  [🗑️ ब्लॉक हटाएं] button → POST /api/pandit/blackout-dates/{id}/remove

If neither:
  "यह दिन उपलब्ध है"
  [+ इस दिन को ब्लॉक करें] link → pre-fills BlockDateModal with this date

════════════════════════════════════════════════════════════════
BLOCK DATE MODAL (BlockDateModal.tsx)
════════════════════════════════════════════════════════════════

Props: { isOpen; onClose; prefillDate?: string }

Title: "छुट्टी जोड़ें" (Add Leave / Blackout Date)

Fields:
  - छुट्टी का प्रकार (Type):
    Radio pills:
      - एक दिन (Single Day)
      - कई दिन (Date Range)
      - साप्ताहिक (Weekly recurring — not Phase 1, show "Coming soon" tooltip)
  
  - If एक दिन:
    Date picker: default today or prefillDate
  
  - If कई दिन:
    Start date + End date pickers
    Show: "X दिन ब्लॉक होंगे"
    Warning if range > 30 days: "क्या आप इतने लंबे समय के लिए छुट्टी
    लेना चाहते हैं? आप इस दौरान कोई बुकिंग नहीं ले पाएंगे।"
  
  - कारण (Reason — optional):
    Select: "शादी / पारिवारिक कार्यक्रम" | "बीमारी" | "तीर्थ यात्रा" | 
            "व्यक्तिगत कारण" | "अन्य"
  
  - Conflict check:
    If selected dates have existing confirmed bookings:
    Red warning: "⚠️ [date] पर आपकी पहले से बुकिंग है — 
    इसे ब्लॉक नहीं किया जा सकता।"
    Disable submit button in this case.

  [रद्द करें] [छुट्टी जोड़ें ✓] buttons

════════════════════════════════════════════════════════════════
UPCOMING EVENTS SIDE PANEL (UpcomingList.tsx)
════════════════════════════════════════════════════════════════

Title: "आगामी कार्यक्रम" (Upcoming Events)

List of next 10 events (bookings + blocked dates), sorted by date:
  Booking item: amber left border + event name + date + city + time
  Blocked item: red left border + "छुट्टी" + date range + reason

Each item clickable → highlights date in calendar + opens DayDetailPanel.

════════════════════════════════════════════════════════════════
DATA FETCHING
════════════════════════════════════════════════════════════════

On month change, fetch:
  GET /api/pandit/calendar?month=2026-03
  Returns: {
    bookings: [{
      id, eventType, eventDate, eventTimeSlot, 
      customerCity, status
    }],
    blockedDates: [{
      id, startDate, endDate, reason, type
    }]
  }

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS
════════════════════════════════════════════════════════════════

GET /api/pandit/calendar?month=YYYY-MM (PANDIT auth)
  Logic:
    1. Parse month → first and last day of that month
    2. Fetch Booking records where panditId=X AND 
       eventDate BETWEEN firstDay AND lastDay AND 
       status NOT IN [CANCELLED, REFUNDED]
    3. Fetch BlackoutDate records where panditId=X AND 
       startDate <= lastDay AND endDate >= firstDay
    4. Return both arrays

POST /api/pandit/blackout-dates (PANDIT auth)
  Body: { startDate, endDate, reason, type: 'SINGLE'|'RANGE' }
  Logic:
    1. If endDate not provided: endDate = startDate
    2. Check for conflicts: any CONFIRMED bookings in date range?
    3. If conflict: return 409 { error: 'BOOKING_CONFLICT', conflictingDates: [] }
    4. Create BlackoutDate record(s): 
       For range: one record with startDate and endDate
    5. Return { success: true, blockedDates: [created records] }

DELETE /api/pandit/blackout-dates/:id (PANDIT auth)
  Logic:
    1. Verify blackoutDate.panditId = req.user's panditId
    2. Delete record
    3. Return { success: true }
```

---

### PROMPT 5.2 — EARNINGS, WALLET & PAYOUT VIEWS

```
Build the complete Earnings section at apps/pandit/app/earnings/.
Pandits need simple, trustworthy financial information. Every number 
must be explainable. No jargon. Hindi labels throughout.

════════════════════════════════════════════════════════════════
ROUTE STRUCTURE
════════════════════════════════════════════════════════════════

apps/pandit/app/earnings/
├── page.tsx                      # Earnings overview
├── [bookingId]/
│   └── page.tsx                  # Per-booking payout breakdown
└── components/
    ├── EarningsHeader.tsx         # Monthly summary + bank info
    ├── EarningsChart.tsx          # Bar chart (last 6 months)
    ├── PayoutHistoryList.tsx      # Completed payouts
    ├── PendingPayoutCard.tsx      # Upcoming payouts
    ├── BookingEarningRow.tsx      # Single row in history
    └── PostPujaBreakdown.tsx      # Per-puja earnings detail

════════════════════════════════════════════════════════════════
EARNINGS OVERVIEW PAGE (/earnings)
════════════════════════════════════════════════════════════════

Fetch: GET /api/pandit/earnings/summary

VoiceButton: "इस महीने आपने [N] पूजाओं से कुल [₹X] कमाए। 
  [₹Y] आपके खाते में आ चुके हैं। [₹Z] बाकी हैं।"

────────────────────────────────────────────────────────────────
SECTION A — Monthly Summary Header (EarningsHeader.tsx)
────────────────────────────────────────────────────────────────

Period selector: [जनवरी 2026 ▾] dropdown (last 12 months)

Three big stat boxes in a row:
  1. कुल कमाई (Total Earned)
     "₹48,250" (amber, large)
     "8 बुकिंग से"

  2. भुगतान हो गया (Paid Out)
     "₹40,000" (green)
     "Bank ••• 4521 को"

  3. बाकी है (Pending)
     "₹8,250" (amber/orange)
     "2 बुकिंग का"

Bank account display:
  Small card below: "भुगतान जाएगा:"
  Bank logo (text) + "SBI ••••4521" + "बचत खाता"
  [बदलें] link → /profile/bank-details

────────────────────────────────────────────────────────────────
SECTION B — Earnings Chart (EarningsChart.tsx)
────────────────────────────────────────────────────────────────

Bar chart — last 6 months of monthly total earnings.
Do NOT use any charting library — build with pure CSS/SVG.

Simple SVG bar chart:
  - Y axis: ₹0 to max, 5 gridlines
  - X axis: month abbreviations (जन, फर, मार, अप्र, मई, जून)
  - Bars: amber fill, hover shows exact value
  - Current month: darker amber outline
  - Animate bars in on mount (CSS transition: height 0.4s ease)

Below chart: "पिछले 6 महीनों की औसत कमाई: ₹X per month"

────────────────────────────────────────────────────────────────
SECTION C — Pending Payouts (PendingPayoutCard.tsx)
────────────────────────────────────────────────────────────────

Show only when pending payouts exist.
Orange/amber background card:
  "⏳ भुगतान आने वाले हैं"
  
  For each pending payout:
    - Event name + date completed
    - Amount: "₹X,XXX"
    - Expected by: "24 घंटे में" or specific date
    - Status badge: PENDING / PROCESSING

────────────────────────────────────────────────────────────────
SECTION D — Booking Earnings History
────────────────────────────────────────────────────────────────

"बुकिंग वार कमाई" header

Table/list with per-booking rows (BookingEarningRow.tsx):
  Each row:
    - Booking number: "HPJ-2026-00142" (small, gray)
    - Event: "विवाह पूजा" (bold)
    - Date: "15 मार्च 2026"
    - Customer city: "Delhi"
    - Gross amount: "₹27,550" (right aligned)
    - Payout status: Badge (PENDING / PROCESSING / COMPLETED)
    - [विवरण →] → /earnings/{bookingId}

Clickable rows: navigates to per-booking breakdown.
Pagination: 10 per page.

════════════════════════════════════════════════════════════════
PER-BOOKING PAYOUT BREAKDOWN (/earnings/[bookingId])
════════════════════════════════════════════════════════════════

File: app/earnings/[bookingId]/page.tsx
Component: PostPujaBreakdown.tsx

VoiceButton: "इस पूजा में आपने [₹X] कमाए। 
  [date] को [₹Y] आपके खाते में भेजे जाएंगे।"

Booking summary card at top:
  HPJ-2026-00142 | विवाह पूजा | 15 मार्च 2026
  Status: COMPLETED ✓

Pandit receives:
  ═══════════════════════════════════════
  दक्षिणा                 ₹21,000
  (-) प्लेटफॉर्म शुल्क (15%)  - ₹3,150
  आपकी शुद्ध दक्षिणा:      ₹17,850
  ───────────────────────────────────────
  सामग्री पैकेज            ₹5,500
  यात्रा खर्च              ₹1,200
  वापसी यात्रा             ₹1,000
  खाना भत्ता (3 दिन)       ₹3,000
  ═══════════════════════════════════════
  कुल भुगतान:              ₹28,550
  ═══════════════════════════════════════

Payout info card:
  "भुगतान कब?"
  Payout status + expected date
  If COMPLETED: "₹28,550 — [date] को SBI ••••4521 में भेजे गए"
  If PENDING: "पूजा पूरी होने के 24 घंटे में भेजे जाएंगे"
  Transaction reference (if completed)

"[?] प्लेटफॉर्म शुल्क क्या है?" expandable explainer:
  "HmarePanditJi आपको नए ग्राहक ढूंढता है, यात्रा की व्यवस्था 
   करता है और भुगतान की गारंटी देता है। इसके बदले हम आपकी 
   दक्षिणा का 15% सेवा शुल्क लेते हैं।"

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS
════════════════════════════════════════════════════════════════

GET /api/pandit/earnings/summary?month=YYYY-MM (PANDIT auth)
  Returns: {
    period: { month, year, label },
    totalEarned: number,        // Sum of panditPayout for completed bookings
    totalPaid: number,          // Sum of COMPLETED payouts
    totalPending: number,       // Sum of PENDING/PROCESSING payouts
    bookingsCount: number,
    bankAccount: { bankName, maskedAccountNumber, accountType },
    monthlyTotals: [           // Last 6 months for chart
      { month: 'Jan', total: number },
      ...
    ],
    pendingPayouts: Payout[],
    bookingEarnings: [{
      bookingId, bookingNumber, eventType, eventDate, customerCity,
      grossAmount, panditPayout, payoutStatus, payoutDate
    }]
  }

Logic:
  1. Find all pandit's COMPLETED bookings (filter by month if provided)
  2. Aggregate totals from Payout table
  3. Get last 6 months totals for chart
  4. Return bank account (masked)

GET /api/pandit/earnings/:bookingId (PANDIT auth)
  Returns: {
    booking: { bookingNumber, eventType, eventDate },
    breakdown: {
      dakshina: number,
      platformFee: number,
      netDakshina: number,
      samagriAmount: number,
      travelCostOutbound: number,
      travelCostReturn: number,
      foodAllowanceAmount: number,
      totalPayout: number
    },
    payout: {
      status: PayoutStatus,
      expectedDate: string,
      completedDate?: string,
      transactionRef?: string,
      bankAccountMasked: string
    }
  }
```

---

### PROMPT 5.3 — PACKAGE EDITOR + SAMAGRI MANAGEMENT + GROWTH & BADGES

```
Build three remaining pandit operational screens:
1. Package Editor — manage puja service packages and pricing
2. Samagri Management — manage samagri inventory and package items
3. Growth & Badges — gamification and demand insights

These screens are accessed via the Pandit Profile section.

════════════════════════════════════════════════════════════════
ROUTE STRUCTURE
════════════════════════════════════════════════════════════════

apps/pandit/app/profile/
├── page.tsx                      # Profile overview (public view + edit link)
├── edit/
│   └── page.tsx                  # Edit basic profile fields
├── packages/
│   └── page.tsx                  # Package Editor
├── samagri/
│   └── page.tsx                  # Samagri Management
├── bank-details/
│   └── page.tsx                  # Bank details (edit)
└── growth/
    └── page.tsx                  # Badges & Growth

════════════════════════════════════════════════════════════════
PROFILE OVERVIEW PAGE (/profile)
════════════════════════════════════════════════════════════════

apps/pandit/app/profile/page.tsx

Shows how the pandit's profile looks to customers (read-only preview)
plus edit links.

Header section:
  Large avatar + name + verification badge
  Experience, location, rating
  [✏️ प्रोफाइल संपादित करें] → /profile/edit

Two-column grid of cards (sections):
  Card 1: पूजाएं और भाषाएं (specializations) + [संपादित करें]
  Card 2: यात्रा प्राथमिकताएं (travel) + [संपादित करें]
  Card 3: सामग्री पैकेज (samagri) + [प्रबंधित करें] → /profile/samagri
  Card 4: बैंक खाता (masked) + [बदलें] → /profile/bank-details
  Card 5: प्रोफाइल पूर्णता (completion %) + [सुधारें]

════════════════════════════════════════════════════════════════
PACKAGE EDITOR (/profile/packages)
════════════════════════════════════════════════════════════════

apps/pandit/app/profile/packages/page.tsx

VoiceButton: "यहाँ आप अपनी सेवाओं की कीमतें और विवरण 
  बदल सकते हैं। ग्राहक इन्हीं पैकेजों में से चुनते हैं।"

Page title: "पूजा पैकेज संपादित करें"
Subtitle: "ये पैकेज ग्राहकों को बुकिंग के समय दिखेंगे"

For each PackageType (BASIC, STANDARD, PREMIUM):
  
  Package Card (expandable/collapsible):
    Header row: 
      Package type badge + [Name] + ₹[Price]
      Toggle: "यह पैकेज चालू है" ON/OFF
      [▾ / ▴] expand/collapse
    
    Expanded content:
      पैकेज का नाम (Name): text input, max 50 chars
      कीमत (Price): number input ₹ prefix, min 100, max 100000
      विवरण (Description): textarea, max 200 chars
        Below: char counter
      
      सामग्री सूची (What's included):
        Existing items shown as removable chips (× button)
        [+ आइटम जोड़ें] button → input field appears inline
          Press Enter or [जोड़ें] to add
        Drag-to-reorder (HTML5 drag API — simple implementation)
        Min 3 items to enable package
        
      Duration guidance:
        "इस पैकेज में कितना समय लगता है?"
        Select: "1 घंटा" | "2-3 घंटे" | "आधा दिन" | "1 दिन" | "2+ दिन"
      
      Preview button: [👁️ ग्राहक इसे कैसे देखेंगे?]
        Opens a modal with the customer-facing package card preview

  Bottom of each package card: [बदलाव सहेजें] → PUT /api/pandit/packages/{id}

════════════════════════════════════════════════════════════════
SAMAGRI MANAGEMENT (/profile/samagri)
════════════════════════════════════════════════════════════════

apps/pandit/app/profile/samagri/page.tsx

VoiceButton: "यहाँ आप देख सकते हैं कि ग्राहकों ने 
  कौन-सी सामग्री मांगी है और आप क्या लेकर जाते हैं।"

Page title: "सामग्री प्रबंधन"

SECTION A: क्या आप सामग्री लाते हैं?
  Large toggle: YES/NO
  If changed to NO: confirmation modal
    "क्या आप सामग्री लाना बंद करना चाहते हैं? 
     ग्राहकों को खुद व्यवस्था करनी होगी।"

SECTION B: मेरे पैकेज की पूरी सूची (Complete item lists per package)

  Tab bar: [बेसिक] [स्टैंडर्ड] [प्रीमियम]
  
  For selected package:
    Header: "स्टैंडर्ड पैकेज — 28 आइटम — ₹5,500"
    
    Item list (scrollable, 2 cols on desktop):
      Each item: 
        - Checkbox (checked = included in package)
        - Item name (editable inline — click to edit)
        - [×] remove button
      
      [+ नया आइटम जोड़ें] button at bottom
        Text input inline + [जोड़ें]

SECTION C: ग्राहकों की खास मांगें (Custom requests from customers)

  Read-only list of last 10 bookings where samagriPreference=CUSTOMER_ARRANGES
  and customer provided a custom samagri list.
  
  Each item:
    Booking date + event type + "ग्राहक ने मांगा:" 
    Collapsible list of what customer wanted.
    Note: "इन आइटम को आप भविष्य में अपने पैकेज में जोड़ सकते हैं"

SECTION D: बाज़ार में क्या चल रहा है (Demand Insights)

  Card: "इस हफ्ते ज़्यादा मांग:"
    List of top 3 puja types trending in pandit's city (from platform data)
    "सत्यनारायण पूजा — 23 बुकिंग इस हफ्ते दिल्ली में"

  Card: "आपके पैकेज की तुलना:"
    "आपके स्टैंडर्ड पैकेज में [28 आइटम] हैं।
     समान पंडितों का औसत: [24 आइटम]"
    
  Card: "कमाई बढ़ाने का सुझाव:"
    Simple hardcoded tips:
    "💡 विवाह पूजा के लिए प्रीमियम पैकेज जोड़ें — यह 
       आपके क्षेत्र में सबसे ज़्यादा बुक होती है"

════════════════════════════════════════════════════════════════
GROWTH & BADGES PAGE (/profile/growth)
════════════════════════════════════════════════════════════════

apps/pandit/app/profile/growth/page.tsx

VoiceButton: "यह आपकी उपलब्धियां हैं। जितनी ज़्यादा पूजाएं 
  करेंगे, उतनी ज़्यादा बैज मिलेंगी और ग्राहकों में भरोसा बढ़ेगा।"

SECTION A: आपका स्तर (Tier / Level)

  Large circular badge showing current tier:
  
  Tier system (based on completed bookings):
    🥉 नया पंडित (Naya Pandit)    0–4 bookings
    🥈 अनुभवी (Anubhavi)          5–19 bookings
    🥇 विशेषज्ञ (Visheshagya)     20–49 bookings
    💎 गुरु (Guru)                 50–99 bookings
    🌟 महागुरु (Mahaguru)          100+ bookings
  
  Progress to next tier:
    "अगले स्तर के लिए [X] बुकिंग और चाहिए"
    Progress bar (filled amber)

  Benefits of current tier:
    Simple list: "• प्राथमिकता सर्च में दिखाई देते हैं"
    "• [Tier name] बैज प्रोफाइल पर दिखता है"

SECTION B: बैज संग्रह (Badge Collection)

  Grid of badge cards (3 cols desktop, 2 cols mobile):
  Each badge card:
    Icon (emoji large) + name + description
    Earned: colored card, check mark overlay, earned date
    Unearned: gray/muted card with lock icon
  
  Badge definitions (hardcoded, evaluate from real data):
    🌅 "पहली पूजा" — पहली बुकिंग पूरी की
      Condition: completedBookings >= 1
    ⭐ "5 स्टार" — 10 5-star reviews मिले
      Condition: fiveStarReviews >= 10
    ✈️ "यात्री पंडित" — 5 outstation bookings
      Condition: outstationCompleted >= 5
    🚀 "तेज़ जवाब" — 20 bookings accepted within 1 hour of request
      Condition: fastAcceptCount >= 20
    📿 "विवाह विशेषज्ञ" — 10 vivah pujas completed
      Condition: vivahBookings >= 10
    💯 "पूर्ण प्रोफाइल" — All onboarding steps + verified
      Condition: onboardingComplete && VERIFIED
    🔥 "लगातार 30 दिन" — Available every day for 30 days (no blocks)
      Condition: continuousAvailabilityDays >= 30
    🌟 "महीने का पंडित" — Highest bookings in region in a month
      Condition: awarded by admin manually in Phase 1

SECTION C: परफॉर्मेंस रिपोर्ट (Performance Report)

  Simple cards:
  Card 1: स्वीकृति दर (Acceptance Rate)
    "87%" + bar
    "आपने [47] में से [41] बुकिंग स्वीकार की"
    Benchmark: "अच्छे पंडितों का औसत: 80%+"
  
  Card 2: पूर्णता दर (Completion Rate)
    "96%" + bar
    "स्वीकार की हुई [41] में से [39] पूजाएं पूरी हुईं"
  
  Card 3: औसत रेटिंग (Average Rating)
    "4.8 ★" + distribution bar chart (5,4,3,2,1 star counts)
  
  Card 4: जवाब का समय (Response Time)
    "औसत 45 मिनट" — time from request to accept/decline
    "लक्ष्य: 2 घंटे से कम" (green ✓ if meeting target)

SECTION D: समीक्षाएं (Reviews)

  "हाल की समीक्षाएं" (Recent Reviews)
  
  Each review card:
    Customer (first name + initial): "राजेश के."
    Rating: ★★★★★
    Date: "15 मार्च 2026"
    Comment (if any): "[review text]"
    Event: "विवाह पूजा" (small badge)
  
  [सभी समीक्षाएं देखें →] link (pagination below fold)

════════════════════════════════════════════════════════════════
BACKEND ENDPOINTS FOR PROFILE SECTION
════════════════════════════════════════════════════════════════

GET /api/pandit/profile (PANDIT auth)
  Returns: full PanditProfile with all relations, formatted for display

PUT /api/pandit/profile/basic (PANDIT auth)
  Body: { fullName, bio, homeCity, homeState, experienceYears }
  Update User.name + PanditProfile fields, return updated profile

PUT /api/pandit/profile/specializations (PANDIT auth)
  Body: { pujaTypes, languages, vedicDegree, gotra }
  Delete old specializations, insert new ones

PUT /api/pandit/profile/travel (PANDIT auth)
  Body: travelPreferences object
  Update PanditProfile travel fields

GET /api/pandit/packages (PANDIT auth)
  Returns: all PanditSamagriPackage records for this pandit

PUT /api/pandit/packages/:id (PANDIT auth)
  Body: { name, price, description, items, duration, isEnabled }
  Validate: if enabling, min 3 items required
  Update package record, return updated

PUT /api/pandit/samagri/toggle (PANDIT auth)
  Body: { canBringSamagri: boolean }
  Update PanditProfile.canBringSamagri

GET /api/pandit/growth (PANDIT auth)
  Returns: {
    tier: { name, slug, icon, minBookings, maxBookings },
    nextTier: { name, bookingsNeeded },
    completedBookings: number,
    badges: [{ id, name, icon, description, earned: bool, earnedDate? }],
    performance: {
      acceptanceRate: number,
      completionRate: number,
      averageRating: number,
      ratingDistribution: { 5: N, 4: N, 3: N, 2: N, 1: N },
      avgResponseTimeMinutes: number
    },
    recentReviews: [{
      customerNameMasked, rating, comment, eventType, reviewDate
    }]
  }

Logic for GET /api/pandit/growth:
  1. Count total COMPLETED bookings → determine tier
  2. Evaluate each badge condition from real data queries
  3. Calculate acceptance rate: accepted / (accepted + declined)
  4. Calculate completion rate: completed / accepted
  5. Avg rating: avg of all reviews for this pandit
  6. Avg response time: avg of (acceptedAt - requestedAt) in minutes
  7. Return reviews ordered by date DESC, limit 5

GET /api/pandit/samagri/customer-requests (PANDIT auth)
  Returns last 10 completed bookings where samagriPreference=CUSTOMER_ARRANGES
  with their custom samagri lists (stored in Booking.customerSamagriList JSON field)

GET /api/pandit/samagri/demand-insights (PANDIT auth)
  Returns platform-level weekly booking counts by puja type for pandit's region
  (In Phase 1: return hardcoded/seeded demo data — real analytics in Phase 2)
```

---

## IMPORTANT CROSS-CUTTING CONCERNS FOR PART 3

### New Prisma Schema Fields Needed (add to schema.prisma):

```prisma
// Add to PanditProfile model:
model PanditProfile {
  // ... existing fields ...
  onboardingComplete        Boolean   @default(false)
  profileCompletionPercent  Int       @default(0)
  canBringSamagri           Boolean   @default(true)
  willingToTravel           Boolean   @default(true)
  maxTravelDistanceKm       Int       @default(0)
  preferredTravelModes      TravelMode[]
  requiresAccommodation     Boolean   @default(false)
  requiresFoodArrangement   Boolean   @default(false)
  localServiceRadius        Int       @default(20)
  outOfDelhiAvailable       Boolean   @default(true)
  vedicDegree               String?
  gotra                     String?
  specialCertifications     String[]
  journeyStartedAt          DateTime?
  arrivedAt                 DateTime?
  pujaStartedAt             DateTime?
  completedAt               DateTime?
}

// New model: BlackoutDate
model BlackoutDate {
  id          String        @id @default(cuid())
  panditId    String
  pandit      PanditProfile @relation(fields: [panditId], references: [id])
  startDate   DateTime
  endDate     DateTime
  reason      String?
  type        String        @default("SINGLE") // SINGLE | RANGE
  createdAt   DateTime      @default(now())
  
  @@index([panditId, startDate, endDate])
}

// New model: KYCSubmission
model KYCSubmission {
  id                  String    @id @default(cuid())
  panditId            String    @unique
  pandit              PanditProfile @relation(fields: [panditId], references: [id])
  aadhaarFrontUrl     String?
  aadhaarBackUrl      String?
  selfieWithAadhaarUrl String?
  videoUrl            String?
  submittedAt         DateTime  @default(now())
  reviewedAt          DateTime?
  reviewedBy          String?   // Admin user ID
  reviewNotes         String?
}

// New model: Payout
model Payout {
  id              String        @id @default(cuid())
  bookingId       String        @unique
  booking         Booking       @relation(fields: [bookingId], references: [id])
  panditId        String
  pandit          PanditProfile @relation(fields: [panditId], references: [id])
  amount          Float
  status          PayoutStatus  @default(PENDING)
  transactionRef  String?
  processedAt     DateTime?
  createdAt       DateTime      @default(now())
}

// New model: Review
model Review {
  id          String    @id @default(cuid())
  bookingId   String    @unique
  booking     Booking   @relation(fields: [bookingId], references: [id])
  customerId  String
  panditId    String
  rating      Int       // 1–5
  comment     String?
  createdAt   DateTime  @default(now())
  
  @@index([panditId])
}

// Add to Booking model:
model Booking {
  // ... existing fields ...
  customerSamagriList   Json?         // Custom item list when CUSTOMER_ARRANGES
  panditAcceptedAt      DateTime?
  panditDeclinedAt      DateTime?
  declineReason         String?
  journeyStartedAt      DateTime?
  arrivedAt             DateTime?
  pujaStartedAt         DateTime?
  completedAt           DateTime?
}
```

### New Seed Data (add to prisma/seed.ts):

```typescript
// Seed a sample verified pandit for testing:
const testPandit = await prisma.user.upsert({
  where: { phone: '9876543210' },
  create: {
    phone: '9876543210',
    name: 'Pt. Ramesh Sharma',
    role: 'PANDIT',
    panditProfile: {
      create: {
        homeCity: 'Delhi',
        homeState: 'Delhi',
        experienceYears: 15,
        bio: 'Main 15 saalon se puja karta aaya hoon. Vivah, griha pravesh aur satyanarayan puja meri visheshata hai.',
        verificationStatus: 'VERIFIED',
        onboardingComplete: true,
        profileCompletionPercent: 100,
        canBringSamagri: true,
        willingToTravel: true,
        maxTravelDistanceKm: 500,
        preferredTravelModes: ['TRAIN', 'CAB'],
        localServiceRadius: 25,
        rating: 4.8,
        totalReviews: 47,
      }
    }
  },
  update: {}
});

// Seed samagri packages for test pandit:
await prisma.panditSamagriPackage.createMany({
  data: [
    {
      panditId: testPandit.panditProfile!.id,
      packageType: 'BASIC',
      name: 'Sadharan Samagri Package',
      description: 'Regular puja ke liye zaruri cheezein',
      price: 1500,
      items: ['Kumkum', 'Chaawal', 'Ghee', 'Agarbatti', 'Deepak', 'Phool'],
    },
    {
      panditId: testPandit.panditProfile!.id,
      packageType: 'STANDARD',
      name: 'Standard Samagri Package',
      description: 'Zyaadatar puja types ke liye uchit',
      price: 3500,
      items: ['Kumkum', 'Chaawal', 'Ghee', 'Agarbatti', 'Deepak', 'Phool',
              'Gangajal', 'Panch Mewa', 'Til', 'Sarson', 'Supari', 'Laung'],
    }
  ],
  skipDuplicates: true,
});
```

### Environment Variables to Add:

```
# apps/pandit
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_PANDIT_SUPPORT_PHONE=+919XXXXXXXXX

# Notification sound asset
# Place: apps/pandit/public/sounds/booking-alert.mp3
# Use a short royalty-free bell sound (< 3 seconds, < 100KB)
```

### Testing Checklist for Part 3:

- [ ] New pandit can log in and lands on /onboarding
- [ ] All 6 onboarding steps complete with data saved at each step
- [ ] Hindi voice narration plays on VoiceButton click in every step
- [ ] Video recording works in-browser and uploads successfully
- [ ] Dashboard shows pending booking alert with countdown timer
- [ ] Polling triggers browser notification (allow permission first)
- [ ] Accept/decline modal saves to database with correct status transition
- [ ] Detailed booking page shows masked phone + countdown to reveal
- [ ] Live tracking page buttons trigger correct status transitions
- [ ] Calendar shows booked dates in amber and blocked dates in red
- [ ] Blocking a date with existing booking shows conflict warning
- [ ] Earnings summary correctly aggregates from Payout + Booking tables
- [ ] Per-puja breakdown shows correct math (dakshina - 15% + travel + food)
- [ ] Badges are correctly evaluated and earned ones show with date
- [ ] Package editor allows adding/removing items and enables/disables packages
- [ ] Samagri toggle updates canBringSamagri on profile correctly

---

*Next: Part 4 — Admin Operations Center (8-screen admin panel, travel desk, payout processing, pandit verification queue, helpline dashboard)*

*Next: Part 5 — Customer Post-Booking Dashboard, GPS Tracking (customer side), Muhurat Patrika Certificate, Family Gotra Setup, NRI Flow basics*
