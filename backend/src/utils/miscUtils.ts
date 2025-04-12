import { SHA256 } from "crypto-js";

/**
 * Creates a hash from a string using SHA-256 from crypto-js
 * @param {string} input - The string to hash
 * @param {number} length - The desired length of the hash
 * @returns {string} A hash of the specified length
 */
export function createHash(input: string, length: number): string {
  // Generate SHA-256 hash
  const hash = SHA256(input).toString();

  // Truncate to desired length, or pad if needed
  if (hash.length <= length) {
    return hash.padEnd(length, "0");
  }

  return hash.substring(0, length);
}
