"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import { hi } from "@/lib/strings";
import { PanchangStrip } from "@/components/moments/PanchangStrip";
import { FestivalBanner } from "@/components/moments/FestivalBanner";
import { PragatiCard } from "@/components/moments/PragatiCard";
import { FESTIVALS_2026 } from "@/lib/festivals2026";
import { playBell, playChime } from "@/lib/sounds";

// UI Components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EarningsRow } from "@/components/ui/EarningsRow";
import { BigToggle } from "@/components/ui/BigToggle";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { StatusChip } from "@/components/ui/StatusChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { BottomNav } from "@/components/ui/BottomNav";
import { Header } from "@/components/ui/Header";

// Moments Components
import { DiyaLoader } from "@/components/moments/DiyaLoader";
import { CelebrationScreen } from "@/components/moments/CelebrationScreen";
import { AcceptPulse } from "@/components/moments/AcceptPulse";
import { NewBookingBanner } from "@/components/moments/NewBookingBanner";
import { GreetingHeader } from "@/components/moments/GreetingHeader";
import { MoneyCount } from "@/components/moments/MoneyCount";

const hiDesign = {
  title: "डिजाइन सिस्टम",
  buttons: "बटन प्रकार",
  cards: "कार्ड प्रकार",
  accentSaffron: "भगवा रंग",
  accentGold: "सुनहरा रंग",
  accentLeaf: "पत्ता रंग",
  stats: "सांख्यिकी कार्ड",
  pujaCount: "पूजा संख्या",
  earnings: "कमाई सूची",
  progress: "प्रगति संकेतक",
  onlineTitle: "ऑनलाइन/ऑफलाइन स्विच",
  statusChips: "स्टेटस चिप्स",
  banners: "बैनर प्रकार",
  emptyState: "खाली स्थिति",
  demoTitle: "खाली स्थिति शीर्षक",
  demoHint: "खाली स्थिति संकेत",
  demos: "इंटरएक्टिव क्षण",
  diyaBtn: "दीया लोडर चलाएं",
  pulseBtn: "स्वीकृति पल्स चलाएं",
  celebrationBtn: "उत्सव स्क्रीन चलाएं",
  toastBtn: "टोस्ट दिखाएं",
  toastMsg: "यह एक संदेश है",
};

