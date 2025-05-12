import fs from "fs";
import path from "path";
import { exec } from "child_process";
import Tesseract from "tesseract.js";

// Example Usage
const pdfPath = "certificates-1.pdf"; // Your scanned PDF file
const outputFolder = "./output/certificates-1"; // Folder to store images

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);
processScannedPdf(pdfPath, outputFolder);

async function processScannedPdf(pdfPath, outputFolder) {
  try {
    console.log("Converting PDF to images...");
    const imagePaths = await pdfToImages(pdfPath, outputFolder);
    // const imagePaths: string[] = [];
    // const files = fs.readdirSync(outputFolder);
    // for (const [_i, file] of files.entries()) {
    //   const filePath = path.join(outputFolder, file);
    //   imagePaths.push(filePath);
    // }

    // console.log("Extracting text from images...");
    // const extractedText = await extractTextFromImages(imagePaths);

    // console.log("Final Extracted Text:\n", extractedText);

    // Optional: Save output to a text file
    // fs.writeFileSync(path.join(outputFolder, "output.txt"), extractedText);

    // return extractedText;
  } catch (error) {
    console.error("Error processing PDF:", error);
  }
}

async function extractTextFromImages(imagePaths) {
  let extractedText = "";

  const worker = await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
  });
  for (const imagePath of imagePaths) {
    console.log(`Processing: ${imagePath}`);
    const { data } = await worker.recognize(imagePath);
    console.log(data);
  }

  return extractedText;
}

async function pdfToImages(pdfPath, outputFolder) {
  const outputBase = path.join(outputFolder, "page");
  const popplerOptions = {
    format: "png",
    out_dir: outputFolder,
    out_prefix: "page",
    dpi: 300, // High-quality output
  };

  return new Promise((resolve, reject) => {
    const command = `pdftoppm -png -r ${popplerOptions.dpi} "${pdfPath}" "${outputBase}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error converting PDF: ${stderr}`);
      } else {
        // List all PNG files generated
        fs.readdir(outputFolder, (err, files) => {
          if (err) reject(err);
          const imageFiles = files.filter(
            (f) => f.startsWith("page") && f.endsWith(".png")
          );
          resolve(imageFiles.map((f) => path.join(outputFolder, f)));
        });
      }
    });
  });
}
