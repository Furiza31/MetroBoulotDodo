import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { convertMetroToJSON } from "./JSONConverter.js";
import { checkConnexity } from "./checkConnexity.js";
import { converttomatrix } from "./converttomatrix.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METROFILENAME = "metro.txt";
const POSITIONSFILENAME = "pospoints.txt";
const OUTPUT_FILENAME = "metro.json";

const metro = path.join(__dirname, METROFILENAME);
let outputFilePath = path.join(__dirname, OUTPUT_FILENAME);
const positions = path.join(__dirname, POSITIONSFILENAME);

const graph = convertMetroToJSON(metro, positions, outputFilePath);
console.log(graph);
const matrix = converttomatrix(graph);
console.log(matrix);

const status = checkConnexity(matrix);

const ensureDirectoryExists = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
};

if (status) {
  console.log("Graph is connected:", status);

  const outputFilePath = path.join(__dirname, "./../app/public/metro.json");

  try {
    ensureDirectoryExists(outputFilePath);

    fs.writeFileSync(outputFilePath, JSON.stringify(graph, null, 2));
    console.log("File successfully written to:", outputFilePath);
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
} else {
  console.log("The graph is not connected");
}

console.log(`File converted and saved to ${outputFilePath}`);
