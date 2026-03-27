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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hmarepanditji/ui/components/ui/select";
import { Label } from "@hmarepanditji/ui/components/ui/label";

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalGmv: 0, thisMonthGmv: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [status, setStatus] = useState(&quot;&quot;);
  const [dateFrom, setDateFrom] = useState(&quot;&quot;);
  const [dateTo, setDateTo] = useState(&quot;&quot;);
  const [city, setCity] = useState(&quot;&quot;);
  const [pandit, setPandit] = useState(&quot;&quot;);
  const [customer, setCustomer] = useState(&quot;&quot;);
  const [paymentStatus, setPaymentStatus] = useState(&quot;&quot;);
  const [travelStatus, setTravelStatus] = useState(&quot;&quot;);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(&quot;token&quot;);
      const qs = new URLSearchParams();
      if (status && status !== &quot;ALL&quot;) qs.append(&quot;status&quot;, status);
      if (dateFrom) qs.append(&quot;dateFrom&quot;, dateFrom);
      if (dateTo) qs.append(&quot;dateTo&quot;, dateTo);
      if (city) qs.append(&quot;city&quot;, city);
      if (pandit) qs.append(&quot;pandit&quot;, pandit);
      if (customer) qs.append(&quot;customer&quot;, customer);
      if (paymentStatus && paymentStatus !== &quot;ALL&quot;) qs.append(&quot;paymentStatus&quot;, paymentStatus);
      if (travelStatus && travelStatus !== &quot;ALL&quot;) qs.append(&quot;travelStatus&quot;, travelStatus);
      qs.append(&quot;page&quot;, page.toString());
      qs.append(&quot;limit&quot;, limit.toString());

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || &apos;http://localhost:3001/api/v1&apos;}/admin/bookings?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setBookings(json.data.data || json.data || []);
        setTotal(json.data.pagination?.total || 0);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchBookings();
  };

  const handleResetFilters = () => {
    setStatus(&quot;ALL&quot;);
    setDateFrom(&quot;&quot;);
    setDateTo(&quot;&quot;);
    setCity(&quot;&quot;);
    setPandit(&quot;&quot;);
    setCustomer(&quot;&quot;);
    setPaymentStatus(&quot;ALL&quot;);
    setTravelStatus(&quot;ALL&quot;);
    setPage(1);
    setTimeout(() => fetchBookings(), 0);
  };

  const exportCSV = () => {
    const csvRows = [
      [&quot;BookingID&quot;, &quot;Customer&quot;, &quot;Pandit&quot;, &quot;Event&quot;, &quot;Date&quot;, &quot;Status&quot;, &quot;Amount&quot;, &quot;Payment&quot;, &quot;Travel&quot;]
    ];

    bookings.forEach(b => {
      csvRows.push([
        b.bookingNumber,
        b.customer?.name || &quot;N/A&quot;,
        b.pandit?.name || &quot;N/A&quot;,
        b.eventType,
        new Date(b.eventDate).toLocaleDateString(),
        b.status,
        b.grandTotal.toString(),
        b.paymentStatus,
        b.travelStatus
      ]);
    });

    const csvString = csvRows.map(row => row.join(&quot;,&quot;)).join(&quot;\n&quot;);
    const blob = new Blob([csvString], { type: &quot;text/csv&quot; });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement(&quot;a&quot;);
    a.href = url;
    a.download = `bookings_export_${new Date().toISOString().split(&quot;T&quot;)[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto flex-1">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
          <p className="text-muted-foreground mt-1">Comprehensive booking management overview</p>
        </div>
        <div className="text-sm font-medium bg-muted p-2 px-4 rounded-md">
          Showing <span className="text-indigo-600 font-bold">{total}</span> bookings |
          Total GMV: <span className="font-bold text-green-600 border-r pr-2 mr-2 ml-1">₹{stats.totalGmv || 0}</span>
          This month: <span className="font-bold">₹{stats.thisMonthGmv || 0}</span>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="TRAVEL_BOOKED">Travel Booked</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date Range (Start)</Label>
              <Input type="date" className="h-9" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date Range (End)</Label>
              <Input type="date" className="h-9" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">City</Label>
              <Input placeholder="Search city..." className="h-9" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pandit (Name/Phone)</Label>
              <Input placeholder="Search pandit..." className="h-9" value={pandit} onChange={e => setPandit(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Customer (Name/Phone)</Label>
              <Input placeholder="Search customer..." className="h-9" value={customer} onChange={e => setCustomer(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Payment</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Payments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CAPTURED">Captured</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Travel</Label>
              <Select value={travelStatus} onValueChange={setTravelStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Travel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Travel</SelectItem>
                  <SelectItem value="NOT_REQUIRED">Not Required</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-2">
              <Button onClick={handleApplyFilters} className="bg-indigo-600 hover:bg-indigo-700 w-full">Apply Filters</Button>
              <Button onClick={handleResetFilters} variant="outline" className="w-full">Reset</Button>
              <Button onClick={exportCSV} variant="secondary" className="w-full">📥 Export CSV</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead># / Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Pandit</TableHead>
              <TableHead>Event & Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Travel</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-10">Loading bookings...</TableCell></TableRow>
            ) : bookings.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-10">No bookings match the current filters</TableCell></TableRow>
            ) : (
              bookings.map((b, i) => (
                <TableRow key={b.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="text-xs text-muted-foreground">{(page - 1) * limit + i + 1}</div>
                    <a href={`/bookings/${b.id}`} className="text-indigo-600 hover:underline font-bold text-sm">
                      {b.bookingNumber}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{b.customer?.name}</div>
                    <div className="text-xs text-muted-foreground">{b.customer?.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{b.pandit?.name}</div>
                    <div className="text-xs text-muted-foreground">{b.pandit?.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{b.eventType}</div>
                    <div className="text-xs font-mono">{new Date(b.eventDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "COMPLETED" ? "default" : b.status === "CANCELLED" ? "destructive" : "secondary"} className="text-[10px] lowercase">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">₹{b.grandTotal}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${b.paymentStatus === 'CAPTURED' ? 'text-green-600 border-green-600' : ''}`}>
                      {b.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {b.travelStatus !== &quot;NOT_REQUIRED&quot; && (
                      <Badge variant="outline" className={`text-[10px] ${b.travelStatus === 'BOOKED' ? 'bg-indigo-50 text-indigo-700' : ''}`}>
                        {b.travelStatus}
                      </Badge>
                    )}
                    {b.travelStatus === &quot;NOT_REQUIRED&quot; && <span className="text-xs text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <a href={`/bookings/${b.id}?reassign=true`} className="text-xs text-muted-foreground hover:text-indigo-600 border p-1 rounded mr-2" title="Reassign">
                      👳
                    </a>
                    <a href={`/bookings/${b.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
                      View →
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t bg-muted/20">
          <div className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / limit) || 1}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
