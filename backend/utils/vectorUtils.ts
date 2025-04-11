/**
 * @fileoverview Handles the generation and management of document vectors for similarity matching
 */

// @ts-ignore: Required to allow use within seed.ts
import cosineSimilarity from "cosine-similarity";

/**
 * Creates embedding vectors from document text to enable similarity-based matching.
 * Uses the MiniLM model to generate vectors that capture semantic meaning.
 *
 * @param documentText - The document text to be vectorised
 * @returns A JSON string containing the document vector for storage
 */
export async function generateDocumentVector(
  documentText: string
): Promise<string> {
  try {
    const transformers = await import("@xenova/transformers"); // Dynamic import for Node.js
    const { pipeline, env } = transformers;

    // Config. env. for Node.js
    env.useBrowserCache = false;
    env.allowLocalModels = true;
    env.cacheDir = "./models-cache";

    // Load the model
    const encoder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    // Generate vector for document
    const documentVector = (
      await encoder(documentText, { pooling: "mean", normalize: true })
    ).data;

    return JSON.stringify(documentVector);
  } catch (error) {
    console.error("Failed to generate document vector:", error);
    throw error;
  }
}

/**
 * Calculates similarity between two documents.
 *
 * @param document1Vector - First document's embedding vector
 * @param document2Vector - Second document's embedding vector
 * @returns Score between 0-1 indicating similarity strength
 */
export function calculateDocumentSimilarity(
  document1Vector: number[],
  document2Vector: number[]
): number {
  // Calculate cosine similarity between the document vectors
  return cosineSimilarity(document1Vector, document2Vector);
}
