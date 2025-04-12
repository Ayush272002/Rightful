import { JsonRpcProvider, Contract } from "ethers";
import PaymentABI from "../ABI/Payment.json";

import { ethers } from "ethers";

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID?.trim();
const RPC_URL = INFURA_PROJECT_ID
  ? `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
  : "https://sepolia.drpc.org";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS_PAYMENT;

export function getSepoliaProvider() {
  return new JsonRpcProvider(RPC_URL);
}

export function getContract(signerOrProvider?: any) {
  const provider = signerOrProvider || getSepoliaProvider();
  return new Contract(CONTRACT_ADDRESS!, PaymentABI, provider);
}

export async function getTotalDeposit(address: string): Promise<number> {
  const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
  if (!PRIVATE_KEY) throw new Error("Private key is missing!");

  const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID?.trim();
  const RPC_URL = INFURA_PROJECT_ID
    ? `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
    : "https://sepolia.drpc.org";

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const contract = getContract(wallet);

  return await contract.deposit(address);
}