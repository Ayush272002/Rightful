import { ethers } from "ethers";
import { getContract } from "./rightful";
import dotenv from "dotenv";

dotenv.config();

export async function storeDocument(data: {
  title: string;
  description: string;
  resourceLocation: string;
  documentHash: string;
  tokenCount: number;
  lexicalDensity: number;
  audienceEngagement: number;
  vector: string;
}) {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  if (!PRIVATE_KEY) throw new Error("Private key is missing!");
  if (!CONTRACT_ADDRESS) throw new Error("Contract address is missing!");

  const tokenCount = Math.round(data.tokenCount);
  const lexicalDensity = Math.round(data.lexicalDensity * 1000000);
  const audienceEngagement = Math.round(data.audienceEngagement * 1000000);

  const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID?.trim();
  const RPC_URL = INFURA_PROJECT_ID
    ? `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
    : "https://sepolia.drpc.org";

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const contract = getContract(wallet);

  const tx = await contract.storeDocument(
    data.title,
    data.description,
    data.resourceLocation,
    data.documentHash,
    tokenCount,
    lexicalDensity,
    audienceEngagement,
    data.vector
  );

  await tx.wait();
  console.log(
    "Document stored - Tx Hash ",
    tx.hash,
    " - Doc Hash ",
    data.documentHash
  );

  return (
    parseInt(
      (await contract.getNumberOfEntries(data.documentHash)).toString()
    ) - 1
  );
}
