"use client";

/**
 * EarningsBreakdown (Prompt 10, Section 6)
 * Shows dual-scenario earnings breakdown: Pandit Package vs Platform List.
 * Renders two columns (stacked on mobile).
 */

interface BreakdownData {
    dakshinaAmount: number;
    platformFee: number;
    netDakshina: number;
    samagriEarnings: number;
    travelReimbursement: number;
    foodAllowance: number;
    totalEarning: number;
}

function fmtRupees(n: number) {
    return "₹" + n.toLocaleString("en-IN");
}

function BreakdownColumn({
    data,
    label,
    highlighted,
}: {
    data: BreakdownData;
    label: string;
    highlighted: boolean;
}) {
    const rows = [
        { label: "दक्षिणा", value: data.dakshinaAmount, color: "text-gray-700" },
        { label: "Platform Fee", value: -data.platformFee, color: "text-red-500" },
        { label: "Net दक्षिणा", value: data.netDakshina, color: "text-gray-800 font-semibold" },
        { label: "सामग्री Earnings", value: data.samagriEarnings, color: "text-blue-600" },
        { label: "यात्रा Reimbursement", value: data.travelReimbursement, color: "text-purple-600" },
        { label: "Food Allowance", value: data.foodAllowance, color: "text-green-600" },
    ];

    return (
        <div
            className={`rounded-xl p-4 space-y-3 ${highlighted
                    ? "border-2 border-amber-400 bg-amber-50"
                    : "border border-gray-200 bg-gray-50 opacity-70"
                }`}
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{highlighted ? "📦" : "🛒"}</span>
                <h4 className="font-bold text-gray-800">{label}</h4>
                {highlighted && (
                    <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Selected
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-gray-600">{row.label}</span>
                        <span className={row.color}>{fmtRupees(row.value)}</span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="border-t-2 border-dashed pt-3 mt-2 flex justify-between items-center">
                <span className="font-bold text-gray-800">कुल कमाई</span>
                <span className="text-xl font-bold text-green-700">
                    {fmtRupees(data.totalEarning)}
                </span>
            </div>
        </div>
    );
}

export default function EarningsBreakdown({
    scenarioA,
    scenarioB,
    activeScenario = "A",
}: {
    scenarioA: BreakdownData;
    scenarioB: BreakdownData;
    activeScenario?: "A" | "B";
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">payments</span>
                कमाई का विवरण — दोनों scenarios
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BreakdownColumn
                    data={scenarioA}
                    label="Pandit Ji ka Package"
                    highlighted={activeScenario === "A"}
                />
                <BreakdownColumn
                    data={scenarioB}
                    label="Platform Custom List"
                    highlighted={activeScenario === "B"}
                />
            </div>

            <p className="text-xs text-gray-400 italic mt-2">
                💡 Travel amount final होगा जब admin travel book करेगा।
            </p>
        </div>
    );
}
