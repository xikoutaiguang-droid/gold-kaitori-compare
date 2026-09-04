import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeReferenceRate } from "./sources/tanaka.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "../../data/referenceRate.json");

async function main() {
  const raw = JSON.parse(await readFile(DATA_PATH, "utf-8"));
  const { prices, updatedAt } = await scrapeReferenceRate();
  raw.prices = { ...raw.prices, ...prices };
  raw.updatedAt = updatedAt;
  await writeFile(DATA_PATH, JSON.stringify(raw, null, 2) + "\n", "utf-8");
  console.log(`[OK] 田中貴金属 K24: ${prices.k24}円 (${updatedAt})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
