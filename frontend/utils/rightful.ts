/**
 * @fileoverview Provides contract interaction functionality for the Rightful smart contract.
 * Handles contract instantiation and connection management on the Sepolia testnet.
 */

import { Contract } from 'ethers';
import RightfulABI from '../ABI/RTFL.json';
import { getSepoliaProvider } from '@/utils/provider';

// Environment variables for network configuration
const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID?.trim();
const RPC_URL = INFURA_PROJECT_ID
  ? `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
  : 'https://sepolia.drpc.org';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

/**
 * Creates and returns an instance of the Rightful smart contract.
 *
 * @param {any} signerOrProvider - Optional signer or provider instance
 * @returns {Contract} Configured contract instance
 * @throws {Error} If CONTRACT_ADDRESS is not set in environment
 */
export function getContract(signerOrProvider?: any): Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.'
    );
  }

  // Use provided signer/provider or fall back to default Sepolia provider
  const provider = signerOrProvider || getSepoliaProvider();

  return new Contract(CONTRACT_ADDRESS, RightfulABI, provider);
}
