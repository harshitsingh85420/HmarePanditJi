"use client";
import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@hmarepanditji/ui/components/ui/card";
import { Button } from "@hmarepanditji/ui/components/ui/button";
import { Badge } from "@hmarepanditji/ui/components/ui/badge";
import { Input } from "@hmarepanditji/ui/components/ui/input";
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@hmarepanditji/ui/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@hmarepanditji/ui/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@hmarepanditji/ui/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hmarepanditji/ui/components/ui/select";
import { Label } from "@hmarepanditji/ui/components/ui/label";
import { Textarea } from "@hmarepanditji/ui/components/ui/textarea";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");

  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statusQuery = tab === "ALL" ? "" : `?status=${tab}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/payouts${statusQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setPayouts(json.data.bookings || []);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [tab]);

  const handleProcessPayoutClick = (p: any) => {
    setSelectedPayout(p);
    setTransactionRef("");
    setNotes("");
    setPaymentMethod("BANK_TRANSFER");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setProcessModalOpen(true);
  };

  const confirmPayout = async () => {
    if (!transactionRef) return alert("Please enter a transaction reference number");
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/payouts/${selectedPayout.id}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionRef,
          paymentMethod,
          paymentDate,
          notes
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("Payout processed successfully!");
        setProcessModalOpen(false);
        fetchPayouts();
      } else {
        alert(json.message || "Failed to process payout");
      }
    } catch (e) {
      console.error(e);
      alert("Error processing payout");
    } finally {
      setProcessing(false);
    }
  };

  const exportCSV = () => {
    const completed = payouts.filter(p => p.payoutStatus === "COMPLETED");
    const csvRows = [
      ["BookingID", "PanditName", "PanditPhone", "Amount", "BankAccount", "IFSC", "TransactionRef", "ProcessedDate"]
    ];

    completed.forEach(p => {
      csvRows.push([
        p.bookingNumber,
        p.pandit?.name || "N/A",
        p.pandit?.phone || "N/A",
        p.panditPayout.toString(),
        p.pandit?.bankDetails?.accountNumber || "N/A",
        p.pandit?.bankDetails?.ifscCode || "N/A",
        p.payoutReference || "N/A",
        p.payoutCompletedAt ? new Date(p.payoutCompletedAt).toLocaleString() : "N/A"
      ]);
    });

    const csvString = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "completed_payouts.csv";
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payout Queue</h1>
          <p className="text-muted-foreground mt-1">Process pandit payouts after puja completion</p>
        </div>
        {tab === "COMPLETED" && (
          <Button onClick={exportCSV} variant="outline">📥 Export CSV</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayouts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalPayouts || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="PENDING">💰 Pending Payouts</TabsTrigger>
          <TabsTrigger value="COMPLETED">✅ Completed</TabsTrigger>
          <TabsTrigger value="ALL">All</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Pandit</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  {tab !== "PENDING" && <TableHead>Status</TableHead>}
                  {tab === "COMPLETED" && <TableHead>Transaction Ref</TableHead>}
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10">Loading...</TableCell></TableRow>
                ) : payouts.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10">No payouts found</TableCell></TableRow>
                ) : (
                  payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <a href={`/bookings/${p.id}`} className="text-indigo-600 hover:underline font-medium">
                          {p.bookingNumber}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{p.pandit?.name}</div>
                        <div className="text-xs text-muted-foreground">{p.pandit?.city || "Unknown City"}</div>
                      </TableCell>
                      <TableCell>
                        <div>{p.eventType}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.eventDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{p.panditPayout}
                        <div className="text-xs font-normal text-muted-foreground">
                          Fee: ₹{p.grandTotal - p.panditPayout}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">SBI — XXXX4321 {/* Masked in real data */}</div>
                      </TableCell>
                      {tab !== "PENDING" && (
                        <TableCell>
                          <Badge variant={p.payoutStatus === "COMPLETED" ? "default" : "secondary"}>
                            {p.payoutStatus}
                          </Badge>
                        </TableCell>
                      )}
                      {tab === "COMPLETED" && (
                        <TableCell>
                          <div className="text-sm font-mono">{p.payoutReference || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.payoutCompletedAt ? new Date(p.payoutCompletedAt).toLocaleDateString() : ""}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {p.payoutStatus === "PENDING" ? (
                          <Button size="sm" onClick={() => handleProcessPayoutClick(p)}>Process Payout</Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>Processed</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={processModalOpen} onOpenChange={setProcessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Confirm payment details for {selectedPayout?.pandit?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking:</span>
                  <span className="font-medium">{selectedPayout.bookingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payout Amount:</span>
                  <span className="font-bold text-lg">₹{selectedPayout.panditPayout}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium">State Bank of India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account:</span>
                  <span className="font-medium">XXXXXXXX4321</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IFSC:</span>
                  <span className="font-medium">SBIN0001234</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transaction Reference (UTR / UPI Ref)</Label>
                  <Input
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder="e.g. UTR123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Admin Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Internal notes about this payout"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmPayout} disabled={processing}>
              {processing ? "Processing..." : "💰 Confirm Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
