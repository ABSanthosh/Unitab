import path from "path";
import { defineConfig } from "wxt";
import autoprefixer from "autoprefixer";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-svelte"],
  vite: () => ({
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },
    resolve: {
      alias: {
        // $stores: path.resolve("./src/utils/stores/*"),
      },
    },
  }),

  manifest: {
    name: "Unitab",
    description: "A simple new tab page",
    version: "1.0.0",
    manifest_version: 3,
    permissions: ["bookmarks", "storage", "tabs", "activeTab"],
    host_permissions: [
      "http://fonts.googleapis.com/",
      "https://fonts.googleapis.com/",
      "*://*/*",
    ],
  },
});
