import csv from "csvtojson";
import { json2csv } from "json-2-csv";
import fs from "fs";

run();

interface FormData {
  Timestamp: string;
  Name: string;
  "Joint name (if applicable)": string;
  "Any certificate bought in 2016 or 2017?": string;
  "What is the investment amount under above names (RM)?": string;
  "Scan and upload certificates": string;
  "Scan and upload Agreements": string;
  "(1) Certificate number": string;
  "(1) Plot number": string;
  "(1) Investment amount (RM)": string;
  "(1) Agreement date": string;
  "(2) Certificate number": string;
  "(2) Plot number": string;
  "(2) Investment amount (RM)": string;
  "(2) Agreement date": string;
  "(3) Certificate number": string;
  "(3) Plot number": string;
  "(3) Investment amount (RM)": string;
  "(3) Agreement date": string;
  "(4) Certificate number": string;
  "(4) Plot number": string;
  "(4) Investment amount (RM)": string;
  "(4) Agreement date": string;
  "(5) Certificate number": string;
  "(5) Plot number": string;
  "(5) Investment amount (RM)": string;
  "(5) Agreement date": string;
  "(6) Certificate number": string;
  "(6) Plot number": string;
  "(6) Investment amount (RM)": string;
  "(6) Agreement date": string;
}

interface NewFormData {
  Timestamp: string;
  Name: string;
  "Joint name (if applicable)": string;
  "Any certificate bought in 2016 or 2017?": string;
  "What is the investment amount under above names (RM)?": string;
  "Scan and upload certificates": string;
  "Scan and upload Agreements": string;
  "Certificate number": string;
  "Plot number": string;
  "Investment amount (RM)": string;
  "Agreement Date": string;
}

async function run() {
  const newData: NewFormData[] = [];
  const jsonArray: FormData[] = await csv().fromFile(
    "./raw_investment_detail_forms.csv"
  );
  for (const data of jsonArray) {
    for (let i of [1, 2, 3, 4, 5, 6]) {
      if (!["", "Nil", "N/A"].includes(data[`(${i}) Plot number`])) {
        newData.push({
          Timestamp: data.Timestamp,
          Name: data.Name,
          "Joint name (if applicable)": data["Joint name (if applicable)"],
          "Any certificate bought in 2016 or 2017?":
            data["Any certificate bought in 2016 or 2017?"],
          "What is the investment amount under above names (RM)?":
            data["What is the investment amount under above names (RM)?"],
          "Scan and upload Agreements": data["Scan and upload Agreements"],
          "Scan and upload certificates": data["Scan and upload certificates"],
          "Plot number": data[`(${i}) Plot number`],
          "Agreement Date": data[`(${i}) Agreement date`],
          "Certificate number": data[`(${i}) Certificate number`],
          "Investment amount (RM)": data[`(${i}) Investment amount (RM)`]
            .replace("RM", "", "g")
            .replace("rm", "", "g")
            .replace("Rm", "", "g")
            .replace(",", "", "g"),
        });
      }
    }
  }

  const csvString = json2csv(newData);
  void fs.writeFileSync("./output.csv", csvString);
}
