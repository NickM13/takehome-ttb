declare module "cloudflare:node" {
  interface HttpServerHandlerOptions {
    port: number;
  }

  export function httpServerHandler(options: HttpServerHandlerOptions): unknown;
}
