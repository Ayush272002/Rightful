import { JsonRpcProvider, Contract } from 'ethers';
import RightfulABI from '../ABI/Rightful.json';

const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID?.trim();
const RPC_URL = INFURA_PROJECT_ID
  ? `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
  : 'https://sepolia.drpc.org';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function getSepoliaProvider() {
  return new JsonRpcProvider(RPC_URL);
}

export function getContract(signerOrProvider?: any) {
  const provider = signerOrProvider || getSepoliaProvider();
  return new Contract(CONTRACT_ADDRESS!, RightfulABI, provider);
}
