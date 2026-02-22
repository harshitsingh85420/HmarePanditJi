"use client";

import React from 'react';
import Link from 'next/link';

export default function PanditSearchResultsFilters() {
  return (
    <>
      {/* Generated from UI pandit_search_results_&_filters */}
      <main className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-64px)] relative">

<aside className="w-full lg:w-[320px] lg:sticky lg:top-16 h-fit p-6 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-background-dark/50 overflow-y-auto">
<div className="flex items-center justify-between mb-6">
<h2 className="text-lg font-bold">Advanced Filters</h2>
<button className="text-primary text-xs font-semibold uppercase tracking-wider">Reset</button>
</div>
<div className="space-y-8">

<div>
<label className="block text-sm font-semibold mb-3">Location</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
<select className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-primary focus:border-primary">
<option>Varanasi, Uttar Pradesh</option>
<option>Haridwar, Uttarakhand</option>
<option>Rishikesh, Uttarakhand</option>
<option>Ujjain, Madhya Pradesh</option>
</select>
</div>
</div>

<div>
<label className="block text-sm font-semibold mb-3">Muhurat Date</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">calendar_month</span>
<input className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-primary focus:border-primary" type="text" value="Oct 24, 2023"/>
</div>
</div>

<div>
<div className="flex justify-between items-center mb-3">
<label className="text-sm font-semibold">Budget (₹)</label>
<span className="text-xs text-slate-500 font-medium">₹5k - ₹50k</span>
</div>
<input className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" type="range"/>
</div>

<div>
<label className="block text-sm font-semibold mb-3">Travel Preferences</label>
<div className="grid grid-cols-2 gap-2">
<button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary bg-primary/10 text-primary text-xs font-medium">
<span className="material-symbols-outlined text-sm">directions_car</span> Self-Drive
                        </button>
<button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:border-primary hover:text-primary transition-all">
<span className="material-symbols-outlined text-sm">flight</span> Flight
                        </button>
<button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:border-primary hover:text-primary transition-all">
<span className="material-symbols-outlined text-sm">train</span> Train
                        </button>
<button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:border-primary hover:text-primary transition-all">
<span className="material-symbols-outlined text-sm">all_inclusive</span> Any
                        </button>
</div>
</div>
</div>
</aside>

<section className="flex-1 p-6 lg:p-10 spiritual-pattern relative">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
<div>
<h2 className="text-2xl font-bold">8 Pandits match your search</h2>
<p className="text-slate-500 text-sm mt-1">Found in Varanasi region for Griha Pravesh</p>
</div>
<div className="flex items-center gap-3">
<span className="text-sm text-slate-500">Sort by:</span>
<select className="bg-white dark:bg-slate-800 border-none rounded-lg text-sm font-semibold focus:ring-primary shadow-sm">
<option>Best Match</option>
<option>Price: Low to High</option>
<option>Rating: High to Low</option>
</select>
</div>
</div>

<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
<div className="p-5 flex gap-5">
<div className="relative flex-shrink-0">
<div className="w-24 h-24 rounded-2xl bg-slate-200 overflow-hidden">
<img alt="Pandit Profile" className="w-full h-full object-cover" data-alt="Portrait of a smiling traditional Indian Pandit" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcE5W6qLFYQoyVOYJMbS39rGvOMpa-2ZfeNehopFjSyAissxcOPPq6NPPunilKYV0oi_dXrQUTazsPTkD2_viZHS7mnYMxxkDa97_cCf5ZuTFUAE5qS7as2-mhRSd2LPtHg9cqiyoCE7Rta6_3pFYnvXNF36TxGjDaKzSBYiBTYDUwy1qHugIVI0Ko_sD4uz1NVDra69QgrdRlk93u-BRa2EoNIHFSp309YnMzwT6Y_-iYD8Ckmu2t3UjGWMPudJB0q7SNZh708YU"/>
</div>
<div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-4 border-white dark:border-slate-900">
<span className="material-symbols-outlined text-xs block">verified</span>
</div>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-2">
<div className="flex flex-wrap gap-2">
<span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Verified Vedic</span>
<span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">directions_car</span> Self-Drive Available
                                    </span>
</div>
</div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white">Acharya Rajesh Shastri</h3>
<div className="flex items-center gap-4 mt-1 text-sm">
<div className="flex items-center gap-1 text-orange-500 font-bold">
<span className="material-symbols-outlined text-sm fill-1">star</span> 4.9 <span className="text-slate-400 font-normal">(124)</span>
</div>
<div className="flex items-center gap-1 text-slate-500">
<span className="material-symbols-outlined text-sm">map</span> 12.5 km away
                                </div>
