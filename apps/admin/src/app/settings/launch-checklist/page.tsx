'use client';

import React, { useState, useEffect } from 'react';

const CHECKLIST_KEY = 'hpj_launch_checklist';

const CHECKLIST_CATEGORIES = [
    {
        title: 'PLATFORM READINESS',
        items: [
            { id: 'plat_1', label: '10+ pandits onboarded and VERIFIED' },
            { id: 'plat_2', label: 'Muhurat data loaded for next 6 months' },
            { id: 'plat_3', label: 'All puja types have at least 2 verified pandits' },
            { id: 'plat_4', label: 'Platform fee rates configured correctly' },
            { id: 'plat_5', label: 'Cancellation policy matches legal page' }
        ]
    },
    {
        title: 'PAYMENT',
        items: [
            { id: 'pay_1', label: 'Razorpay switched from test to live mode' },
            { id: 'pay_2', label: 'Razorpay webhook endpoint verified' },
            { id: 'pay_3', label: 'Test payment → refund cycle completed' },
            { id: 'pay_4', label: 'GST details configured in Razorpay' }
        ]
    },
    {
        title: 'NOTIFICATIONS',
        items: [
            { id: 'notif_1', label: 'Twilio credentials configured (or mock mode confirmed)' },
            { id: 'notif_2', label: 'All 19 notification templates verified' },
            { id: 'notif_3', label: 'SMS sender ID registered' }
        ]
    },
    {
        title: 'TECHNICAL',
        items: [
            { id: 'tech_1', label: 'All 3 apps build successfully (npm run build)' },
            { id: 'tech_2', label: 'Database migrations applied to production' },
            { id: 'tech_3', label: 'Seed data NOT applied to production' },
            { id: 'tech_4', label: 'Environment variables set for production' },
            { id: 'tech_5', label: 'Error boundaries working on all apps' },
            { id: 'tech_6', label: '404 pages in place' },
            { id: 'tech_7', label: 'HTTPS configured' },
            { id: 'tech_8', label: 'CORS configured for production domains' }
        ]
    },
    {
        title: 'CONTENT',
        items: [
            { id: 'con_1', label: 'SEO meta tags verified (check with Google Rich Results Test)' },
            { id: 'con_2', label: 'robots.txt and sitemap.xml accessible' },
            { id: 'con_3', label: 'Terms of Service reviewed by legal' },
            { id: 'con_4', label: 'Privacy Policy reviewed by legal' },
            { id: 'con_5', label: 'Cancellation Policy matches code logic' },
            { id: 'con_6', label: 'About page content finalized' }
        ]
    },
    {
        title: 'TESTING',
        items: [
            { id: 'test_1', label: 'Complete customer booking flow tested end-to-end' },
            { id: 'test_2', label: 'Pandit onboarding tested end-to-end' },
            { id: 'test_3', label: 'Admin travel desk workflow tested' },
            { id: 'test_4', label: 'Admin payout workflow tested' },
            { id: 'test_5', label: 'Cancellation + refund flow tested' },
            { id: 'test_6', label: 'Review submission tested' },
            { id: 'test_7', label: 'Mobile responsive verified (all 3 apps)' },
            { id: 'test_8', label: 'Guest mode flow verified (browse → book → register)' },
            { id: 'test_9', label: 'Voice narration tested on pandit app' },
            { id: 'test_10', label: 'Muhurat Explorer calendar working correctly' }
        ]
    },
    {
        title: 'OPERATIONAL',
        items: [
            { id: 'ops_1', label: 'Admin accounts created for operations team' },
            { id: 'ops_2', label: 'Support phone number configured' },
            { id: 'ops_3', label: 'Emergency procedures documented' },
            { id: 'ops_4', label: 'Backup & recovery plan in place' }
        ]
    }
];

export default function LaunchChecklist() {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(CHECKLIST_KEY);
        if (saved) {
            setCheckedItems(JSON.parse(saved));
        }
        setIsLoaded(true);
    }, []);

    const toggleItem = (id: string) => {
        const newItems = { ...checkedItems, [id]: !checkedItems[id] };
        setCheckedItems(newItems);
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(newItems));
    };

    const getProgress = () => {
        let total = 0;
        let completed = 0;
        CHECKLIST_CATEGORIES.forEach(cat => {
            total += cat.items.length;
            cat.items.forEach(item => {
                if (checkedItems[item.id]) completed++;
            });
        });
        return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    if (!isLoaded) return <div className="p-8">Loading checklist...</div>;

    const progress = getProgress();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Go-Live Checklist</h1>
                <p className="text-gray-600">Complete pre-launch readiness checks below. Changes are saved locally to your browser.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 sticky top-0 z-10">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-3xl font-black text-blue-600">{progress.percentage}%</span>
                        <span className="text-gray-500 ml-2 font-medium">Ready for Launch</span>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        {progress.completed} of {progress.total} completed
                    </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progress.percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            </div>

            <div className="space-y-8">
                {CHECKLIST_CATEGORIES.map(category => (
                    <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                            <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase">{category.title}</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {category.items.map(item => (
                                <label key={item.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition cursor-pointer group">
                                    <div className="relative flex items-center pt-0.5">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer peer"
                                            checked={!!checkedItems[item.id]}
                                            onChange={() => toggleItem(item.id)}
                                        />
                                    </div>
                                    <span className={`text-base font-medium transition ${checkedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center text-gray-500 text-sm">
                <p>This checklist uses Local Storage. Do not clear browser cache if you want to keep your progress.</p>
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to reset all progress?")) {
                            setCheckedItems({});
                            localStorage.removeItem(CHECKLIST_KEY);
                        }
                    }}
                    className="mt-4 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-red-600 font-medium transition"
                >
                    Reset Checklist
                </button>
            </div>
        </div>
    );
}
