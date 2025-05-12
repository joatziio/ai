import * as dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";
import path from "path";

dotenv.config();
const client = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });
const outputFolder = "./output2";

const files = fs.readdirSync(outputFolder);
for (const [_i, file] of files.entries()) {
  const filePath = path.join(outputFolder, file);
  const data = fs.readFileSync(filePath);
  const base64Image = data.toString("base64");

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: `data:image/png;base64,${base64Image}`,
            detail: "high",
          },
          {
            type: "input_text",
            text:`
              You are given a scanned table with partially obstructed first and last columns — skip those columns entirely.
              First, visually segment the table into clean rows and columns based on spacing, lines, or structure. Assume consistent row and column alignment wherever possible. Then, extract the data cell by cell, excluding the first and last columns.

              Formatting rules:
              - Output in valid CSV format.
              - Each value must be enclosed in double quotes to preserve commas and special characters.
              - Use commas as column separators.
              - Do not return any extra explanation, markdown, or notes — only the raw CSV content.

              Instructions recap:
              - Visually break the table into rows and columns.
              - Discard the first and last column in each row.
              - Wrap each value in double quotes.
              - Output as CSV.
            `
            // text: `Extract the table into CSV format, skipping the first and last columns as they are partially obstructed. The first visible row (after skipping) is the header.
            //       Important formatting rules:
            //       - Wrap every value in double quotes, even if it doesn't contain commas.
            //       - Use commas as column separators.
            //       - Do not include the first or last columns in the output.
            //       - Return only the CSV output (no explanations, no markdown formatting).`,
          },
        ],
      },
    ],
  });
  console.log(response.output_text);
}
