import { useState, useCallback } from 'react';
import { useToast } from '@hmarepanditji/ui';
import type { RazorpayOptions, RazorpayResponse } from '@hmarepanditji/types';

export function useRazorpay() {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            const existingScript = document.getElementById('razorpay-checkout-js');
            if (existingScript) return resolve(true);

            const script = document.createElement('script');
            script.id = 'razorpay-checkout-js';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const openCheckout = useCallback(async (
        orderId: string,
        amount: number,
        booking: Record<string, unknown>,
        user: Record<string, unknown>,
        onSuccess: (bookingNumber: string) => void
    ) => {
        setIsProcessing(true);
        const loaded = await loadRazorpayScript();

        if (!loaded) {
            toast({ variant: 'error', title: 'Error', message: 'Razorpay SDK failed to load. Are you online?' });
            setIsProcessing(false);
            return;
        }

        const options: RazorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || (() => { throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable is required'); })(),
            amount: amount * 100, // expecting rupees as input, converting to paise
            currency: 'INR',
            name: 'HmarePanditJi',
            description: `${booking.eventType || 'Puja'} Booking - ${booking.bookingNumber || ''}`,
            order_id: orderId,
            theme: { color: '#f49d25' },
            prefill: {
                name: String(user?.name || ''),
                contact: String(user?.phone || ''),
            },
            handler: async (response: RazorpayResponse) => {
                try {
                    // Verify payment
                    const result = await fetch('/api/payments/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('hpj_token')}`
                        },
                        body: JSON.stringify({
                            bookingId: booking.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                    });

                    const verificationData = await result.json();
                    if (result.ok && verificationData.success) {
                        onSuccess(verificationData.data.booking.bookingNumber);
                    } else {
                        toast({ variant: 'error', title: 'Error', message: verificationData.message || 'Payment verification failed.' });
                    }
                } catch (error) {
                    console.error(error);
                    toast({ variant: 'error', title: 'Error', message: 'Payment verification failed.' });
                } finally {
                    setIsProcessing(false);
                }
            },
            modal: {
                ondismiss: () => {
                    toast({ variant: 'info', title: 'Cancelled', message: 'Payment cancelled.' });
                    setIsProcessing(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: { error: { description: string } }) {
            toast({ variant: 'error', title: 'Error', message: 'Payment Failed: ' + response.error.description });
        });
        rzp.open();
    }, [toast]);

    return { openCheckout, isProcessing };
}
