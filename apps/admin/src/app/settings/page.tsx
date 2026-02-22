"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@hmarepanditji/ui/components/ui/card";
import { Button } from "@hmarepanditji/ui/components/ui/button";
import { Input } from "@hmarepanditji/ui/components/ui/input";
import { Label } from "@hmarepanditji/ui/components/ui/label";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  // In Phase 1, these are "display-only" but we allow editing to show it works in UI.
  // They aren't actually saved to backend yet according to instructions.
  const [settings, setSettings] = useState({
    platformFee: 15,
    travelFee: 5,
    samagriFee: 10,
    backupGuarantee: 9999,
    foodDaily: 1000,
    refund7: 90,
    refund3_7: 50,
    refund1_3: 20,
    refund0: 0,
    mockMode: false,
    smsProvider: "Twilio"
  });

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    setSaving(true);
    // Simulate API call for saving settings
    setTimeout(() => {
      alert("Settings saved successfully! (Note: Core functionality uses hardcoded values in Phase 1)");
      setSaving(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto flex-1">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Configure core application rules and fees</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 w-32">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commission Rates</CardTitle>
            <CardDescription>Configure platform take rates</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Platform Fee (% of Dakshina)</Label>
              <Input
                type="number"
                value={settings.platformFee}
                onChange={e => handleChange("platformFee", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Travel Service Fee (%)</Label>
              <Input
                type="number"
                value={settings.travelFee}
                onChange={e => handleChange("travelFee", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Samagri Service Fee (%) <span className="text-xs text-muted-foreground ml-1">for custom list only</span></Label>
              <Input
                type="number"
                value={settings.samagriFee}
                onChange={e => handleChange("samagriFee", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Backup Guarantee Price (₹)</Label>
              <Input
                type="number"
                value={settings.backupGuarantee}
                onChange={e => handleChange("backupGuarantee", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Food & Accommodation</CardTitle>
            <CardDescription>Standard allowances if customer doesn't provide</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Daily Food Allowance Rate (₹)</Label>
              <Input
                type="number"
                value={settings.foodDaily}
                onChange={e => handleChange("foodDaily", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cancellation Policy</CardTitle>
            <CardDescription>Refund percentage based on days until event</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>&gt; 7 days (%)</Label>
              <Input
                type="number"
                value={settings.refund7}
                onChange={e => handleChange("refund7", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>3-7 days (%)</Label>
              <Input
                type="number"
                value={settings.refund3_7}
                onChange={e => handleChange("refund3_7", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>1-3 days (%)</Label>
              <Input
                type="number"
                value={settings.refund1_3}
                onChange={e => handleChange("refund1_3", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Same day (%)</Label>
              <Input
                type="number"
                value={settings.refund0}
                onChange={e => handleChange("refund0", Number(e.target.value))}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <span className="text-xs text-muted-foreground block">Always 0% defaults</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System & Notifications</CardTitle>
            <CardDescription>Developer tools and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <Label className="text-base font-medium text-foreground">Mock Mode (Development)</Label>
                <p className="text-sm text-muted-foreground">When enabled, SMS and Payments use dummy simulation.</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={settings.mockMode}
                onChange={e => handleChange("mockMode", e.target.checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium text-foreground">Push Provider</Label>
                <p className="text-sm text-muted-foreground">Active service for delivering SMS (Read-Only).</p>
              </div>
              <div className="w-1/3">
                <Input disabled value={settings.smsProvider} className="bg-muted text-muted-foreground font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
