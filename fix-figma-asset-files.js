import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, "src", "assets");

console.log(`Searching for encoded images in: ${targetDir}`);

const filesToProcess = [];

function walkDir(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory does not exist: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else {
      checkAndDecode(filePath, true);
    }
  }
}

function checkAndDecode(filePath, dryRun) {
  const ext = path.extname(filePath).toLowerCase();
  // Common image extensions
  if (![".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
    return;
  }

  try {
    const buffer = fs.readFileSync(filePath);

    // Try reading as string to detect base64
    const contentStr = buffer.toString("utf8");
    const trimmed = contentStr.trim();

    let base64Data = null;

    // Check 2: Raw Base64 with Magic Bytes signatures
    // PNG starts with 89 50 4E 47 ... -> base64: iVBORw0KGgo
    // JPG starts with FF D8 ... -> base64: /9j/
    // GIF starts with GIF89a/GIF87a -> base64: R0lGOD
    // SVG starts with <svg -> base64: PHN2Zw OR <?xml -> base64: PD94bW
    // WEBP starts with RIFF -> base64: UklGR
    if (
      trimmed.startsWith("iVBORw0KGgo") ||
      trimmed.startsWith("/9j/") ||
      trimmed.startsWith("R0lGOD") ||
      trimmed.startsWith("PHN2Zw") ||
      trimmed.startsWith("PD94bW") ||
      trimmed.startsWith("UklGR")
    ) {
      base64Data = trimmed;
    }

    if (base64Data) {
      if (dryRun) {
        filesToProcess.push({ filePath, base64Data });
      } else {
        const decodedBuffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(filePath, decodedBuffer);
        console.log(`Decoded and overwrote: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

// First pass: collect files
walkDir(targetDir);

if (filesToProcess.length === 0) {
  console.log("No base64 encoded files found.");
  process.exit(0);
}

console.log("\nFound the following base64 encoded files:");
filesToProcess.forEach((item) => console.log(` - ${item.filePath}`));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "\nDo you want to decode and overwrite these files? (y/n) ",
  (answer) => {
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
      console.log("\nProcessing files...");
      filesToProcess.forEach((item) => {
        const decodedBuffer = Buffer.from(item.base64Data, "base64");
        fs.writeFileSync(item.filePath, decodedBuffer);
        console.log(`Decoded and overwrote: ${item.filePath}`);
      });
      console.log("Done.");
    } else {
      console.log("Operation cancelled.");
    }
    rl.close();
  },
);
