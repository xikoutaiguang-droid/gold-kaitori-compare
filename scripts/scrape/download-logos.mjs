// 各社のfaviconをGoogleのfaviconサービス経由で取得し、public/logos/配下にローカル保存する。
// 実行時に外部サービスへ依存させず、アプリからはローカルファイルを参照できるようにするため。
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCompanies } from "./lib/store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../public/logos");

async function main() {
  const companies = await loadCompanies();
  await mkdir(OUT_DIR, { recursive: true });

  for (const company of companies) {
    const domain = new URL(company.officialUrl).hostname;
    const url = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(path.join(OUT_DIR, `${company.id}.png`), buf);
      console.log(`[OK] ${company.id} (${domain}) -> ${buf.length}bytes`);
    } catch (err) {
      console.error(`[NG] ${company.id} (${domain}): ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

main();
