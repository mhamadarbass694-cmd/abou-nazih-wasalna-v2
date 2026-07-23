import type { Config } from "@react-router/dev/config";

export default {
  future: {
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
  allowedActionOrigins: [
    "https://extensions.shopifycdn.com",
    "https://admin.shopify.com",
    "*.trycloudflare.com",
  ],
} satisfies Config;