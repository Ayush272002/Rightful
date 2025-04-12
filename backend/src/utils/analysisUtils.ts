/**
 * @fileoverview Utilities for analysing text content including token counting,
 * lexical density, and readability.
 */

import { createHash } from "./miscUtils";
import { extractPDFText } from "./pdfUtils";
import { generateDocumentVector } from "./vectorUtils";
import rs from "text-readability";

/**
 * Interface for document processing results
 */
export interface DocumentProcessingResult extends TextAnalysis {
  documentHash: string;
}

/**
 * Interface for text analysis results
 */
export interface TextAnalysis {
  tokenCount: number;
  lexicalDensity: number;
  readability: number;
  embedding: number[];
}

/**
 * Calculate lexical density - ratio of content words to total words
 *
 * @param text - The text to analyse
 * @returns Value between 0-1 representing lexical density
 */
export function calculateLexicalDensity(text: string): number {
  const words = text.split(/\s+/);
  const contentWords = words.filter((word) => word.match(/[a-zA-Z]/));
  return contentWords.length / words.length;
}

/**
 * Count tokens in text (words separated by whitespace)
 *
 * @param text - The text to analyse
 * @returns Number of tokens
 */
export function countTokens(text: string): number {
  return text.split(/\s+/).length;
}

/**
 * Analyses text content to compute various linguistic features
 *
 * @param text - The text content to analyse
 * @returns Object containing token count, lexical density, and readability score
 */
export function analyseTextContent(
  text: string
): Pick<TextAnalysis, "tokenCount" | "lexicalDensity" | "readability"> {
  const tokenCount = countTokens(text);
  const lexicalDensity = calculateLexicalDensity(text);
  const readability = rs.fleschKincaidGrade(text);

  return {
    tokenCount,
    lexicalDensity,
    readability,
  };
}

/**
 * Generates a vector embedding for the given text
 *
 * @param text - The text content to generate embedding for
 * @returns Promise resolving to an array of numbers representing the embedding
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  const embeddingJson = await generateDocumentVector(text);
  return JSON.parse(embeddingJson);
}

/**
 * Performs complete text analysis including linguistic features and embedding
 *
 * @param text - The text content to analyse
 * @returns Promise resolving to complete text analysis results
 */
export async function analyseText(text: string): Promise<TextAnalysis> {
  const linguisticAnalysis = analyseTextContent(text);
  const embedding = await generateTextEmbedding(text);

  return {
    ...linguisticAnalysis,
    embedding,
  };
}

/**
 * Process a document buffer and return text statistics and embedding
 *
 * @param buffer - Buffer containing document data
 * @param mimeType - MIME type of the document
 * @returns Text statistics, embedding, and content hash
 */
export async function processDocument(
  buffer: Buffer,
  mimeType: string
): Promise<DocumentProcessingResult> {
  try {
    // Extract text based on document type
    let text: string;
    if (mimeType === "application/pdf") {
      text = await extractPDFText(buffer);
    } else if (mimeType === "text/plain") {
      text = buffer.toString("utf-8");
    } else {
      throw new Error(`Unsupported mime type: ${mimeType}`);
    }

    // Analyse the text content
    const analysis = await analyseText(text);

    // Get the hash of the document content
    const documentHash = createHash(buffer.toString("utf-8"), 64);

    return {
      ...analysis,
      documentHash,
    };
  } catch (error) {
    console.error("Document processing error:", error);
    throw error;
  }
}
