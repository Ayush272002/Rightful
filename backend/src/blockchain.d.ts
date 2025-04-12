import { Document } from "./types";

export function getDocumentHashes(): Promise<string[]>;
export function getDocumentsByHash(hash: string): Promise<Document[]>;
