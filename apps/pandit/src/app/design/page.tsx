"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import { hi } from "@/lib/strings";

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
      <Header title={hi.design.title} showBack onBack={() => {}} />

      {/* Main Container */}
      <main className="max-w-[430px] mx-auto px-4 pt-6 flex flex-col gap-8">
        
        {/* Section 1: Greeting Header */}
        <section className="flex flex-col gap-2">
          <GreetingHeader firstName="हरिशंकर" />
        </section>

        {/* Section 2: Buttons Grid */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.buttons}
          </h2>
          
          <div className="flex flex-col gap-4">
            {/* Primary sizes */}
            <div className="flex flex-col gap-3">
              <span className="t-hint">Primary (md, lg, xl):</span>
              <Button variant="primary" size="md" fullWidth>
                {hi.common.save} (md - 56px)
              </Button>
              <Button variant="primary" size="lg" fullWidth>
                {hi.common.next} (lg - 64px)
              </Button>
              <Button variant="primary" size="xl" fullWidth>
                {hi.welcome.startBtn} (xl - 80px)
              </Button>
            </div>

            {/* Other Variants */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="t-hint">Other Variants:</span>
              <Button variant="secondary" size="md" fullWidth>
                {hi.common.back} (Secondary)
              </Button>
              <Button variant="success" size="md" fullWidth>
                {hi.common.yes} (Success)
              </Button>
              <Button variant="danger-outline" size="md" fullWidth>
                {hi.common.no} (Danger Outline)
              </Button>
              <Button variant="ghost" size="md" fullWidth>
                {hi.common.help} (Ghost)
              </Button>
            </div>

            {/* Loading State */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="t-hint">Loading state:</span>
              <Button variant="primary" size="md" loading fullWidth>
                {hi.common.next}
              </Button>
            </div>
          </div>
        </section>

        {/* Section 3: Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.cards}
          </h2>

          <div className="flex flex-col gap-4">
            <Card>
              <h3 className="t-title font-semibold">Plain Card</h3>
              <p className="t-body mt-2">This is a standard rounded card with default shadow.</p>
            </Card>

            <Card accent="saffron">
              <h3 className="t-title font-semibold">{hi.design.accentSaffron}</h3>
              <p className="t-body mt-1">Accent card with saffron colored left border.</p>
            </Card>

            <Card accent="gold">
              <h3 className="t-title font-semibold">{hi.design.accentGold}</h3>
              <p className="t-body mt-1">Accent card with gold colored left border.</p>
            </Card>

            <Card accent="leaf">
              <h3 className="t-title font-semibold">{hi.design.accentLeaf}</h3>
              <p className="t-body mt-1">Accent card with leaf colored left border.</p>
            </Card>
          </div>
        </section>

        {/* Section 4: StatCard */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.stats}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <StatCard label={hi.design.pujaCount} value={14} emoji="📿" />
            <StatCard label={hi.earnings.paid} value={8400} emoji="💰" />
          </div>
        </section>

        {/* Section 5: EarningsRow with MoneyCount */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.earnings}
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
            {hi.design.progress}
          </h2>
          
          <Card className="py-6">
            <ProgressDots current={3} total={7} />
          </Card>
        </section>

        {/* Section 7: Big Toggle */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.onlineTitle}
          </h2>
          
          <BigToggle value={isOnline} onChange={setIsOnline} />
        </section>

        {/* Section 8: Status Chips */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.statusChips}
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
            {hi.design.banners}
          </h2>
          
          <NewBookingBanner onTap={() => alert("नई बुकिंग चुनी गई")} />
        </section>

        {/* Section 10: Empty State */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.emptyState}
          </h2>

          <EmptyState
            emoji="📿"
            title={hi.design.demoTitle}
            hint={hi.design.demoHint}
          />
        </section>

        {/* Section 11: Demos (Signature Moments) */}
        <section className="flex flex-col gap-4">
          <h2 className="t-title font-bold text-temple-600 border-b border-saffron-100 pb-2">
            {hi.design.demos}
          </h2>

          <div className="flex flex-col gap-3">
            <Button variant="secondary" size="md" onClick={handleDiyaTrigger} fullWidth>
              {hi.design.diyaBtn}
            </Button>
            <Button variant="secondary" size="md" onClick={handlePulseTrigger} fullWidth>
              {hi.design.pulseBtn}
            </Button>
            <Button variant="secondary" size="md" onClick={() => setShowCelebration(true)} fullWidth>
              {hi.design.celebrationBtn}
            </Button>
            <Button variant="secondary" size="md" onClick={() => setShowToast(true)} fullWidth>
              {hi.design.toastBtn}
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

      {/* Toast message display */}
      <Toast
        message={hi.design.toastMsg}
        voiceText={hi.design.toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
