import express from "express";
import cors from "cors";
import multer from "multer";
import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { FleschKincaidGradeLevel } from "text-readability";
import { pipeline } from "@xenova/sentence-transformers";

const app = express();
const upload = multer({ dest: "uploads/" });
const port = 8000;

app.use(cors());
app.use(express.json());

// Helper functions
const countTokens = (text: string) => text.split(/\s+/).length;
const lexicalDensity = (text: string) => {
  const words = text.split(/\s+/);
  const contentWords = words.filter(word => word.match(/[a-zA-Z]/));
  return contentWords.length / words.length;
};

app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const dataBuffer = req.file.buffer;
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // Compute linguistic features
    const tokenCount = countTokens(text);
    const density = lexicalDensity(text);
    const readability = FleschKincaidGradeLevel(text);

    // Load SBERT embedding model
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const embedding = await embedder(text, { pooling: "mean" });

    res.json({ tokenCount, lexicalDensity: density, readability, embedding });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing PDF");
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
