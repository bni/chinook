import "dotenv/config";
import PDFParser from "pdf2json";
import fs from "fs";

const writeFile = (content) => {
  fs.writeFileSync("./data/sample.json", JSON.stringify(content, null, 2));
};

const extract = async () => {
  const pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataReady", writeFile);

  await pdfParser.loadPDF("./data/sample.pdf");
}

await extract();
