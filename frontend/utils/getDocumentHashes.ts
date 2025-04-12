/**
 * @fileoverview Utility functions for retrieving document hashes from the blockchain contract.
 */

import { getContract } from './rightful';

/**
 * Fetches all document hashes stored in the contract in chronological order.
 *
 * @returns {Promise<string[]>} Array of document hashes ordered by submission time.
 */
export async function getDocumentHashes(): Promise<string[]> {
  const contract = getContract();
  let currIndex = 0;
  const documentHashes: string[] = [];

  while (true) {
    try {
      const hash = await contract.documentHashes(currIndex); // Fetch hash at current index
      documentHashes.push(hash);
      currIndex += 1;
    } catch (err) {
      break;
    }
  }

  return documentHashes;
}
