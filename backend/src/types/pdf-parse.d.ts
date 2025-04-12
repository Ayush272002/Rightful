declare module "pdf-parse" {
  interface PDFData {
    text: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
  export default pdfParse;
}
