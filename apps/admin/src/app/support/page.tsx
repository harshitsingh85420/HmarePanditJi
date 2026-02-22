"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@hmarepanditji/ui/components/ui/card";
import { Button } from "@hmarepanditji/ui/components/ui/button";
import { Badge } from "@hmarepanditji/ui/components/ui/badge";
import { Input } from "@hmarepanditji/ui/components/ui/input";
import { Textarea } from "@hmarepanditji/ui/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@hmarepanditji/ui/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@hmarepanditji/ui/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hmarepanditji/ui/components/ui/select";
import { Label } from "@hmarepanditji/ui/components/ui/label";

export default function SupportLogPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    // Modal state
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

    // Form state
    const [source, setSource] = useState("Phone Call");
    const [type, setType] = useState("General Inquiry");
    const [relatedBookingId, setRelatedBookingId] = useState("");
    const [relatedUserId, setRelatedUserId] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("OPEN");

    // Detail modal state
    const [resolution, setResolution] = useState("");
    const [updateStatus, setUpdateStatus] = useState("");

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const qs = new URLSearchParams();
            if (statusFilter !== "ALL") qs.append("status", statusFilter);
            if (priorityFilter !== "ALL") qs.append("priority", priorityFilter);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/support-tickets?${qs.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setTickets(json.data.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, priorityFilter]);

    const handleLogNewTicket = () => {
        setSource("Phone Call");
        setType("General Inquiry");
        setRelatedBookingId("");
        setRelatedUserId("");
        setSubject("");
        setDescription("");
        setPriority("MEDIUM");
        setStatus("OPEN");
        setLogModalOpen(true);
    };

    const submitTicket = async () => {
        if (!subject || !description) return alert("Subject and Description are required");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/support-tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    source, type, relatedBookingId, relatedUserId, subject, description, priority, status
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Ticket logged successfully");
                setLogModalOpen(false);
                fetchTickets();
            } else {
                alert(json.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error logging ticket");
        }
    };

    const handleRowClick = (ticket: any) => {
        setSelectedTicket(ticket);
        setResolution(ticket.resolution || "");
        setUpdateStatus(ticket.status);
        setDetailModalOpen(true);
    };

    const saveTicketUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/support-tickets/${selectedTicket.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: updateStatus, resolution })
            });
            const json = await res.json();
            if (json.success) {
                alert("Ticket updated");
                setDetailModalOpen(false);
                fetchTickets();
            } else {
                alert(json.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto flex-1">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Log</h1>
                    <p className="text-muted-foreground mt-1">Manual ticketing for Phone, WhatsApp and Email</p>
                </div>
                <Button onClick={handleLogNewTicket} className="bg-indigo-600 hover:bg-indigo-700">+ Log New Ticket</Button>
            </div>

            <Card>
                <CardHeader className="py-4 bg-muted/30">
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">Priority</Label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-40 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Priorities</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Subject & Booking</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-10">Loading tickets...</TableCell></TableRow>
                        ) : tickets.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-10">No support tickets found</TableCell></TableRow>
                        ) : (
                            tickets.map(t => (
                                <TableRow key={t.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleRowClick(t)}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(t.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-medium text-xs">{t.source}</TableCell>
                                    <TableCell className="text-xs">{t.type}</TableCell>
                                    <TableCell>
                                        <div className="font-medium line-clamp-1">{t.subject}</div>
                                        {t.relatedBookingId && (
                                            <div className="text-xs text-indigo-600">Booking: {t.relatedBookingId}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[10px] uppercase ${t.priority === 'CRITICAL' ? 'text-red-700 bg-red-50' : t.priority === 'HIGH' ? 'text-orange-700 bg-orange-50' : ''}`}>
                                            {t.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={t.status === 'OPEN' ? 'destructive' : t.status === 'RESOLVED' ? 'default' : t.status === 'CLOSED' ? 'secondary' : 'outline'} className="text-[10px] uppercase">
                                            {t.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-800 text-xs">Manage →</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Log New Support Ticket</DialogTitle>
                        <DialogDescription>Manually log a customer or pandit interaction</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                        <div className="space-y-2">
                            <Label>Source</Label>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="In-App">In-App form</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Booking Issue">Booking Issue</SelectItem>
                                    <SelectItem value="Payment Issue">Payment Issue</SelectItem>
                                    <SelectItem value="Travel Issue">Travel Issue</SelectItem>
                                    <SelectItem value="Pandit Complaint">Pandit Complaint</SelectItem>
                                    <SelectItem value="Customer Complaint">Customer Complaint</SelectItem>
                                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Related Booking ID (optional)</Label>
                            <Input value={relatedBookingId} onChange={e => setRelatedBookingId(e.target.value)} placeholder="e.g. cuidxxxx" />
                        </div>
                        <div className="space-y-2">
                            <Label>Customer/Pandit Phone (optional)</Label>
                            <Input value={relatedUserId} onChange={e => setRelatedUserId(e.target.value)} placeholder="e.g. 9876543210" />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Subject <span className="text-red-500">*</span></Label>
                            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary" />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Description <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Full details of the call or message..."
                                className="h-24"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Initial Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogModalOpen(false)}>Cancel</Button>
                        <Button onClick={submitTicket} className="bg-indigo-600 hover:bg-indigo-700">Submit Ticket</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center pr-4">
                            <span>Manage Ticket</span>
                            <Badge variant={selectedTicket?.priority === 'CRITICAL' ? 'destructive' : 'secondary'} className="uppercase">
                                {selectedTicket?.priority} PRIORITY
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedTicket && (
                        <div className="space-y-4 py-4 text-sm">
                            <div className="bg-muted p-4 rounded-md space-y-2">
                                <h3 className="font-bold text-lg mb-2">{selectedTicket.subject}</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <span className="text-muted-foreground">Source: <b className="text-foreground">{selectedTicket.source}</b></span>
                                    <span className="text-muted-foreground">Type: <b className="text-foreground">{selectedTicket.type}</b></span>
                                    <span className="text-muted-foreground">Booking: <a href={`/bookings/${selectedTicket.relatedBookingId}`} className="text-indigo-600 underline font-bold">{selectedTicket.relatedBookingId || 'N/A'}</a></span>
                                    <span className="text-muted-foreground">User: <b className="text-foreground">{selectedTicket.relatedUserId || 'N/A'}</b></span>
                                    <span className="text-muted-foreground col-span-2 mt-1">Logged: <b className="text-foreground">{new Date(selectedTicket.createdAt).toLocaleString()}</b></span>
                                </div>
                            </div>

                            <div className="border p-3 rounded-md bg-white">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Description</Label>
                                <p className="mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Resolution Notes</Label>
                                    <Textarea
                                        value={resolution}
                                        onChange={e => setResolution(e.target.value)}
                                        placeholder="Add resolution details..."
                                        className="h-20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Update Status</Label>
                                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Close</Button>
                        <Button onClick={saveTicketUpdate} className="bg-indigo-600 hover:bg-indigo-700">Save Updates</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