</div>
</div>
</div>

<div className="mt-auto border-t border-slate-100 dark:border-slate-800">
<div className="flex px-5 pt-4 gap-4 text-xs font-bold text-slate-400 border-b border-slate-50 dark:border-slate-800">
<button className="pb-3 border-b-2 border-primary text-primary flex flex-col items-center gap-1">
<span>SELF-DRIVE</span>
<span className="text-sm font-black">₹22k</span>
</button>
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>TRAIN</span>
<span className="text-sm">₹18k</span>
</button>
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>FLIGHT</span>
<span className="text-sm">₹27k</span>
</button>
</div>
<div className="p-5 flex items-center justify-between gap-4">
<div className="text-xs text-slate-500 leading-tight max-w-[200px]">
<p>Self-drive includes fuel and tolls. Estimated time: 45 mins.</p>
</div>
<button className="bg-primary hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-orange-500/20">
                                Book Now
                            </button>
</div>
</div>
</div>

<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
<div className="p-5 flex gap-5">
<div className="relative flex-shrink-0">
<div className="w-24 h-24 rounded-2xl bg-slate-200 overflow-hidden">
<img alt="Pandit Profile" className="w-full h-full object-cover" data-alt="Portrait of an experienced Indian elder priest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO48XDin4p67038Uhrvr5Ucf81Aw36kv_nZ2iQOuaf1pjIzPv1GZobNe5PqmQnnqt-0NayR7ocA7ZiHMjWuUNkZno00E2ST_26vjNZRDuVDLjUoFVXmRtEGEeosI3JnbljPltDdDxRQPq9Tfs5zUQ_3Z8-ixCw5jWNJ4jHDh4k68qLJzAxXjx09WfHyeWB0JjkEhneYRJCPsnr2i7yo8LT7Ccry_R-TYF136HjW6WU9Ok7kArj03ULZ7M7gMKXDD6ln6EVOz-6AhA"/>
</div>
<div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-4 border-white dark:border-slate-900">
<span className="material-symbols-outlined text-xs block">verified</span>
</div>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-2">
<div className="flex flex-wrap gap-2">
<span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Verified Vedic</span>
<span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">flight</span> Expert Traveler
                                    </span>
</div>
</div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white">Pandit Vishwanath Misra</h3>
<div className="flex items-center gap-4 mt-1 text-sm">
<div className="flex items-center gap-1 text-orange-500 font-bold">
<span className="material-symbols-outlined text-sm fill-1">star</span> 4.7 <span className="text-slate-400 font-normal">(89)</span>
</div>
<div className="flex items-center gap-1 text-slate-500">
<span className="material-symbols-outlined text-sm">map</span> 4.2 km away
                                </div>
</div>
</div>
</div>

<div className="mt-auto border-t border-slate-100 dark:border-slate-800">
<div className="flex px-5 pt-4 gap-4 text-xs font-bold text-slate-400 border-b border-slate-50 dark:border-slate-800">
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>SELF-DRIVE</span>
<span className="text-sm">₹15k</span>
</button>
<button className="pb-3 border-b-2 border-primary text-primary flex flex-col items-center gap-1">
<span>TRAIN</span>
<span className="text-sm font-black">₹12k</span>
</button>
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>FLIGHT</span>
<span className="text-sm">₹21k</span>
</button>
</div>
<div className="p-5 flex items-center justify-between gap-4">
<div className="text-xs text-slate-500 leading-tight max-w-[200px]">
<p>Standard train fare. Pandit prefers local transit from station.</p>
</div>
<button className="bg-primary hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-orange-500/20">
                                Book Now
                            </button>
</div>
</div>
</div>

<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
<div className="p-5 flex gap-5">
<div className="relative flex-shrink-0">
<div className="w-24 h-24 rounded-2xl bg-slate-200 overflow-hidden">
<img alt="Pandit Profile" className="w-full h-full object-cover" data-alt="Portrait of a young Vedic scholar in traditional attire" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb_ytuPc3VMLSkGtlJbNK7edHWa32y082BfR_dm755RIz6mZfqZy99INi0cToeveA2zCqaJyfKaaMs40rQbPNLlBoXnasCItX6Zn6ZfAHBC3o2Vr64JkUXLPSOiJ5jmhIF4pwuZE-e5FTsbMNlqCxcng3Dxf_C1_WFautRb9OmlW1ZhPWZpD1iB8ruTPggz0kpCr7D68DimnAE8chOTdHaH-3jPGu8wZSQDXvj6c3Mf6XMFcGab24l8croqKnCQbDx5KE8_MPGBrE"/>
</div>
<div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-4 border-white dark:border-slate-900">
<span className="material-symbols-outlined text-xs block">verified</span>
</div>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-2">
<div className="flex flex-wrap gap-2">
<span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Verified Vedic</span>
</div>
</div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white">Shree Krishna Dwivedi</h3>
<div className="flex items-center gap-4 mt-1 text-sm">
<div className="flex items-center gap-1 text-orange-500 font-bold">
<span className="material-symbols-outlined text-sm fill-1">star</span> 5.0 <span className="text-slate-400 font-normal">(56)</span>
</div>
<div className="flex items-center gap-1 text-slate-500">
<span className="material-symbols-outlined text-sm">map</span> 21.0 km away
                                </div>
