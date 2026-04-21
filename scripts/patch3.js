const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/pandit/src/app/bookings/[bookingId]/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. imports
content = content.replace(
    `import { hi } from "date-fns/locale";\nimport {`,
    `import { hi } from "date-fns/locale";
import { Star } from "lucide-react";
import {`
);

// 2. state
content = content.replace(
    `const [loading, setLoading] = useState(true);`,
    `const [loading, setLoading] = useState(true);
    const [showRatingSheet, setShowRatingSheet] = useState(false);
    const [ratingData, setRatingData] = useState({ punctuality: 5, hospitality: 5, foodArrangement: 5, comment: "" });
    const [submittingRating, setSubmittingRating] = useState(false);`
);

// 3. handleAction
content = content.replace(
    `            if (res.ok) {
                loadBooking(booking!.id);
            }`,
    `            if (res.ok) {
                if (action === "complete") {
                    setShowRatingSheet(true);
                }
                loadBooking(booking!.id);
            }`
);

// 4. Submit Rating Function
const submitRatingCode = `
    const submitRating = async () => {
        try {
            setSubmittingRating(true);
            const token = localStorage.getItem("token");
            const res = await fetch(\`/api/pandit/bookings/\${booking?.id}/rate-customer\`, {
                method: "POST",
                headers: {
                    Authorization: \`Bearer \${token}\`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(ratingData)
            });
            if (res.ok) {
                setShowRatingSheet(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingRating(false);
        }
    };
`;
content = content.replace(
    `    if (loading) {`,
    submitRatingCode + `\n    if (loading) {`
);

// 5. Rating Sheet UI
const ratingSheetUI = `
            {/* Rating Bottom Sheet */}
            {showRatingSheet && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/50 animate-in fade-in duration-300">
                    <div className="bg-white p-6 rounded-t-2xl shadow-xl w-full max-w-2xl mx-auto flex flex-col gap-4 animate-in slide-in-from-bottom-full duration-300">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h2 className="text-xl font-bold text-gray-800">ग्राहक को रेट करें</h2>
                            <button onClick={() => setShowRatingSheet(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                        </div>
                        <p className="text-sm text-gray-500">अन्य पंडितों की मदद के लिए ग्राहक का अनुभव साझा करें।</p>
                        
                        <div className="space-y-4">
                            {[
                                { key: 'punctuality', label: 'समय की पाबंदी' },
                                { key: 'hospitality', label: 'आतिथ्य सत्कार' },
                                { key: 'foodArrangement', label: 'भोजन की व्यवस्था' }
                            ].map(item => (
                                <div key={item.key} className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star 
                                                key={star} 
                                                className={\`w-6 h-6 cursor-pointer \${(ratingData as any)[item.key] >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}\`} 
                                                onClick={() => setRatingData(prev => ({ ...prev, [item.key]: star }))}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">टिप्पणी (वैकल्पिक)</label>
                                <textarea 
                                    className="w-full border rounded-lg p-3 text-sm focus:ring-amber-500 focus:border-amber-500" 
                                    rows={3} 
                                    placeholder="ग्राहक के बारे में कुछ बताएं..."
                                    value={ratingData.comment}
                                    onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                                ></textarea>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                            <Button variant="outline" className="flex-1 py-3" onClick={() => setShowRatingSheet(false)}>बाद में</Button>
                            <Button className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white" onClick={submitRating} disabled={submittingRating}>
                                {submittingRating ? "कृपया प्रतीक्षा करें..." : "जमा करें"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
`;

content = content.replace(
    `        </div>
    );
}`,
    ratingSheetUI + `        </div>
    );
}`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Bookings detail page patched');
