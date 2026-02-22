"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";

export default function PanditVerificationDetail() {
    const { panditId } = useParams();
    const router = useRouter();
    const [pandit, setPandit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adminNotes, setAdminNotes] = useState("");
    const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | "MORE_INFO" | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectDetail, setRejectDetail] = useState("");
    const [requestedDocs, setRequestedDocs] = useState<string[]>([]);

    const [videoChecks, setVideoChecks] = useState({
        face: false, name: false, experience: false, mantra: false, aadhaar: false, genuine: false
    });
    const allVideoChecked = Object.values(videoChecks).every(Boolean);

    const [docVerdicts, setDocVerdicts] = useState<{ [key: string]: 'PASS' | 'FAIL' | 'RE_UPLOAD' | null }>({
        'Aadhaar Front': null, 'Aadhaar Back': null, 'Selfie with Aadhaar': null
    });
    const allDocsChecked = Object.values(docVerdicts).every(v => v === 'PASS');

    const canApprove = allVideoChecked && allDocsChecked;

    const [documentScale, setDocumentScale] = useState<{ url: string | null; compareUrl?: string | null }>({ url: null });
    const [imgState, setImgState] = useState({ scale: 1, rotation: 0 });

    const handleZoom = (step: number) => setImgState(s => ({ ...s, scale: Math.max(0.5, s.scale + step) }));
    const handleRotate = (deg: number) => setImgState(s => ({ ...s, rotation: s.rotation + deg }));


    useEffect(() => {
        fetch(`http://localhost:3001/api/admin/pandits/${panditId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPandit(data.data);
                    setAdminNotes(data.data.adminNotes || "");
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [panditId]);

    const handleAction = async (action: "APPROVE" | "REJECT" | "REQUEST_INFO") => {
        try {
            let body: any = { action, notes: adminNotes };
            if (action === "REJECT") body.reason = `${rejectReason} - ${rejectDetail}`;
            if (action === "REQUEST_INFO") body.requestedDocuments = requestedDocs;

            await fetch(`http://localhost:3001/api/admin/pandits/${panditId}/verify`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`
                },
                body: JSON.stringify(body)
            });
            alert(`Pandit ${action.toLowerCase()}ed successfully.`);
            router.push("/pandits");
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading pandit data...</div>;
    if (!pandit) return <div className="p-12 text-center text-red-500 font-bold">Pandit not found</div>;

    return (
        <div className="pb-32 bg-slate-50 min-h-screen">

            {/* HEADER / TOP CARD */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 rounded-2xl bg-slate-200 shrink-0 border-4 border-white shadow-xl overflow-hidden relative group">
                        <img src={pandit.profilePhotoUrl || "https://ui-avatars.com/api/?name=" + pandit.user?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{pandit.title || "Pt."} {pandit.user?.name}</h1>
                                <p className="text-lg text-slate-500 font-medium mt-1">{pandit.location}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                                <span className={`px-4 py-2 rounded-lg border ${pandit.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200' :
                                    pandit.verificationStatus === 'DOCUMENTS_SUBMITTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        pandit.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                    {pandit.verificationStatus.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                <div className="font-bold text-slate-800 flex items-center gap-2">
                                    {pandit.user?.phone}
                                    <button onClick={() => navigator.clipboard.writeText(pandit.user?.phone)} className="text-blue-500 hover:text-blue-700"><span className="material-symbols-outlined text-[16px]">content_copy</span></button>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                                <p className="font-bold text-slate-800">{pandit.experienceYears || 0} years</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered On</p>
                                <p className="font-bold text-slate-800">{format(new Date(pandit.createdAt), "dd MMM yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Complete</p>
                                <p className="font-bold text-slate-800">{pandit.profileCompletionPercent}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-8 space-y-8">

                {/* DOCUMENTS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">description</span>
                        Document Verification
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["Aadhaar Front", "Aadhaar Back", "Selfie with Aadhaar"].map((docName, i) => {
                            const url = pandit.documentUrls ? pandit.documentUrls[i] : null;
                            return (
                                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                                    <div
                                        onClick={() => url && setDocumentScale({ url })}
                                        className={`h-48 bg-slate-100 relative ${url ? "cursor-pointer group" : ""}`}
                                    >
                                        {url ? (
                                            <>
                                                <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 drop-shadow-md text-3xl">zoom_in</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">Not Uploaded</div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50 flex-1 border-t border-slate-200">
                                        <p className="font-bold text-slate-800 text-sm mb-3">{docName}</p>
                                        <div className="flex flex-col gap-2 mt-auto">
                                            <button
                                                onClick={() => setDocVerdicts({ ...docVerdicts, [docName]: 'PASS' })}
                                                className={`w-full py-1.5 rounded transition-colors text-xs font-bold border ${docVerdicts[docName] === 'PASS' ? 'bg-green-100 text-green-700 border-green-300 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                            >✅ Looks Good</button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setDocVerdicts({ ...docVerdicts, [docName]: 'FAIL' })}
                                                    className={`flex-1 py-1.5 rounded transition-colors text-[10px] font-bold border ${docVerdicts[docName] === 'FAIL' ? 'bg-red-100 text-red-700 border-red-300 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >❌ Fake/Unclear</button>
                                                <button
                                                    onClick={() => setDocVerdicts({ ...docVerdicts, [docName]: 'RE_UPLOAD' })}
                                                    className={`flex-1 py-1.5 rounded transition-colors text-[10px] font-bold border ${docVerdicts[docName] === 'RE_UPLOAD' ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >🔄 Re-upload</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* VIDEO KYC */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">videocam</span>
                            Video KYC Review
                        </h2>
                        {pandit.kycVideoUrl ? (
                            <video src={pandit.kycVideoUrl} controls className="w-full rounded-xl bg-black aspect-video object-contain outline-none border border-slate-200" />
                        ) : (
                            <div className="w-full aspect-video bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-medium text-lg">
                                No KYC Video Uploaded
                            </div>
                        )}
                    </div>

                    <div className="flex-[0.8] bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-4">Mandatory Checklist</h3>
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {[
                                { k: 'face', l: 'Face clearly visible and matches Aadhaar photo' },
                                { k: 'name', l: 'Pandit stated their full name correctly' },
                                { k: 'experience', l: 'Stated experience and city properly' },
                                { k: 'mantra', l: 'Mantra pronunciation is clear and correct' },
                                { k: 'aadhaar', l: 'Aadhaar card visible and held by person' },
                                { k: 'genuine', l: 'No signs of impersonation or manipulation' },
                            ].map((item) => (
                                <label key={item.k} className="flex gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex shrink-0 items-center justify-center transition-colors mt-0.5 ${videoChecks[item.k as keyof typeof videoChecks] ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 group-hover:border-blue-400"
                                        }`}>
                                        {videoChecks[item.k as keyof typeof videoChecks] && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
                                    </div>
                                    <input type="checkbox" className="hidden"
                                        checked={videoChecks[item.k as keyof typeof videoChecks]}
                                        onChange={e => setVideoChecks({ ...videoChecks, [item.k]: e.target.checked })}
                                    />
                                    <span className={`text-sm font-medium ${videoChecks[item.k as keyof typeof videoChecks] ? "text-slate-800" : "text-slate-600"}`}>{item.l}</span>
                                </label>
                            ))}
                        </div>

                        <div className={`mt-6 p-4 rounded-xl text-center font-bold text-sm ${allVideoChecked ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                            {allVideoChecked ? "All conditions met for Video KYC." : "Please verify all checkboxes to proceed."}
                        </div>
                    </div>
                </div>

                {/* PROFILE LOGISTICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">person</span> Personal
                        </h2>
                        <div className="space-y-4">
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aadhaar & PAN</p>
                                <p className="font-bold text-slate-800 font-mono tracking-wider">{pandit.aadhaarNumber?.replace(/(\d{4})$/, 'XXXX') || '---'}</p></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bio</p>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{pandit.bio || 'No bio provided'}</p></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Languages</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {(pandit.languages || []).map((l: string) => <span key={l} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-200">{l}</span>)}
                                </div></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">account_balance</span> Bank Details
                        </h2>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
                            <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">info</span> Bank details are NOT verified by platform. Pandit is responsible.
                            </p>
                        </div>

                        {pandit.bankDetails ? (
                            <div className="space-y-4">
                                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account Holder</p><p className="font-bold text-slate-800">{pandit.bankDetails.holderName}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account Number</p><p className="font-bold text-slate-800 font-mono tracking-wider">{pandit.bankDetails.accountNumber}</p></div>
                                    <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">IFSC</p><p className="font-bold text-slate-800 font-mono tracking-wider">{pandit.bankDetails.ifsc}</p></div>
                                </div>
                            </div>
                        ) : <p className="text-slate-500 font-medium">No bank details appended.</p>}
                    </div>
                </div>

            </div>

            {/* STICKY BOTTOM PANEL */}
            <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-40">
                <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                            Internal Admin Notes
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400">Hidden from pandit</span>
                        </label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                            placeholder="E.g. Video KYC looks slightly dark but audible. Advised via call."
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex-[1.2] flex flex-col justify-end gap-3">
                        <div className="flex gap-3 h-14">
                            <button
                                onClick={() => setModalType("MORE_INFO")}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                📝 REQUEST INFO
                            </button>
                            <button
                                onClick={() => setModalType("REJECT")}
                                className="flex-1 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-500 font-black rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                ❌ REJECT
                            </button>
                        </div>
                        <button
                            onClick={() => setModalType("APPROVE")}
                            disabled={!canApprove}
                            className="w-full h-14 bg-[#0a864d] hover:bg-[#086a3d] text-white font-black rounded-xl shadow-lg shadow-green-500/30 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            ✅ APPROVE PANDIT
                            <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* DOCUMENT PREVIEW MODAL */}
            {documentScale.url && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-4 lg:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3 bg-white/10 p-1.5 rounded-2xl backdrop-blur-lg border border-white/10">
                            <button onClick={() => handleZoom(0.25)} className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors flex items-center gap-2"><span className="material-symbols-outlined">zoom_in</span> Zoom In</button>
                            <button onClick={() => handleZoom(-0.25)} className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors flex items-center gap-2"><span className="material-symbols-outlined">zoom_out</span> Zoom Out</button>
                            <div className="w-px bg-white/20 mx-1 my-2"></div>
                            <button onClick={() => handleRotate(-90)} className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors flex items-center gap-2"><span className="material-symbols-outlined">rotate_left</span> Rotate CCW</button>
                            <button onClick={() => handleRotate(90)} className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors flex items-center gap-2"><span className="material-symbols-outlined">rotate_right</span> Rotate CW</button>
                            <div className="w-px bg-white/20 mx-1 my-2"></div>
                            {pandit.documentUrls && pandit.documentUrls.length >= 3 && !documentScale.compareUrl && (
                                <button onClick={() => setDocumentScale(s => ({ ...s, compareUrl: pandit.documentUrls[2] }))} className="text-amber-400 hover:bg-amber-400/20 p-3 rounded-xl transition-colors flex items-center gap-2 font-bold"><span className="material-symbols-outlined">compare</span> Compare w/ Selfie</button>
                            )}
                            <a href={documentScale.url} download target="_blank" className="text-blue-400 hover:bg-blue-400/20 p-3 rounded-xl transition-colors flex items-center gap-2 font-bold"><span className="material-symbols-outlined">download</span> Download</a>
                        </div>
                        <button onClick={() => { setDocumentScale({ url: null }); setImgState({ scale: 1, rotation: 0 }); }} className="text-white hover:bg-red-500/20 text-red-400 p-4 rounded-full transition-colors flex items-center justify-center ring-1 ring-red-500/50"><span className="material-symbols-outlined text-3xl leading-none">close</span></button>
                    </div>

                    <div className={`flex-1 overflow-auto flex items-center justify-center gap-8 ${documentScale.compareUrl ? 'flex-row' : ''}`}>
                        <div className="flex-1 h-full flex items-center justify-center bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative">
                            <img
                                src={documentScale.url}
                                style={{ transform: `scale(${imgState.scale}) rotate(${imgState.rotation}deg)` }}
                                className="max-w-full max-h-full object-contain transition-transform duration-200"
                            />
                        </div>
                        {documentScale.compareUrl && (
                            <div className="flex-1 h-full flex items-center justify-center bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative">
                                <div className="absolute top-4 left-4 bg-amber-500 text-black text-xs font-black uppercase px-3 py-1 rounded-full z-10">Verification Selfie</div>
                                <img
                                    src={documentScale.compareUrl}
                                    style={{ transform: `scale(${imgState.scale}) rotate(${imgState.rotation}deg)` }}
                                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ACTION MODALS */}
            {modalType && (
                <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setModalType(null)} className="absolute top-6 right-6 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><span className="material-symbols-outlined text-xl leading-none">close</span></button>

                        {modalType === "APPROVE" && (
                            <>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">verified</span>
                                    Approve Pandit?
                                </h2>
                                <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                                    You are about to verify <strong className="text-slate-900">{pandit.user?.name}</strong>. This will:
                                </p>
                                <ul className="space-y-3 mb-8 text-sm font-medium text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Set verification status to VERIFIED</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Enable them to receive booking requests</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Send official Welcome SMS notification</li>
                                </ul>
                                <div className="flex gap-3">
                                    <button onClick={() => setModalType(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button onClick={() => handleAction("APPROVE")} className="flex-[2] bg-[#0a864d] hover:bg-[#086a3d] text-white font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">Confirm Approval</button>
                                </div>
                            </>
                        )}

                        {modalType === "REJECT" && (
                            <>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500 text-3xl">block</span>
                                    Reject Verification
                                </h2>
                                <div className="space-y-6 mb-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Reason</label>
                                        <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-red-500 text-slate-800">
                                            <option value="">Select a reason...</option>
                                            <option value="Documents unclear/mismatch">Documents unclear/mismatch</option>
                                            <option value="Video KYC does not meet requirements">Video KYC does not meet requirements</option>
                                            <option value="Suspected fake/duplicate account">Suspected fake/duplicate account</option>
                                            <option value="Other">Other (specify below)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">Detailed Reason <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase tracking-wider">Shown to Pandit</span></label>
                                        <textarea value={rejectDetail} onChange={e => setRejectDetail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-red-500 text-slate-800 min-h-[100px] resize-none" placeholder="Provide clear feedback on why they were rejected..."></textarea>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setModalType(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button onClick={() => handleAction("REJECT")} disabled={!rejectReason} className="flex-[2] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">Confirm Rejection</button>
                                </div>
                            </>
                        )}

                        {modalType === "MORE_INFO" && (
                            <>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500 text-3xl">history_edu</span>
                                    Request More Info
                                </h2>
                                <p className="text-sm text-slate-600 font-medium mb-4">Select the documents the pandit needs to re-upload:</p>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {["Aadhaar Front", "Aadhaar Back", "Selfie", "Video KYC"].map(doc => (
                                        <label key={doc} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${requestedDocs.includes(doc) ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}>
                                            <input type="checkbox" checked={requestedDocs.includes(doc)} onChange={(e) => {
                                                if (e.target.checked) setRequestedDocs([...requestedDocs, doc]);
                                                else setRequestedDocs(requestedDocs.filter(d => d !== doc));
                                            }} className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500" />
                                            <span className="text-sm font-bold">{doc}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setModalType(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button onClick={() => handleAction("REQUEST_INFO")} disabled={requestedDocs.length === 0} className="flex-[2] bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">Send Request</button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}