</div>
</div>
</div>

<div className="mt-auto border-t border-slate-100 dark:border-slate-800">
<div className="flex px-5 pt-4 gap-4 text-xs font-bold text-slate-400 border-b border-slate-50 dark:border-slate-800">
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>SELF-DRIVE</span>
<span className="text-sm">₹28k</span>
</button>
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>TRAIN</span>
<span className="text-sm">₹24k</span>
</button>
<button className="pb-3 border-b-2 border-primary text-primary flex flex-col items-center gap-1">
<span>FLIGHT</span>
<span className="text-sm font-black">₹32k</span>
</button>
</div>
<div className="p-5 flex items-center justify-between gap-4">
<div className="text-xs text-slate-500 leading-tight max-w-[200px]">
<p>Flight bookings include airport lounge access for Pandit's rituals.</p>
</div>
<button className="bg-primary hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-orange-500/20">
                                Book Now
                            </button>
</div>
</div>
</div>

<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col opacity-90">
<div className="p-5 flex gap-5">
<div className="relative flex-shrink-0">
<div className="w-24 h-24 rounded-2xl bg-slate-200 overflow-hidden">
<img alt="Pandit Profile" className="w-full h-full object-cover" data-alt="Portrait of a senior Pandit in Varanasi" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOSh_t8egsPEzS7KaNwHwYznV6X_zT3XGPyhZyz1Z4Otye41HJ9kSB6vJj7E0mJkz3thURzgLYDrwaA5N8kS3lFmQ7m20JUWpFIU17GRZrPgpHs-hZrxKYQG2L52NJ3FiE-ZX8W66Fyb4cLrVoAm_pxyUInJyGEnLyhw8kD4j6KlknkjosvBZZTrWPQdjWFusEHuIBSavE89SED_QOB3nNoTZyiK810nhmK02GpUZ1shmSPDgBAMc1x7aRRXU7_eUwYsKvY7iGAIs"/>
</div>
<div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-4 border-white dark:border-slate-900">
<span className="material-symbols-outlined text-xs block">verified</span>
</div>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-2">
<div className="flex flex-wrap gap-2">
<span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Verified Vedic</span>
<span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">directions_car</span> Self-Drive Available
                                    </span>
</div>
</div>
<h3 className="text-lg font-bold text-slate-900 dark:text-white">Acharya Om Prakash</h3>
<div className="flex items-center gap-4 mt-1 text-sm">
<div className="flex items-center gap-1 text-orange-500 font-bold">
<span className="material-symbols-outlined text-sm fill-1">star</span> 4.8 <span className="text-slate-400 font-normal">(212)</span>
</div>
<div className="flex items-center gap-1 text-slate-500">
<span className="material-symbols-outlined text-sm">map</span> 0.5 km away
                                </div>
</div>
</div>
</div>

<div className="mt-auto border-t border-slate-100 dark:border-slate-800">
<div className="flex px-5 pt-4 gap-4 text-xs font-bold text-slate-400 border-b border-slate-50 dark:border-slate-800">
<button className="pb-3 border-b-2 border-primary text-primary flex flex-col items-center gap-1">
<span>SELF-DRIVE</span>
<span className="text-sm font-black">₹19k</span>
</button>
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>TRAIN</span>
<span className="text-sm">₹14k</span>
</button>
<button className="pb-3 border-b-2 border-transparent hover:text-slate-600 flex flex-col items-center gap-1">
<span>FLIGHT</span>
<span className="text-sm">₹25k</span>
</button>
</div>
<div className="p-5 flex items-center justify-between gap-4">
<div className="text-xs text-slate-500 leading-tight max-w-[200px]">
<p>Local neighborhood discount applied for travel under 2km.</p>
</div>
<button className="bg-primary hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-orange-500/20">
                                Book Now
                            </button>
</div>
</div>
</div>
</div>

<div className="mt-12 flex justify-center">
<button className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Load More Results
                    <span className="material-symbols-outlined text-sm">expand_more</span>
</button>
</div>
</section>
</main>
    </>
  );
}
