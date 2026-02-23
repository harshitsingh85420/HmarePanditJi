"use client";

/**
 * SamagriIndicator (Prompt 10, Section 4)
 * Critical badge showing whether customer chose Pandit's package or Platform custom list.
 */
export default function SamagriIndicator({
    choice,
    packageName,
    packagePrice,
    tier,
}: {
    choice: "PANDIT_PACKAGE" | "PLATFORM_LIST";
    packageName?: string;
    packagePrice?: number;
    tier?: string;
}) {
    const fmtRupees = (n: number) => "₹" + n.toLocaleString("en-IN");

    if (choice === "PANDIT_PACKAGE") {
        return (
            <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">📦</span>
                    <span className="bg-amber-200 text-amber-800 text-sm font-bold px-3 py-1 rounded-full">
                        Pandit Ji ka Package: {tier || "Standard"} — {fmtRupees(packagePrice || 0)}
                    </span>
                </div>
                <p className="text-sm text-amber-800 font-medium">
                    आप इस package की full price कमाएंगे।
                </p>
                {packageName && (
                    <p className="text-xs text-amber-600">Package: {packageName}</p>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">🛒</span>
                <span className="bg-blue-200 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                    Platform Custom List
                </span>
            </div>
            <p className="text-sm text-blue-700 font-medium">
                Customer अपनी samagri खुद manage करेगा। आपकी samagri earning: ₹0
            </p>
        </div>
    );
}
