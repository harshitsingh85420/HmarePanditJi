"use client";

export default function B2BInvoicePage() {
    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] font-display text-slate-800 dark:text-slate-200 min-h-screen flex flex-col items-center p-4 lg:p-8">

            {/* ── Action Toolbar (No Print) ─────────────────────────────────────── */}
            <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <span className="hover:text-[#0f49bd] cursor-pointer">Invoices</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span>#HPJ-2023-894</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoice Details</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">email</span>
                        Email
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0f49bd] hover:bg-[#0f49bd]/90 text-white rounded-lg transition-colors shadow-md text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Download PDF
                    </button>
                </div>
            </div>

            {/* ── Invoice Paper Container ────────────────────────────────────────── */}
            <div className="w-full max-w-5xl bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative invoice-container print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">

                {/* Status Badge */}
                <div className="absolute top-0 right-0 p-8 print:hidden">
                    <div className="border-2 border-green-600 text-green-600 font-bold px-4 py-1 rounded uppercase tracking-widest text-sm transform rotate-12 opacity-80">
                        PAID
                    </div>
                </div>

                {/* Header Strip */}
                <div className="h-2 w-full bg-gradient-to-r from-[#0f49bd] to-[#0f49bd]/70"></div>

                <div className="p-8 md:p-12">

                    {/* Invoice Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded bg-[#0f49bd] flex items-center justify-center text-white font-bold text-xl">H</div>
                                <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">HmarePanditJi</span>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                                <p className="font-medium text-slate-900 dark:text-white">HmarePanditJi Logistics Pvt Ltd</p>
                                <p>GSTIN: 09AAACH7362H1Z2</p>
                                <p>Tower B, Cyber City Hub</p>
                                <p>Gurugram, Haryana, 122002</p>
                                <p>support@hmarepanditji.com</p>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 text-right">
                            <h2 className="text-4xl font-light text-[#0f49bd] mb-2">INVOICE</h2>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between md:justify-end gap-8 border-b border-slate-100 dark:border-slate-800 pb-1">
                                    <span className="text-slate-500 dark:text-slate-400">Invoice No:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">HPJ-B2B-2023-894</span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-8 border-b border-slate-100 dark:border-slate-800 pb-1">
                                    <span className="text-slate-500 dark:text-slate-400">Date Issued:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">Oct 24, 2023</span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-8 pb-1">
                                    <span className="text-slate-500 dark:text-slate-400">Due Date:</span>
                                    <span className="font-medium text-[#FF9933]">Nov 07, 2023</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To / Service Info */}
                    <div className="flex flex-col md:flex-row gap-8 mb-12">
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bill To</h3>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                <p className="font-bold text-lg text-[#0f49bd] mb-1">TechNova Solutions Pvt Ltd</p>
                                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    <p>Attn: Finance Department</p>
                                    <p>Prestige Tech Park, Marathahalli</p>
                                    <p>Bangalore, Karnataka, 560103</p>
                                    <p className="mt-2"><span className="font-medium text-slate-500">GSTIN:</span> 29AAACT3829K1Z5</p>
                                    <p><span class="font-medium text-slate-500">PO Ref:</span> TN-EVT-2309</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Service Details</h3>
                            <div className="bg-[#0f49bd]/5 dark:bg-[#0f49bd]/10 p-4 rounded-lg border border-[#0f49bd]/10">
                                <p className="font-bold text-lg text-slate-900 dark:text-white mb-1">Vedic Wedding Logistics</p>
                                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    <p><span className="font-medium text-[#0f49bd]">Event:</span> Annual Corporate Diwali Puja &amp; Celebration</p>
                                    <p><span className="font-medium text-[#0f49bd]">Venue:</span> TechNova Campus, Main Hall</p>
                                    <p><span className="font-medium text-[#0f49bd]">Date:</span> Oct 20, 2023</p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Logistics
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                            Religious Service
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#0f49bd] text-white">
                                <tr>
                                    <th className="py-3 px-4 font-semibold w-12">#</th>
                                    <th className="py-3 px-4 font-semibold">Description</th>
                                    <th className="py-3 px-4 font-semibold w-32 text-center">HSN/SAC</th>
                                    <th className="py-3 px-4 font-semibold w-24 text-center">Qty</th>
                                    <th className="py-3 px-4 font-semibold w-32 text-right">Rate</th>
                                    <th className="py-3 px-4 font-semibold w-32 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-4 px-4 text-slate-500">01</td>
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-slate-900 dark:text-white">Head Pandit Dakshina (Vedic Rituals)</p>
                                        <p className="text-xs text-slate-500">Honorarium for 3 Priests for 4 hours</p>
                                    </td>
                                    <td className="py-4 px-4 text-center text-slate-500">999799</td>
                                    <td className="py-4 px-4 text-center text-slate-900 dark:text-white">1</td>
                                    <td className="py-4 px-4 text-right text-slate-900 dark:text-white">₹51,000.00</td>
                                    <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">₹51,000.00</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-4 px-4 text-slate-500">02</td>
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-slate-900 dark:text-white">Premium Samagri Kit</p>
                                        <p className="text-xs text-slate-500">Complete puja items, flowers, and fruits</p>
                                    </td>
                                    <td className="py-4 px-4 text-center text-slate-500">998599</td>
                                    <td className="py-4 px-4 text-center text-slate-900 dark:text-white">1</td>
                                    <td className="py-4 px-4 text-right text-slate-900 dark:text-white">₹15,000.00</td>
                                    <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">₹15,000.00</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-4 px-4 text-slate-500">03</td>
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-slate-900 dark:text-white">Travel &amp; Logistics</p>
                                        <p className="text-xs text-slate-500">Transportation for team and materials</p>
                                    </td>
                                    <td className="py-4 px-4 text-center text-slate-500">996412</td>
                                    <td className="py-4 px-4 text-center text-slate-900 dark:text-white">1</td>
                                    <td className="py-4 px-4 text-right text-slate-900 dark:text-white">₹5,000.00</td>
                                    <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">₹5,000.00</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-4 px-4 text-slate-500">04</td>
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-slate-900 dark:text-white">Accommodation Handling</p>
                                        <p className="text-xs text-slate-500">Overnight stay arrangement near venue</p>
                                    </td>
                                    <td className="py-4 px-4 text-center text-slate-500">996311</td>
                                    <td className="py-4 px-4 text-center text-slate-900 dark:text-white">2</td>
                                    <td className="py-4 px-4 text-right text-slate-900 dark:text-white">₹2,500.00</td>
                                    <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">₹5,000.00</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-slate-50 dark:bg-slate-800/20">
                                    <td className="py-4 px-4 text-slate-500">05</td>
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-[#0f49bd]">Platform Facilitation Fee</p>
                                        <p className="text-xs text-slate-500">Service charge for booking via HmarePanditJi</p>
                                    </td>
                                    <td className="py-4 px-4 text-center text-slate-500">998311</td>
                                    <td className="py-4 px-4 text-center text-slate-900 dark:text-white">1</td>
                                    <td className="py-4 px-4 text-right text-slate-900 dark:text-white">₹2,500.00</td>
                                    <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">₹2,500.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="flex flex-col md:flex-row justify-between mb-12">
                        {/* Left: Notes & Bank Info */}
                        <div className="w-full md:w-1/2 md:pr-12 mb-8 md:mb-0">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-2">Bank Details for Wire Transfer</h4>
                                <div className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-y-1">
                                    <span>Bank Name:</span> <span className="font-medium text-slate-800 dark:text-slate-300">HDFC Bank</span>
                                    <span>Account Name:</span> <span className="font-medium text-slate-800 dark:text-slate-300">HmarePanditJi Logistics Pvt Ltd</span>
                                    <span>Account No:</span> <span className="font-medium text-slate-800 dark:text-slate-300">50200012345678</span>
                                    <span>IFSC Code:</span> <span className="font-medium text-slate-800 dark:text-slate-300">HDFC0001234</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-1">Terms &amp; Conditions</h4>
                                <ul className="list-disc list-inside text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                    <li>Payment is due within 15 days of invoice date.</li>
                                    <li>Late payments may incur a 2% monthly interest charge.</li>
                                    <li>Dakshina component is exempt from GST under Notification No. 12/2017.</li>
                                    <li>Disputes must be raised within 3 days of receiving this invoice.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Right: Calculations */}
                        <div className="w-full md:w-1/2 md:pl-8">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>Subtotal</span>
                                    <span className="font-medium">₹78,500.00</span>
                                </div>
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs italic">
                                    <span>(Less: GST Exempt Dakshina)</span>
                                    <span>(- ₹51,000.00)</span>
                                </div>
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs italic pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <span>Taxable Value</span>
                                    <span>₹27,500.00</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>IGST (18%)</span>
                                    <span className="font-medium">₹4,950.00</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>Platform Fee GST (18%)</span>
                                    <span className="font-medium">₹450.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200 dark:border-slate-700 mt-2">
                                    <span className="font-bold text-lg text-slate-900 dark:text-white">Total Payable</span>
                                    <span className="font-bold text-2xl text-[#0f49bd]">₹83,900.00</span>
                                </div>
                                <div className="text-right text-xs text-slate-500 mt-1">
                                    (Eighty-Three Thousand Nine Hundred Rupees Only)
                                </div>
                            </div>

                            {/* Signature Area */}
                            <div className="mt-12 text-right">
                                <div className="inline-block relative">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoZhmuCvtekLb8FNjlb9HryPfdP44dZon86JjJepfRy0E46K2fKkrpnRCXUiPYgdhJLfjZxb4QCManPLO9MEP_nTUURrDJVSwWWoZ5YDH33TM9k2wv1GljopP_uUy8OKODXaffYDR_xEipT-j0mM61yw2JIDr0-WT_EjAz3c4bXe9P0b2yxz0BDqOVaYcRnIGxFrHS-nStmQFKny5hTrdD9Zi-4dK1YIOCUaEbKh_qBYnfMxvp64t6Le3YGSkgNiBfavavMtCEGC0"
                                        className="w-32 h-12 object-contain opacity-60 mix-blend-multiply dark:mix-blend-lighten mb-1 grayscale contrast-150"
                                        alt="Signature"
                                    />
                                    <div className="h-px w-48 bg-slate-300 dark:bg-slate-600 ml-auto"></div>
                                </div>
                                <p className="text-xs font-bold text-slate-700 dark:text-white mt-1">Authorized Signatory</p>
                                <p className="text-[10px] text-slate-500">For HmarePanditJi Logistics Pvt Ltd</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Strip */}
                    <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 text-center">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Thank you for your business!</p>
                        <p className="text-xs text-slate-400">This is a computer-generated invoice and does not require a physical signature.</p>
                    </div>
                </div>

                <div className="h-16 w-full print:hidden"></div>
            </div>
        </div>
    );
}