export default function DesignSystemPage() {
  // Guard with process.env.NODE_ENV check (dev-only)
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  // Interactive States
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  // Signature Moments triggers
  const [showDiya, setShowDiya] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleDiyaTrigger = () => {
    setShowDiya(true);
    setTimeout(() => setShowDiya(false), 2000);
  };

  const handlePulseTrigger = () => {
    setShowPulse(true);
  };

  return (
    <div className="min-h-screen bg-cream text-ink font-hindi pb-32">
      {/* Sticky Header with Voice Toggle */}
      <Header title={hiDesign.title} showBack onBack={() => {}} />

      {/* Main Container */}
      <main className="max-w-[430px] mx-auto px-4 pt-6 flex flex-col gap-8">
        
        {/* Section 1: Greeting Header */}
        <section className="flex flex-col gap-2">
          <GreetingHeader firstName="हरिशंकर" />
        </section>

        {/* Section 2: Buttons Grid */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.buttons}
          </h2>
          
          <div className="flex flex-col gap-6">
            {(["primary", "secondary", "success", "danger-outline", "ghost"] as const).map((variant) => (
              <div key={variant} className="flex flex-col gap-2">
                <span className="t-hint capitalize font-semibold">{variant} Variant (md, lg, xl):</span>
                <div className="flex flex-col gap-3">
                  <Button variant={variant} size="md" fullWidth>
                    {hi.common.save} ({variant} md)
                  </Button>
                  <Button variant={variant} size="lg" fullWidth>
                    {hi.common.next} ({variant} lg)
                  </Button>
                  <Button variant={variant} size="xl" fullWidth>
                    {hi.welcome.startBtn} ({variant} xl)
                  </Button>
                </div>
              </div>
            ))}

            {/* Loading State */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="t-hint">Loading state (md, lg, xl):</span>
              <Button variant="primary" size="md" loading fullWidth>
                {hi.common.next}
              </Button>
              <Button variant="primary" size="lg" loading fullWidth>
                {hi.common.next}
              </Button>
              <Button variant="primary" size="xl" loading fullWidth>
                {hi.common.next}
              </Button>
            </div>
          </div>
        </section>

        {/* Section 3: Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.cards}
          </h2>

          <div className="flex flex-col gap-4">
            <Card>
              <h3 className="t-title font-semibold">Plain Card</h3>
              <p className="t-body mt-2">This is a standard rounded card with default shadow.</p>
            </Card>

            <Card accent="saffron">
              <h3 className="t-title font-semibold">{hiDesign.accentSaffron}</h3>
              <p className="t-body mt-1">Accent card with saffron colored left border.</p>
            </Card>

            <Card accent="gold">
              <h3 className="t-title font-semibold">{hiDesign.accentGold}</h3>
              <p className="t-body mt-1">Accent card with gold colored left border.</p>
            </Card>

            <Card accent="leaf">
              <h3 className="t-title font-semibold">{hiDesign.accentLeaf}</h3>
              <p className="t-body mt-1">Accent card with leaf colored left border.</p>
            </Card>
          </div>
        </section>

        {/* Section 4: StatCard */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.stats}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <StatCard label={hiDesign.pujaCount} value={14} emoji="📿" />
            <StatCard label={hi.earnings.paid} value={8400} emoji="💰" />
          </div>
        </section>

        {/* Section 5: EarningsRow with MoneyCount */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.earnings}
          </h2>

          <Card>
            <EarningsRow label={hi.booking.dakshina} amount={1500} kind="plus" />
            <EarningsRow label={hi.booking.platformFee} amount={225} kind="minus" />
            <div className="mt-4">
              <EarningsRow label={hi.booking.youGet} amount={1275} kind="total" />
            </div>
          </Card>
          
          {/* Roll-up Count Up demo */}
          <div className="flex items-center justify-between px-2">
            <span className="t-body font-medium">Anim Roll-up (CountUp):</span>
            <span className="t-money font-bold">
              <MoneyCount target={4800} />
            </span>
          </div>
        </section>

        {/* Section 6: Progress Dots */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.progress}
          </h2>
          
          <Card className="py-6">
            <ProgressDots current={3} total={7} />
          </Card>
        </section>

        {/* Section 7: Big Toggle */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.onlineTitle}
          </h2>
          
          <div className="flex flex-col gap-4">
            <span className="t-hint">Offline State:</span>
            <BigToggle value={false} onChange={() => {}} />
            <span className="t-hint">Online State:</span>
            <BigToggle value={true} onChange={() => {}} />
            <span className="t-hint">Interactive:</span>
            <BigToggle value={isOnline} onChange={setIsOnline} />
          </div>
        </section>

        {/* Section 8: Status Chips */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.statusChips}
          </h2>

          <div className="flex flex-wrap gap-2">
            <StatusChip status="REQUESTED" />
            <StatusChip status="ACCEPTED" />
            <StatusChip status="IN_PROGRESS" />
            <StatusChip status="COMPLETED" />
            <StatusChip status="CANCELLED" />
          </div>
        </section>

        {/* Section 9: Booking Banner */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.banners}
          </h2>
          
          <NewBookingBanner onTap={() => alert("नई बुकिंग चुनी गई")} />
        </section>

        {/* Section 10: Empty State */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.emptyState}
          </h2>

          <EmptyState
            emoji="📿"
            title={hiDesign.demoTitle}
            hint={hiDesign.demoHint}
          />
        </section>

        {/* Section 11: Demos (Signature Moments) */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hiDesign.demos}
          </h2>

          <div className="flex flex-col gap-3">
            <Button variant="secondary" size="md" onClick={handleDiyaTrigger} fullWidth>
              {hiDesign.diyaBtn}
            </Button>
            <Button variant="secondary" size="md" onClick={handlePulseTrigger} fullWidth>
              {hiDesign.pulseBtn}
            </Button>
            <Button variant="secondary" size="md" onClick={() => setShowCelebration(true)} fullWidth>
              {hiDesign.celebrationBtn}
            </Button>
            <Button variant="secondary" size="md" onClick={() => setShowToast(true)} fullWidth>
              {hiDesign.toastBtn}
            </Button>
          </div>
        </section>

      </main>

      {/* Floating Mute/Unmute toggle (VoiceBar) is mounted via Header */}
      
      {/* Dynamic bottom nav bar */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Interactive signature moment displays */}
      {showDiya && <DiyaLoader />}

      {showPulse && <AcceptPulse onComplete={() => setShowPulse(false)} />}

      {showCelebration && (
        <CelebrationScreen
          emoji="🙏"
          title={hi.onboarding.doneTitle}
          amount={1275}
          message={hi.booking.completeVoice}
          ctaLabel={hi.common.next}
          onCta={() => setShowCelebration(false)}
        />
      )}


      {/* ── WARMTH PASS SHOWCASE ─────────────────────────────────────── */}
      <section className="mt-12 p-4 bg-white rounded-card border border-saffron-100 flex flex-col gap-4">
        <h2 className="t-title font-bold">🪔 Warmth pass</h2>

        <h3 className="t-hint font-bold uppercase">PanchangStrip</h3>
        <PanchangStrip tithi="शुक्ल पक्ष, एकादशी" />

        <h3 className="t-hint font-bold uppercase">FestivalBanner (forced: दिवाली)</h3>
        <FestivalBanner festival={FESTIVALS_2026[FESTIVALS_2026.length - 1]} />

        <h3 className="t-hint font-bold uppercase">Pragati card (3 earned)</h3>
        <PragatiCard earnedKinds={["FIRST_BOOKING", "BOOKINGS_5", "EARNED_11K"]} />

        <h3 className="t-hint font-bold uppercase">Milestone celebration + sounds</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="min-h-[56px] px-4 bg-saffron-100 rounded-btn font-bold active:scale-[0.97]" onClick={() => setShowCelebration(true)}>
            🌟 Trigger celebration
          </button>
          <button className="min-h-[56px] px-4 bg-saffron-100 rounded-btn font-bold active:scale-[0.97]" onClick={() => playBell()}>
            🔔 Bell
          </button>
          <button className="min-h-[56px] px-4 bg-saffron-100 rounded-btn font-bold active:scale-[0.97]" onClick={() => playChime()}>
            🎐 Chime
          </button>
        </div>

        <h3 className="t-hint font-bold uppercase">Online glow</h3>
        <div className="w-full h-16 rounded-btn bg-leaf-700 text-white flex items-center justify-center font-bold online-glow">
          🟢 आप ऑनलाइन हैं
        </div>
      </section>

      {/* ── VOICE COVERAGE (dev checklist) ─────────────────────────────
          Product law: every reachable screen interacts by voice unless the
          pandit turns it off. This table is the manual audit of that law. */}
      <section className="mt-12 p-4 bg-white rounded-card border border-saffron-100">
        <h2 className="t-title font-bold mb-3">🔊 Voice coverage</h2>
        <table className="w-full text-[13px] text-left">
          <thead><tr><th className="pr-2">Route</th><th className="pr-2">Narration source</th><th>Voice input</th></tr></thead>
          <tbody>
            {[
              ["/homepage", "hi.welcomeFlow.homepage (SpeakOnMount)", "—"],
              ["/identity", "speakWithSarvam (mount)", "Deepgram STT"],
              ["onboarding/screens/* (language, city, permissions)", "voice-scripts + own-name-in-own-language on tap", "real STT mic (migrated)"],
              ["/help", "speakWithSarvam (mount)", "—"],
              ["/emergency", "speakWithSarvam (mount)", "—"],
              ["/emergency-sos", "speakWithSarvam (EmergencySOS)", "—"],
              ["/login", "VoiceField prompts (phone, OTP)", "VoiceField phone + otp"],
              ["/onboarding", "per-step voices (hi.onboarding.*)", "VoiceField all steps"],
              ["/home", "VoiceActionListener narration", "online/offline commands"],
              ["/bookings", "hi.bookingsList.intro (SpeakOnMount)", "VoiceActionListener (tabs + home)"],
              ["/bookings/[id]", "SpeakOnMount (details)", "—"],
              ["/bookings/[id]/request", "SpeakOnMount (earnings breakdown)", "accept/reject buttons"],
              ["/earnings", "hi.earnings.introVoice", "—"],
              ["/calendar", "hi.calendar.blockVoice", "tap"],
              ["/samagri", "SpeakOnMount", "—"],
              ["/settings", "hi.settingsScreen.intro + voiceOn/voiceOff on toggle", "narration only (by design)"],
              ["/resume", "speakWithSarvam (mount)", "—"],
              ["/(registration)/*", "redirects to /login | /onboarding", "n/a"],
            ].map(([route, narration, input]) => (
              <tr key={route} className="border-t border-saffron-50">
                <td className="pr-2 py-1 font-mono">{route}</td>
                <td className="pr-2 py-1">{narration}</td>
                <td className="py-1">{input}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Toast message display */}
      <Toast
        message={hiDesign.toastMsg}
        voiceText={hiDesign.toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
