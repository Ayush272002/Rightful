/**
 * @fileoverview Utilities for processing PDF content specifically
 */

import pdfParse from "pdf-parse";
/**
 * Extracts text content from a PDF buffer
 *
 * @param pdfBuffer - Buffer containing PDF data
 * @returns Promise resolving to the extracted text
 */
export async function extractPDFText(pdfBuffer: Buffer): Promise<string> {
  const data = await pdfParse(pdfBuffer);
  return data.text;
}
