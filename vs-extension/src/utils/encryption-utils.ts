/**
 * Encryption Utility Functions
 * 
 * Handles AES-256-GCM encryption and decryption operations.
 */

import * as ExtensionUtils from './extension-utils';

const logger = ExtensionUtils.createLogger('EncryptionUtils');

/**
 * Decrypts data using AES256 encryption
 * @param encryptedData - Encrypted data string in JSON format
 * @param salt - Salt/key for decryption
 * @returns Decrypted string
 */
export async function decryptUsingAES256(encryptedData: string, salt: string): Promise<string> {
    logger.info('Decrypting data using AES256');
    const cipherJson = JSON.parse(encryptedData);
    return await decryptGCM(cipherJson["ciphertext"], cipherJson["iv"], salt);
}

/**
 * Decrypts data using AES-GCM algorithm
 * @param ciphertext - Base64 encoded ciphertext
 * @param iv - Base64 encoded initialization vector
 * @param password - Decryption key
 * @returns Decrypted string
 */
async function decryptGCM(ciphertext: string, iv: string, password: string): Promise<string> {
    const decodedCiphertext = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decodedIV = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const algorithm = {
        name: 'AES-GCM',
        iv: decodedIV
    };

    const importedKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        algorithm,
        false,
        ['decrypt']
    );

    const decryptedData = await crypto.subtle.decrypt(algorithm, importedKey, decodedCiphertext);
    return new TextDecoder().decode(decryptedData);
}

/**
 * Safely parses JSON string
 * @param jsonString - JSON string to parse
 * @returns Parsed object or null if parsing fails
 */
export function tryParseJSON(jsonString: string | undefined): any {
    if (!jsonString) { return null; }

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        logger.error("JSON.parse error:", e);
        return null;
    }
}

/**
 * Safely stringifies object to JSON
 * @param obj - Object to stringify
 * @returns JSON string or null if stringification fails
 */
export function tryStringifyJSON(obj: any): string | null {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        logger.error("JSON.stringify error:", e);
        return null;
    }
}
