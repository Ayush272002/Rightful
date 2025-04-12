import { getDocumentHashes as getHashes } from "./utils/getDocumentHashes";
import { getDocumentsByHash as getDocsByHash } from "./utils/getDocument";
import { Document } from "./types";

// Re-export the functions with the expected interface
export async function getDocumentHashes(): Promise<string[]> {
  return getHashes();
}

export async function getDocumentsByHash(hash: string): Promise<Document[]> {
  const documents = await getDocsByHash(hash);
  return documents.map((doc) => ({
    hash: doc.documentHash,
    vector: doc.vector,
    content: doc.resourceLocation,
    metadata: JSON.stringify({
      title: doc.title,
      description: doc.description,
      tokenCount: doc.tokenCount,
      lexicalDensity: doc.lexicalDensity,
      audienceEngagement: doc.audienceEngagement,
      submitterAddress: doc.submitterAddress,
      submissionTimestamp: doc.submissionTimestamp,
      documentHash: doc.documentHash,
    }),
  }));
}
