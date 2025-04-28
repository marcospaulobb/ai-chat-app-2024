import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  // Define o modelo padrão como GPT 4.1
  env.VITE_OPENAI_MODEL = "gpt-4.1";
  
  return {
    plugins: [react()],
    server: {
      port: 8080,
      host: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env": env,
    },
    assetsInclude: ["**/*.txt"],
  };
});
