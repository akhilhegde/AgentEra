// ===========================================
// Environment Preloader
// Must be imported FIRST before any other module
// ===========================================
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "..", "..", "..", ".env");
const result = config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Could not load .env from ${envPath}:`, result.error.message);
} else {
  console.log(`✅ Loaded .env from ${envPath}`);
}
