import { ethers } from 'ethers';
import { getContract } from './rightful';

// Example: using MetaMask signer in browser
export async function storeDocumentViaMetamask(data: {
  title: string;
  description: string;
  resourceLocation: string;
  documentHash: number;
  tokenCount: number;
  lexicalDensity: number;
  audienceEngagement: number;
  vector: string;
}) {
  if (!(window as any).ethereum) throw new Error('No wallet detected');

  await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = getContract(signer);

  const tx = await contract.storeDocument(
    data.title,
    data.description,
    data.resourceLocation,
    data.documentHash,
    data.tokenCount,
    data.lexicalDensity,
    data.audienceEngagement,
    data.vector
  );

  await tx.wait();
  console.log('Document stored:', tx.hash);
}
