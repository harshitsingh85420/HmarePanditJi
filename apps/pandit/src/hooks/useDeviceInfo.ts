"use client";

import { useEffect, useState, useCallback } from "react";

interface DeviceInfo {
    deviceModel: string;
    deviceOs: string;
    browser: string;
    screenWidth: number;
    screenHeight: number;
}

/**
 * useDeviceInfo hook
 * Parses navigator.userAgent to extract deviceModel and deviceOs.
 * On every successful login (token received), calls POST /api/pandit/device-info.
 */
export function useDeviceInfo() {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [sent, setSent] = useState(false);

    const parseUserAgent = useCallback((): DeviceInfo => {
        if (typeof window === "undefined") {
            return { deviceModel: "Unknown", deviceOs: "Unknown", browser: "Unknown", screenWidth: 0, screenHeight: 0 };
        }
        const ua = navigator.userAgent;
        let deviceModel = "Desktop";
        let deviceOs = "Unknown";
        let browser = "Unknown";

        // Parse OS
        if (/Android/i.test(ua)) {
            deviceOs = "Android";
            const match = ua.match(/Android\s([0-9.]+)/);
            if (match) deviceOs += " " + match[1];
        } else if (/iPhone|iPad|iPod/i.test(ua)) {
            deviceOs = "iOS";
            const match = ua.match(/OS\s([0-9_]+)/);
            if (match) deviceOs += " " + match[1].replace(/_/g, ".");
        } else if (/Windows/i.test(ua)) {
            deviceOs = "Windows";
            const match = ua.match(/Windows NT\s([0-9.]+)/);
            if (match) {
                const ver = match[1];
                if (ver === "10.0") deviceOs = "Windows 10/11";
                else if (ver === "6.3") deviceOs = "Windows 8.1";
                else if (ver === "6.1") deviceOs = "Windows 7";
                else deviceOs = "Windows " + ver;
            }
        } else if (/Mac OS X/i.test(ua)) {
            deviceOs = "macOS";
            const match = ua.match(/Mac OS X\s([0-9_]+)/);
            if (match) deviceOs += " " + match[1].replace(/_/g, ".");
        } else if (/Linux/i.test(ua)) {
            deviceOs = "Linux";
        }

        // Parse device model
        if (/iPhone/i.test(ua)) deviceModel = "iPhone";
        else if (/iPad/i.test(ua)) deviceModel = "iPad";
        else if (/Android/i.test(ua)) {
            const match = ua.match(/;\s*([^;]+)\s+Build/);
            if (match) deviceModel = match[1].trim();
            else deviceModel = "Android Device";
        }

        // Parse browser
        if (/Chrome\/(\d+)/i.test(ua) && !/Edg/i.test(ua)) {
            browser = "Chrome " + (ua.match(/Chrome\/(\d+)/)?.[1] || "");
        } else if (/Firefox\/(\d+)/i.test(ua)) {
            browser = "Firefox " + (ua.match(/Firefox\/(\d+)/)?.[1] || "");
        } else if (/Safari\/(\d+)/i.test(ua) && !/Chrome/i.test(ua)) {
            browser = "Safari";
        } else if (/Edg\/(\d+)/i.test(ua)) {
            browser = "Edge " + (ua.match(/Edg\/(\d+)/)?.[1] || "");
        }

        return {
            deviceModel,
            deviceOs,
            browser,
            screenWidth: window.screen?.width || 0,
            screenHeight: window.screen?.height || 0,
        };
    }, []);

    const sendDeviceInfo = useCallback(async () => {
        if (typeof window === "undefined") return;

        const token =
            localStorage.getItem("hpj_pandit_token") ||
            localStorage.getItem("hpj_pandit_access_token") ||
            localStorage.getItem("token");

        if (!token || sent) return;

        const info = parseUserAgent();
        setDeviceInfo(info);

        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

        try {
            await fetch(`${API_BASE}/pandits/device-info`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(info),
            });
            setSent(true);
        } catch (err) {
            console.warn("Failed to send device info:", err);
        }
    }, [parseUserAgent, sent]);

    useEffect(() => {
        const info = parseUserAgent();
        setDeviceInfo(info);
    }, [parseUserAgent]);

    return {
        deviceInfo,
        sendDeviceInfo,
        sent,
    };
}
