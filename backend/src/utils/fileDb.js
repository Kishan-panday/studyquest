import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.join(__dirname, "../../data/db.json");

export async function readDb() {
  const file = await fs.readFile(databasePath, "utf-8");
  return JSON.parse(file);
}

export async function writeDb(data) {
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2));
}
