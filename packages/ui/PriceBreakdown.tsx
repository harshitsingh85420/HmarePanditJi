"use client";

import { useState } from "react";
import { Theme, themes } from "./tokens";

/**
 * Mock representation of PricingBreakdown from @hpj/types
 */
export interface PricingBreakdown {
  dakshina: number;
  samagriTotal?: number;
  platformFee: number;
  gstAmount: number;
  gstRate: number;
  grandTotal: number;
  travelCost?: number;
}

export interface PriceBreakdownProps {
  breakdown: PricingBreakdown;
  theme?: Theme;
  showGstDetails?: boolean;
  className?: string;
  role?: "CUSTOMER" | "PANDIT";
}

export const PriceBreakdown = ({
  breakdown,
  theme = "customer",
  showGstDetails = true,
  className = "",
  role = "CUSTOMER",
}: PriceBreakdownProps) => {
  const [isGstExpanded, setIsGstExpanded] = useState(false);
  const currentTheme = themes[theme] || themes.customer;

  const styleVars = {
    "--price-primary": currentTheme.primary,
  } as React.CSSProperties;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className={`space-y-3 ${className}`} style={styleVars}>
      {/* Dakshina */}
      <div className="flex items-center justify-between text-gray-800">
        <span className="flex items-center">
          Dakshina
          <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
            GST exempt
          </span>
        </span>
        <span className="font-medium">
          {formatCurrency(breakdown.dakshina)}
        </span>
      </div>

      {/* Samagri */}
      {breakdown.samagriTotal !== undefined && breakdown.samagriTotal > 0 && (
        <div className="flex items-center justify-between text-gray-800">
          <span>Samagri Total</span>
          <span className="font-medium">
            {formatCurrency(breakdown.samagriTotal)}
          </span>
        </div>
      )}

      {/* Travel Cost */}
      {breakdown.travelCost !== undefined && breakdown.travelCost > 0 && (
        <div className="flex items-center justify-between text-gray-800">
          <span>{role === "PANDIT" ? "यात्रा खर्च" : "Travel Cost"}</span>
          <span className="font-medium">
            {formatCurrency(breakdown.travelCost)}
          </span>
        </div>
      )}

      {role === "CUSTOMER" && (
        <>
          {/* Platform Fee */}
          <div className="flex items-center justify-between text-gray-500">
            <span>Platform Fee</span>
            <span>{formatCurrency(breakdown.platformFee)}</span>
          </div>

          {/* Taxes/GST */}
          {showGstDetails ? (
            <div className="text-sm text-gray-400">
              <div
                className="flex cursor-pointer items-center justify-between transition-colors hover:text-gray-600"
                onClick={() => setIsGstExpanded(!isGstExpanded)}
              >
                <span className="flex items-center">
                  Taxes (GST)
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${isGstExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
                <span>{formatCurrency(breakdown.gstAmount)}</span>
              </div>
              {isGstExpanded && (
                <div className="ml-4 mt-2 space-y-1.5 border-l-2 border-gray-100 pl-3 text-xs">
                  <div className="flex justify-between">
                    <span>SGST ({(breakdown.gstRate / 2).toFixed(1)}%)</span>
                    <span>{formatCurrency(breakdown.gstAmount / 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST ({(breakdown.gstRate / 2).toFixed(1)}%)</span>
                    <span>{formatCurrency(breakdown.gstAmount / 2)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Taxes (GST)</span>
              <span>{formatCurrency(breakdown.gstAmount)}</span>
            </div>
          )}

          {/* Divider */}
          <hr className="border-gray-200" />
        </>
      )}

      {/* Total / Grand Total */}
      <div className="flex items-center justify-between text-lg font-bold">
        <span className="text-gray-900">
          {role === "PANDIT" ? "कुल आमदनी" : "Grand Total"}
        </span>
        <span className="text-[var(--price-primary)]">
          {formatCurrency(breakdown.grandTotal)}
        </span>
      </div>
    </div>
  );
};
