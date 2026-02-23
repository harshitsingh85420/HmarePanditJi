"use client";

/**
 * FoodAllowanceDetail (Prompt 10, Section 5)
 * Shows per-day food allowance breakdown for travel/puja days.
 * ₹1,000/day for travel days + puja days if customer doesn't provide meals.
 */
export default function FoodAllowanceDetail({
    travelDays = 0,
    pujaDays = 0,
    customerProvidesMeals = false,
    ratePerDay = 1000,
}: {
    travelDays?: number;
    pujaDays?: number;
    customerProvidesMeals?: boolean;
    ratePerDay?: number;
}) {
    const fmtRupees = (n: number) => "₹" + n.toLocaleString("en-IN");

    const eligiblePujaDays = customerProvidesMeals ? 0 : pujaDays;
    const totalDays = travelDays + eligiblePujaDays;
    const totalAllowance = totalDays * ratePerDay;

    if (totalDays === 0) return null;

    return (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-green-800">
                <span className="text-lg">🍽️</span>
                Food Allowance Details
            </h4>

            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-gray-500 border-b border-green-200">
                        <th className="py-1.5 font-medium">दिन का प्रकार</th>
                        <th className="py-1.5 font-medium text-center">दिन</th>
                        <th className="py-1.5 font-medium text-right">प्रति दिन</th>
                        <th className="py-1.5 font-medium text-right">कुल</th>
                    </tr>
                </thead>
                <tbody>
                    {travelDays > 0 && (
                        <tr className="border-b border-green-100">
                            <td className="py-2 text-gray-700">🚌 Travel Days</td>
                            <td className="py-2 text-center font-medium">{travelDays}</td>
                            <td className="py-2 text-right">{fmtRupees(ratePerDay)}</td>
                            <td className="py-2 text-right font-semibold text-green-700">
                                {fmtRupees(travelDays * ratePerDay)}
                            </td>
                        </tr>
                    )}
                    {pujaDays > 0 && (
                        <tr className="border-b border-green-100">
                            <td className="py-2 text-gray-700">
                                🙏 Puja Days
                                {customerProvidesMeals && (
                                    <span className="text-xs text-gray-400 block">
                                        (Customer provides meals)
                                    </span>
                                )}
                            </td>
                            <td className="py-2 text-center font-medium">{pujaDays}</td>
                            <td className="py-2 text-right">
                                {customerProvidesMeals ? "—" : fmtRupees(ratePerDay)}
                            </td>
                            <td className="py-2 text-right font-semibold">
                                {customerProvidesMeals ? (
                                    <span className="text-gray-400 line-through">
                                        {fmtRupees(pujaDays * ratePerDay)}
                                    </span>
                                ) : (
                                    <span className="text-green-700">
                                        {fmtRupees(pujaDays * ratePerDay)}
                                    </span>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-green-300">
                        <td colSpan={3} className="py-2 font-bold text-gray-800">
                            कुल Food Allowance
                        </td>
                        <td className="py-2 text-right text-lg font-bold text-green-700">
                            {fmtRupees(totalAllowance)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <p className="text-xs text-green-600 italic">
                💡 Platform policy: ₹1,000/day for travel days + puja days (if customer
                doesn&apos;t provide meals)
            </p>
        </div>
    );
}
