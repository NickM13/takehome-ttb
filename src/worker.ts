import { httpServerHandler } from "cloudflare:node";
import { createConfiguredApp } from "./runtime.js";

const WORKER_PORT = 3000;
const { app } = createConfiguredApp({ serveStaticAssets: false });

app.listen(WORKER_PORT);

export default httpServerHandler({ port: WORKER_PORT });
