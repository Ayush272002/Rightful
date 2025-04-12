import { getContract } from "./rightful";

type DocumentData = {
  title: string,
  description: string,
  resourceLocation: string,
  documentHash: string,
  tokenCount: number,
  lexicalDensity: number,
  audienceEngagement: number,
  submitterAddress: string,
  submissionTimestamp: Date,
  vector: string
} 

export async function getDocument(documentHash: string, index: number): Promise<DocumentData> {
  const contract = getContract();
  const doc = await contract.getDocument(documentHash, index);
  return {
    title: doc.title,
    description: doc.description,
    resourceLocation: doc.resourceLocation,
    documentHash: doc.documentHash,
    tokenCount: parseInt(doc.tokenCount),
    lexicalDensity: parseInt(doc.lexicalDensity) / 1000000,
    audienceEngagement: parseInt(doc.audienceEngagement) / 1000000,
    submitterAddress: doc.submitterAddress,
    submissionTimestamp: new Date(parseInt(doc.submissionTimestamp) * 1000),
    vector: doc.vector
  };
}
