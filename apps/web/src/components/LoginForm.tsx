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

    const handleLoginSuccess = (user: { role?: string; panditProfile?: { verificationStatus?: string };[key: string]: unknown }) => {
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
            <div className="flex bg-gray-100 rounded-2xl p-2 mb-8">
                <button
                    onClick={() => { setRole('CUSTOMER'); setStep(1); setError(''); }}
                    className={`flex-1 py-5 px-6 rounded-2xl font-bold text-[22px] transition-all duration-300 min-h-[72px] ${role === 'CUSTOMER' ? 'bg-white shadow-md text-[#f49d25]' : 'text-gray-500 hover:text-gray-700'}`}
                    disabled={loading || step === 3}
                    type="button"
                >
                    🙏 मैं ग्राहक हूँ
                </button>
                <button
                    onClick={() => {
                        const panditUrl = process.env.NEXT_PUBLIC_PANDIT_URL || 'http://localhost:3002';
                        window.location.href = panditUrl;
                    }}
                    className={`flex-1 py-5 px-6 rounded-2xl font-bold text-[22px] transition-all duration-300 min-h-[72px] ${role === 'PANDIT' ? 'bg-white shadow-md text-[#f09942]' : 'text-gray-500 hover:text-gray-700'}`}
                    disabled={loading || step === 3}
                    type="button"
                >
                    📿 मैं पंडित हूँ
                </button>
            </div>

            <div className="mb-6 text-center">
                {role === 'CUSTOMER' ? (
                    <h2 className="text-gray-700 font-bold text-[28px]">स्वागतम्</h2>
                ) : (
                    <div>
                        <h2 className={`font-bold text-[32px] mb-2 ${textColor}`}>नमस्ते पंडित जी</h2>
                        <p className="text-gray-500 font-bold text-[24px]">500+ सत्यापित पंडितों से जुड़ें।</p>
                    </div>
                )}
            </div>

            <div className="w-full">
                {/* Step 1: Phone */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-[22px] font-bold text-gray-700 mb-3">मोबाइल नंबर</label>
                            <div className="flex relative items-center border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all min-h-[72px]">
                                <span className="px-6 py-6 text-[24px] font-bold text-gray-500 bg-gray-50 border-r border-gray-200 select-none">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="flex-1 px-6 py-6 outline-none text-[28px] font-bold bg-white min-h-[72px]"
                                    placeholder="98765 43210"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                            {error && <p className="text-error text-[22px] font-bold mt-3">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || phone.length !== 10}
                            className={`w-full min-h-[72px] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all ${activeColor} disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-[28px]`}
                        >
                            {loading ? (
                                <span className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>OTP भेजें <span aria-hidden>→</span></>
                            )}
                        </button>
                        <p className="text-[20px] text-center text-gray-400 font-medium">कोई खाता नहीं चाहिए — हम आपके लिए एक बना देंगे</p>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-600 font-bold text-[22px]">
                                OTP भेजा गया: <strong>+91 {phone.substring(0, 5)}-{phone.substring(5)}</strong>
                            </p>
                            <button onClick={() => setStep(1)} className={`text-[22px] font-bold ${textColor} mt-2 hover:underline min-h-[56px]`} type="button">
                                [बदलें]
                            </button>
                        </div>

                        <div className="text-center text-[22px] font-bold text-amber-700 bg-amber-50 px-6 py-4 rounded-2xl min-h-[72px]">
                            डेवलपमेंट मोड: 1-2-3-4-5-6 का उपयोग करें
                        </div>

                        <OtpInput length={6} onComplete={verifyOtpSubmit} disabled={loading} />

                        {error && <p className="text-red-500 text-[22px] font-bold text-center">{error}</p>}

                        <div className="text-center mt-4">
                            {countdown > 0 ? (
                                <p className="text-[20px] text-gray-400 font-medium">
                                    OTP फिर से भेजें 00:{countdown.toString().padStart(2, '0')} में
                                </p>
                            ) : (
                                <button
                                    disabled={loading}
                                    onClick={handleSendOtp}
                                    className={`text-[22px] font-bold ${textColor} hover:underline min-h-[56px]`}
                                    type="button"
                                >
                                    OTP फिर से भेजें
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Name collection (new users only) */}
                {step === 3 && (
                    <form onSubmit={handleNameSubmit} className="space-y-6">
                        <div className="text-center mb-4">
                            {role === 'PANDIT' ? (
                                <>
                                    <h3 className="text-[26px] font-bold text-gray-900 mb-3">स्वागतम्! कृपया जारी रखने के लिए अपना नाम दर्ज करें।</h3>
                                    <div className="p-6 mt-3 rounded-2xl bg-orange-50 text-orange-800 text-[22px] font-bold text-left min-h-[120px] border-3 border-orange-200">
                                        📋 लॉगिन के बाद, आपको बुकिंग प्राप्त शुरू करने के लिए अपनी प्रोफ़ाइल पूरी करनी होगी। इसमें लगभग 10 मिनट लगते हैं।
                                    </div>
                                </>
                            ) : (
                                <h3 className="text-[26px] font-bold text-gray-900 mb-3">हम आपको क्या कहें?</h3>
                            )}
                        </div>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-6 py-6 min-h-[72px] border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-[28px] font-bold"
                            placeholder="आपका पूरा नाम"
                            disabled={loading}
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-[22px] font-bold mt-3">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className={`w-full min-h-[72px] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all ${activeColor} disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-[28px]`}
                        >
                            {loading ? (
                                <span className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'शुरू करें →'
                            )}
                        </button>
                    </form>
                )}
            </div>

            {!hideGuestLink && role === 'CUSTOMER' && step === 1 && (
                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                    <span className="text-[20px] text-gray-400 font-medium">सिर्फ देख रहे हैं? </span>
                    <Link href="/" className={`font-bold text-[22px] ${textColor} hover:underline`}>
                        अतिथि के रूप में जारी रखें →
                    </Link>
                </div>
            )}

            {/* Accessibility: Login link for returning Pandits - Hindi text */}
            {role === 'PANDIT' && step === 1 && (
                <div className="text-center mt-6 pt-6 border-t border-gray-100">
                    <Link href="/login" className={`font-bold text-[24px] ${textColor} hover:underline`}>
                        पहले से पंजीकृत? लॉगिन करें
                    </Link>
                </div>
            )}
        </div>
    );
}
