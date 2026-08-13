// ===========================================
// Environment Preloader
// Must be imported FIRST before any other module
// ===========================================
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

try {
  if (typeof import.meta.url === "string" && import.meta.url.startsWith("file:")) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = resolve(__dirname, "..", "..", "..", ".env");
    config({ path: envPath });
  } else {
    config();
  }
} catch (e) {
  // In serverless environments (Vercel), environment variables are provided via process.env directly
}
