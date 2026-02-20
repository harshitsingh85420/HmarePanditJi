/**
 * HmarePanditJi — Aadhaar AES-256 Encryption Utility
 *
 * MASTER RULE: Always encrypt Aadhaar numbers with AES-256 before storing.
 * Only store last 4 digits as plain text for display.
 * Never log full Aadhaar numbers.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCODING = 'hex' as const;

function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 64) {
        throw new Error(
            'ENCRYPTION_KEY must be set in .env and be at least 32 bytes (64 hex characters)'
        );
    }
    return Buffer.from(key.slice(0, 64), 'hex');
}

/**
 * Encrypt an Aadhaar number with AES-256-GCM.
 * Returns a hex string: iv + authTag + ciphertext
 */
export function encryptAadhaar(aadhaarPlaintext: string): string {
    if (!/^\d{12}$/.test(aadhaarPlaintext)) {
        throw new Error('Invalid Aadhaar number format');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(aadhaarPlaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();
    return iv.toString(ENCODING) + authTag.toString(ENCODING) + encrypted;
}

/**
 * Decrypt a stored Aadhaar ciphertext back to 12 digits.
 * Only use for verified internal operations, NEVER log the result.
 */
export function decryptAadhaar(encryptedHex: string): string {
    const key = getEncryptionKey();

    const iv = Buffer.from(encryptedHex.slice(0, IV_LENGTH * 2), ENCODING);
    const authTag = Buffer.from(
        encryptedHex.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2),
        ENCODING
    );
    const ciphertext = encryptedHex.slice((IV_LENGTH + TAG_LENGTH) * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Extract last 4 digits of Aadhaar for display purposes.
 * Safe to store in plaintext.
 */
export function getAadhaarLastFour(aadhaarPlaintext: string): string {
    return aadhaarPlaintext.slice(-4);
}

/**
 * Mask Aadhaar for display: "XXXX XXXX 1234"
 */
export function maskAadhaar(lastFour: string): string {
    return `XXXX XXXX ${lastFour}`;
}
