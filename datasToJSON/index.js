import path from "path";
import { fileURLToPath } from "url";
import { convertMetroToJSON } from "./JSONConverter.js";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// files to convert
const METROFILENAME = "metro.txt";
const POSITIONSFILENAME = "pospoints.txt";
const OUTPUT_FILENAME = "metro.json";

// construct absolute paths
const metro = path.join(__dirname, METROFILENAME);
const outputFilePath = path.join(__dirname, OUTPUT_FILENAME);
const positions = path.join(__dirname, POSITIONSFILENAME);

// convert the file
convertMetroToJSON(metro, positions, outputFilePath);

console.log(`File converted and saved to ${outputFilePath}`);