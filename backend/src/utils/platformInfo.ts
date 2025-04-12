/**
 * @fileoverview Defines core platform information and features for Rightful's IP protection system.
 * Used by AI agents to provide accurate responses about platform capabilities.
 */

// Core platform configuration and feature definitions
export const PLATFORM_INFO = {
  name: "Rightful", // Platform name used across the application
  description:
    "An AI-powered platform for protecting intellectual property through blockchain technology",
  features: [
    {
      name: "Document Registration",
      description:
        "Securely register and safeguard your original documents on the blockchain",
      details:
        "Upload documents to create immutable records of your intellectual property",
    },
    {
      name: "Similarity Detection",
      description:
        "AI-powered analysis to detect similar documents and potential infringements",
      details:
        "Our system compares your documents against a database to identify potential matches",
    },
    {
      name: "Google Docs Integration",
      description:
        "Seamlessly connect your Google Docs for automatic monitoring",
      details:
        "Link your Google Docs account to automatically track changes and detect similarities",
    },
    {
      name: "Plagiarism Checking",
      description: "Analyse your work for originality and potential plagiarism",
      details:
        "Get detailed reports on document similarity and potential copyright issues",
    },
  ],
  workflow: [
    {
      step: 1,
      title: "Upload Document",
      description:
        "Upload your document to the blockchain and provide basic information",
    },
    {
      step: 2,
      title: "AI Analysis",
      description:
        "Our AI extracts text and calculates vector representation for similarity comparison",
    },
    {
      step: 3,
      title: "View Results",
      description:
        "See similar documents with percentage match and links to the original sources",
    },
  ],
  supportedFileTypes: ["PDF", "TXT"],
  blockchain: {
    network: "Sepolia Testnet",
    benefits: [
      "Immutable record of your intellectual property",
      "Timestamped proof of creation",
      "Transparent ownership tracking",
      "Decentralised storage",
    ],
  },
};

/**
 * Formats platform information for consumption by AI agents
 * @returns {string} JSON string of platform info with proper formatting
 */
export function getPlatformInfoForAgents(): string {
  return JSON.stringify(PLATFORM_INFO, null, 2);
}
