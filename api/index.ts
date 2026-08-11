import { handle } from "hono/vercel";
import app from "../apps/api/src/index.js";

export default handle(app);
