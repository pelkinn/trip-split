// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },
  srcDir: "./src/",

  app: {
    head: {
      link: [
        { rel: "icon", sizes: "any", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.png" },
      ],
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    "@nuxt/eslint",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    //...
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
});
