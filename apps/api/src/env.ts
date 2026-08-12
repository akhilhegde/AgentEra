// ===========================================
// Environment Preloader
// Must be imported FIRST before any other module
// ===========================================
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

let currentDir = "";
try {
  // @ts-ignore
  currentDir = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
} catch {
  currentDir = process.cwd();
}
const envPath = resolve(currentDir, "..", "..", "..", ".env");
const result = config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Could not load .env from ${envPath}:`, result.error.message);
} else {
  console.log(`✅ Loaded .env from ${envPath}`);
}
