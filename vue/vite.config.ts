import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag) => ['idlive-face-capture'].includes(tag),
            }
        }
    })],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        proxy: {
            '/idld_api': {
                target: 'http://0.0.0.0:8080/',  // Your API server
                changeOrigin: true,               // Handles the origin change
                rewrite: (path) => path.replace(/^\/idld_api/, ''),  // Optional: Remove '/api' from the path
            },
            '/iad_api': {
                target: 'http://0.0.0.0:8081/',  // Your API server
                changeOrigin: true,               // Handles the origin change
                rewrite: (path) => path.replace(/^\/iad_api/, ''),  // Optional: Remove '/api' from the path
            },
        },
    },
});
