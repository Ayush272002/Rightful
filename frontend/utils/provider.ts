/**
 * @fileoverview Provides Ethereum network connectivity via Infura or a fallback RPC.
 * Handles provider instantiation and connection management for the Sepolia testnet.
 */

import { JsonRpcProvider } from 'ethers';

// Get Infura project ID from environment variables
const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID?.trim();

// Construct RPC URL, falling back to public endpoint if no Infura ID
const RPC_URL = INFURA_PROJECT_ID
  ? `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
  : 'https://sepolia.drpc.org';

/**
 * Creates and returns a JsonRpcProvider instance for the Sepolia testnet.
 *
 * @returns {JsonRpcProvider} Provider instance connected to Sepolia
 */
export function getSepoliaProvider(): JsonRpcProvider {
  if (!INFURA_PROJECT_ID) {
    console.warn('No Infura Project ID found. Using public RPC endpoint.');
  }

  return new JsonRpcProvider(RPC_URL);
}
