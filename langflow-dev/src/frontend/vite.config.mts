import react from "@vitejs/plugin-react-swc";
import * as dotenv from "dotenv";
import https from "https";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import {
  API_ROUTES,
  BASENAME,
  PORT,
  PROXY_TARGET,
} from "./src/customization/config-constants";
import { environmentConfig } from "./src/config/environment";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const envLangflowResult = dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
  });

  const envLangflow = envLangflowResult.parsed || {};

  // Get config based on mode (development or production)
  const envConfig = environmentConfig[mode as keyof typeof environmentConfig] || environmentConfig.development;

  const apiRoutes = API_ROUTES || ["^/api/v1/", "^/api/v2/", "/health"];

  const target =
    env.VITE_PROXY_TARGET || PROXY_TARGET || "http://localhost:7860";

  const port = Number(env.VITE_PORT) || PORT || 3000;

  const proxyTargets = apiRoutes.reduce((proxyObj, route) => {
    proxyObj[route] = {
      target: target,
      changeOrigin: true,
      secure: false,
      ws: true,
    };
    return proxyObj;
  }, {});

  const isProduction = mode === 'production' || envConfig.VITE_FORCE_PRODUCTION_PROXY === true;
  const aipTarget = isProduction 
    ? envConfig.VITE_BACKEND_URL
    : "http://localhost:8081";

  return {
    base: BASENAME || "",
    build: {
      outDir: "build",
    },
    define: {
      "import.meta.env.BACKEND_URL": JSON.stringify(
        envLangflow.BACKEND_URL ?? "http://localhost:7860"
      ),
      "import.meta.env.VITE_BACKEND_URL": JSON.stringify(
        envConfig.VITE_BACKEND_URL
      ),
      "import.meta.env.VITE_FORCE_PRODUCTION_PROXY": JSON.stringify(
        envConfig.VITE_FORCE_PRODUCTION_PROXY.toString()
      ),
      "import.meta.env.VITE_IGNORE_SSL_CERTS": JSON.stringify(
        envConfig.VITE_IGNORE_SSL_CERTS.toString()
      ),
      "import.meta.env.VITE_PORT": JSON.stringify(
        envConfig.VITE_PORT.toString()
      ),
      "import.meta.env.ACCESS_TOKEN_EXPIRE_SECONDS": JSON.stringify(
        envLangflow.ACCESS_TOKEN_EXPIRE_SECONDS ?? 60
      ),
      "import.meta.env.CI": JSON.stringify(envLangflow.CI ?? false),
      "import.meta.env.LANGFLOW_AUTO_LOGIN": JSON.stringify(
        envLangflow.LANGFLOW_AUTO_LOGIN ?? true
      ),
      "import.meta.env.LANGFLOW_MCP_COMPOSER_ENABLED": JSON.stringify(
        envLangflow.LANGFLOW_MCP_COMPOSER_ENABLED ?? "true"
      ),
    },
    plugins: [react(), svgr(), tsconfigPaths()],
    server: {
      port: port,
      proxy: {
        "/api/aip/": {
          target: aipTarget,
          changeOrigin: true,
          secure: isProduction && !envConfig.VITE_IGNORE_SSL_CERTS,
          ws: true,
          configure: (proxy, options) => {
            if (envConfig.VITE_IGNORE_SSL_CERTS && aipTarget.startsWith('https://')) {
              options.agent = new https.Agent({
                rejectUnauthorized: false,
                keepAlive: true
              });
            }
          },
        },        
        ...proxyTargets,
      },
    },
  };
});
