/**
 * HmarePanditJi India-Specific Validators
 * Aadhaar (Verhoeff), Indian phone, pincode, GST number
 */

// ─── Indian Phone ────────────────────────────────────────────────────────────

/**
 * Indian phone: must start with 6, 7, 8, or 9. Must be 10 digits.
 */
export function isValidIndianPhone(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone);
}

// ─── Aadhaar Validation (Verhoeff Algorithm) ────────────────────────────────

/**
 * Validate Aadhaar number: 12 digits, Verhoeff checksum.
 */
export function isValidAadhaar(aadhaar: string): boolean {
    if (!/^\d{12}$/.test(aadhaar)) return false;

    // Verhoeff checksum tables
    const d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];
    const p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];

    const digits = aadhaar.split('').reverse().map(Number);
    let check = 0;
    digits.forEach((digit, i) => {
        check = d[check][p[i % 8][digit]];
    });
    return check === 0;
}

// ─── Indian Pincode ──────────────────────────────────────────────────────────

export function isValidPincode(pin: string): boolean {
    return /^[1-9]\d{5}$/.test(pin);
}

// ─── GST Number Validation ───────────────────────────────────────────────────

export function isValidGST(gst: string): boolean {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
}

// ─── Valid Puja Types ────────────────────────────────────────────────────────

export const VALID_PUJA_TYPES = [
    'vivah',
    'griha_pravesh',
    'satyanarayan',
    'mundan',
    'annaprashan',
    'namkaran',
    'shradh',
    'pitru_paksha',
    'rudrabhishek',
    'katha',
    'kundali_puja',
    'vastu_puja',
    'navgrah_puja',
    'ganesh_puja',
    'durga_puja',
    'lakshmi_puja',
    'sai_puja',
    'havan',
] as const;

export function isValidPujaType(pujaType: string): boolean {
    return (VALID_PUJA_TYPES as readonly string[]).includes(pujaType);
}

// ─── Valid Travel Modes ──────────────────────────────────────────────────────

export const VALID_TRAVEL_MODES = [
    'self_drive',
    'cab',
    'bike',
    'bus',
    'train',
    'flight',
] as const;

export function isValidTravelMode(mode: string): boolean {
    return (VALID_TRAVEL_MODES as readonly string[]).includes(mode);
}
