"use client";
import React, { useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@hmarepanditji/ui/components/ui/card";
import { Button } from "@hmarepanditji/ui/components/ui/button";
import { Badge } from "@hmarepanditji/ui/components/ui/badge";
import { Input } from "@hmarepanditji/ui/components/ui/input";
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
import { Label } from "@hmarepanditji/ui/components/ui/label";
import { Textarea } from "@hmarepanditji/ui/components/ui/textarea";

export default function CancellationsPage() {
    const [cancellations, setCancellations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCancel, setSelectedCancel] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Override State
    const [overrideChecked, setOverrideChecked] = useState(false);
    const [customRefundAmount, setCustomRefundAmount] = useState<number | "">("");
    const [overrideReason, setOverrideReason] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    const fetchCancellations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/cancellations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                // Filter specifically for requested to keep the queue clean, but the API might return all cancelled.
                // We'll trust the API or filter it here.
                const data = json.data?.data || json.data || [];
                const queue = Array.isArray(data) ? data.filter(c => c.status === "CANCELLATION_REQUESTED") : [];
                setCancellations(queue);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCancellations();
    }, []);

    const calculateDaysUntil = (eventDate: string) => {
        const diffTime = new Date(eventDate).getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const calculateRefundPolicy = (days: number, total: number) => {
        const platformFee = Math.round(total * 0.15); // Rough approx for display
        const refundable = total - platformFee;

        let percent = 0;
        let pText = "";

        if (days > 7) { percent = 0.9; pText = "> 7 days (90%)"; }
        else if (days >= 3) { percent = 0.5; pText = "3-7 days (50%)"; }
        else if (days >= 1) { percent = 0.2; pText = "1-3 days (20%)"; }
        else { percent = 0; pText = "Same day (0%)"; }

        return {
            percent,
            text: pText,
            amount: Math.round(refundable * percent),
            platformFee,
            refundable
        };
    };

    const handleReviewClick = (c: any) => {
        setSelectedCancel(c);
        setOverrideChecked(false);
        const days = calculateDaysUntil(c.eventDate);
        const policy = calculateRefundPolicy(days, c.grandTotal);
        setCustomRefundAmount(policy.amount);
        setOverrideReason("");
        setRejectionReason("");
        setModalOpen(true);
    };

    const approveCancellation = async () => {
        if (overrideChecked && !overrideReason) return alert("Provider override reason if changing default amount.");
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            const days = calculateDaysUntil(selectedCancel.eventDate);
            const policy = calculateRefundPolicy(days, selectedCancel.grandTotal);
            const amt = overrideChecked ? Number(customRefundAmount) : policy.amount;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/bookings/${selectedCancel.id}/cancel-approve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    refundAmount: amt,
                    overrideReason: overrideChecked ? overrideReason : undefined
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Cancellation approved and refund initiated!");
                setModalOpen(false);
                fetchCancellations();
            } else {
                alert(json.message || "Failed to approve cancellation");
            }
        } catch (e) {
            console.error(e);
            alert("Error approving cancellation");
        } finally {
            setProcessing(false);
        }
    };

    const rejectCancellation = async () => {
        if (!rejectionReason) return alert("Provide a rejection reason.");
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/bookings/${selectedCancel.id}/cancel-reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rejectionReason })
            });
            const json = await res.json();
            if (json.success) {
                alert("Cancellation rejected.");
                setModalOpen(false);
                fetchCancellations();
            } else {
                alert(json.message || "Failed to reject cancellation");
            }
        } catch (e) {
            console.error(e);
            alert("Error rejecting cancellation");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cancellation Queue</h1>
                <p className="text-muted-foreground mt-1">Review customer cancellation requests and process refunds</p>
            </div>

            <Card className="bg-muted/50">
                <CardContent className="py-4 text-sm text-muted-foreground flex items-center justify-between">
                    <div>
                        <span className="font-semibold text-foreground">Refund Policy: </span>
                        {">7 days: 90% | 3-7 days: 50% | 1-3 days: 20% | Same day: 0% | Platform Fee: Non-refundable"}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Event Date</TableHead>
                            <TableHead>Requested</TableHead>
                            <TableHead>Days Until</TableHead>
                            <TableHead>Refund %</TableHead>
                            <TableHead>Refund Amt</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} className="text-center py-10">Loading...</TableCell></TableRow>
                        ) : cancellations.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="text-center py-10">No pending cancellation requests</TableCell></TableRow>
                        ) : (
                            cancellations.map((c) => {
                                const days = calculateDaysUntil(c.eventDate);
                                const policy = calculateRefundPolicy(days, c.grandTotal);
                                return (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <a href={`/bookings/${c.id}`} className="text-indigo-600 hover:underline font-medium">
                                                {c.bookingNumber}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{c.customer?.name || "Customer"}</div>
                                            <div className="text-xs text-muted-foreground">{c.customer?.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(c.eventDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(c.cancellationRequestedAt || c.updatedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={days < 3 ? "destructive" : days < 7 ? "secondary" : "outline"}>
                                                {days} days
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{(policy.percent * 100)}%</TableCell>
                                        <TableCell className="font-bold">₹{policy.amount}</TableCell>
                                        <TableCell>
                                            <Button size="sm" onClick={() => handleReviewClick(c)}>Review & Process</Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Review Cancellation Request</DialogTitle>
                        <DialogDescription>
                            Review policy and process refund for {selectedCancel?.bookingNumber}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCancel && (() => {
                        const days = calculateDaysUntil(selectedCancel.eventDate);
                        const policy = calculateRefundPolicy(days, selectedCancel.grandTotal);

                        return (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-md">
                                    <div>
                                        <span className="text-muted-foreground block">Customer:</span>
                                        <span className="font-medium">{selectedCancel.customer?.name} ({selectedCancel.customer?.phone})</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Event Date:</span>
                                        <span className="font-medium">{new Date(selectedCancel.eventDate).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Cancel Reason:</span>
                                        <span className="font-medium">{selectedCancel.cancellationReason || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Days Until Event:</span>
                                        <span className="font-medium text-destructive">{days} days</span>
                                    </div>
                                </div>

                                <div className="border p-4 rounded-md space-y-2">
                                    <h3 className="font-semibold text-sm border-b pb-2 mb-2">Refund Calculation</h3>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Grand Total Paid:</span>
                                        <span>₹{selectedCancel.grandTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Non-refundable Platform Fee (approx):</span>
                                        <span className="text-destructive">-₹{policy.platformFee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                        <span className="text-muted-foreground">Refundable Base Amount:</span>
                                        <span>₹{policy.refundable}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Policy Applies:</span>
                                        <span className="font-medium">{policy.text}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2">
                                        <span>Calculated Refund:</span>
                                        <span className="text-indigo-600">₹{policy.amount}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="override"
                                            checked={overrideChecked}
                                            onChange={(e) => setOverrideChecked(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor="override">Override Refund Amount/Percentage</Label>
                                    </div>

                                    {overrideChecked && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Custom Refund Amount (₹)</Label>
                                                <Input
                                                    type="number"
                                                    value={customRefundAmount}
                                                    onChange={e => setCustomRefundAmount(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Override Reason</Label>
                                                <Input
                                                    value={overrideReason}
                                                    onChange={e => setOverrideReason(e.target.value)}
                                                    placeholder="e.g. Exceptional circumstances"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 pt-4 border-t">
                                    <Label className="text-destructive">If Rejecting Request:</Label>
                                    <Input
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        placeholder="Reason for rejecting cancellation request"
                                    />
                                </div>
                            </div>
                        )
                    })()}

                    <DialogFooter className="flex justify-between w-full">
                        <Button variant="destructive" onClick={rejectCancellation} disabled={processing}>
                            ❌ Reject Cancel Request
                        </Button>
                        <div className="space-x-2">
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
                            <Button onClick={approveCancellation} className="bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                                {processing ? "Processing..." : "✅ Approve & Refund"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
