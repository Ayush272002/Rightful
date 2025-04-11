import { getContract } from './rightful';

export async function getDocument(documentHash: number, index: number) {
  const contract = getContract();
  const doc = await contract.getDocument(documentHash, index);
  return doc;
}
