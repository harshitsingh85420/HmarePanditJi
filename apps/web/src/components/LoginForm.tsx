'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, API_BASE } from '../context/auth-context';
import { OtpInput } from '@hmarepanditji/ui';
import Link from 'next/link';

interface LoginFormProps {
    onSuccess?: () => void;
    defaultRole?: 'CUSTOMER' | 'PANDIT';
    hideGuestLink?: boolean;
}

export function LoginForm({ onSuccess, defaultRole = 'CUSTOMER', hideGuestLink = false }: LoginFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const nextParam = searchParams?.get('next');

    const [role, setRole] = useState<'CUSTOMER' | 'PANDIT'>(defaultRole);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        const fullPhone = `+91${phone}`;
        if (!/^\+91[6-9]\d{9}$/.test(fullPhone)) {
            setError('Enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone, role }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to send OTP');
            }
            setStep(2);
            setCountdown(30);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error occurred while sending OTP';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpSubmit = async (otpString: string) => {
        setError('');
        setLoading(true);
        const fullPhone = `+91${phone}`;
        try {
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone, otp: otpString, role }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Invalid OTP');
            }

            const token: string = data.data.token ?? data.data.accessToken;
            const userData = data.data.user;
            const isNewUser: boolean = userData?.isNewUser ?? data.data.isNewUser ?? false;

            // Store token + user in context
            login(token, userData);

            if (isNewUser && !userData?.name) {
                setStep(3);
                setLoading(false);
                return;
            } else {
                handleLoginSuccess(userData);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Invalid OTP';
            setError(message);
        } finally {
            if (step !== 3) setLoading(false);
        }
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('hpj_token');
            const res = await fetch(`${API_BASE}/auth/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to update name');
            }
            login(token as string, data.data.user);
            handleLoginSuccess(data.data.user);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (user: { role?: string; panditProfile?: { verificationStatus?: string }; [key: string]: unknown }) => {
        if (onSuccess) {
            onSuccess();
            return;
        }

        const redirectParam = searchParams?.get('redirect');

        if (redirectParam === 'admin') {
            if (user.role !== 'ADMIN') {
                setError('Unauthorized');
                return;
            }
            window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003/';
            return;
        }

        if (user.role === 'PANDIT') {
            const panditUrl = process.env.NEXT_PUBLIC_PANDIT_URL || 'http://localhost:3002';
            if (user.panditProfile?.verificationStatus === 'PENDING' && !nextParam) {
                window.location.href = `${panditUrl}/onboarding`;
            } else {
                window.location.href = nextParam || `${panditUrl}/dashboard`;
            }
        } else if (user.role === 'CUSTOMER') {
            router.push(nextParam || '/');
        } else if (user.role === 'ADMIN') {
            window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003/';
        }
    };

    const activeColor = role === 'PANDIT' ? 'bg-[#f09942]' : 'bg-[#f49d25]';
    const textColor = role === 'PANDIT' ? 'text-[#f09942]' : 'text-[#f49d25]';

    return (
        <div className="w-full">
            {/* Role toggle */}
            <div className="flex bg-gray-100 rounded-full p-1 mb-6">
                <button
                    onClick={() => { setRole('CUSTOMER'); setStep(1); setError(''); }}
                    className={`flex-1 py-2.5 px-6 rounded-full font-bold text-sm transition-all duration-300 ${role === 'CUSTOMER' ? 'bg-white shadow-md text-[#f49d25]' : 'text-gray-500 hover:text-gray-700'}`}
                    disabled={loading || step === 3}
                    type="button"
                >
                    🙏 I&apos;m a Customer
                </button>
                <button
                    onClick={() => { setRole('PANDIT'); setStep(1); setError(''); }}
                    className={`flex-1 py-2.5 px-6 rounded-full font-bold text-sm transition-all duration-300 ${role === 'PANDIT' ? 'bg-white shadow-md text-[#f09942]' : 'text-gray-500 hover:text-gray-700'}`}
                    disabled={loading || step === 3}
                    type="button"
                >
                    📿 I&apos;m a Pandit
                </button>
            </div>

            <div className="mb-6 text-center">
                {role === 'CUSTOMER' ? (
                    <h2 className="text-gray-700 font-semibold text-xl">Welcome back</h2>
                ) : (
                    <div>
                        <h2 className={`font-bold text-xl mb-1 ${textColor}`}>Namaste Pandit Ji</h2>
                        <p className="text-gray-500 font-medium text-sm">Join 500+ verified priests.</p>
                    </div>
                )}
            </div>

            <div className="w-full">
                {/* Step 1: Phone */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                            <div className="flex relative items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all">
                                <span className="px-4 py-4 text-gray-500 font-medium bg-gray-50 border-r border-gray-200 select-none">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="flex-1 px-4 py-4 outline-none text-lg font-medium bg-white"
                                    placeholder="98765 43210"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || phone.length !== 10}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all ${activeColor} disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Send OTP <span aria-hidden>→</span></>
                            )}
                        </button>
                        <p className="text-sm text-center text-gray-400">No account needed — we&apos;ll create one for you</p>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="text-center">
                            <p className="text-gray-600 font-medium">
                                OTP sent to <strong>+91 {phone.substring(0, 5)}-{phone.substring(5)}</strong>
                            </p>
                            <button onClick={() => setStep(1)} className={`text-sm ${textColor} font-semibold mt-1 hover:underline`} type="button">
                                [Change]
                            </button>
                        </div>

                        <div className="text-center text-sm font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
                            Development mode: use 1-2-3-4-5-6
                        </div>

                        <OtpInput length={6} onComplete={verifyOtpSubmit} disabled={loading} />

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div className="text-center mt-2">
                            {countdown > 0 ? (
                                <p className="text-sm text-gray-400">
                                    Resend OTP in 00:{countdown.toString().padStart(2, '0')}
                                </p>
                            ) : (
                                <button
                                    disabled={loading}
                                    onClick={handleSendOtp}
                                    className={`text-sm font-semibold ${textColor} hover:underline`}
                                    type="button"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Name collection (new users only) */}
                {step === 3 && (
                    <form onSubmit={handleNameSubmit} className="space-y-5">
                        <div className="text-center mb-4">
                            {role === 'PANDIT' ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome! Please enter your name to continue.</h3>
                                    <div className="p-4 mt-2 rounded-xl bg-orange-50 text-orange-800 text-sm font-medium text-left">
                                        📋 After login, you&apos;ll complete your profile to start receiving bookings. Takes about 10 minutes.
                                    </div>
                                </>
                            ) : (
                                <h3 className="text-xl font-bold text-gray-900 mb-2">What should we call you?</h3>
                            )}
                        </div>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-lg font-medium"
                            placeholder="Your Full Name"
                            disabled={loading}
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all ${activeColor} disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Get Started →'
                            )}
                        </button>
                    </form>
                )}
            </div>

            {!hideGuestLink && role === 'CUSTOMER' && step === 1 && (
                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                    <span className="text-gray-400">Just exploring? </span>
                    <Link href="/" className={`font-semibold ${textColor} hover:underline`}>
                        Continue as Guest →
                    </Link>
                </div>
            )}
        </div>
    );
}
