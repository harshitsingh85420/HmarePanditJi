"use client";

import { useDeviceInfo } from "../../hooks/useDeviceInfo";

/**
 * DeviceInfoDisplay (Prompt 14, Section 2)
 * Read-only device information card showing parsed device details.
 * Includes a "Device Update करें" button to re-trigger capture and PATCH.
 */
export default function DeviceInfoDisplay() {
    const { deviceInfo, sendDeviceInfo, sent } = useDeviceInfo();

    if (!deviceInfo) return null;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500">devices</span>
                    Device Information
                </h4>
                <button
                    onClick={sendDeviceInfo}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors ${sent
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        }`}
                    style={{ minHeight: "44px" }}
                >
                    <span className="material-symbols-outlined text-sm">
                        {sent ? "check_circle" : "refresh"}
                    </span>
                    {sent ? "Updated ✓" : "Device Update करें"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <span className="text-gray-400 text-xs block mb-0.5">Device</span>
                    <span className="text-gray-700 font-medium">{deviceInfo.deviceModel}</span>
                </div>
                <div>
                    <span className="text-gray-400 text-xs block mb-0.5">OS</span>
                    <span className="text-gray-700 font-medium">{deviceInfo.deviceOs}</span>
                </div>
                <div>
                    <span className="text-gray-400 text-xs block mb-0.5">Browser</span>
                    <span className="text-gray-700 font-medium">{deviceInfo.browser}</span>
                </div>
                <div>
                    <span className="text-gray-400 text-xs block mb-0.5">Screen</span>
                    <span className="text-gray-700 font-medium">
                        {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
                    </span>
                </div>
            </div>
        </div>
    );
}
