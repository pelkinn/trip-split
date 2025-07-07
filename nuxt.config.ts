// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },
  srcDir: "./src/",

  runtimeConfig: {
    public: {
      yandexMetrika: {
        id: 103233734,
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "ru" },
      title: "TripSplit",
      meta: [
        { charset: "utf-8" },
        { name: "language", content: "ru" },
        { "http-equiv": "content-language", content: "ru" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        // { name: 'yandex-verification', content: '131d5a2f63496c80' },
        // { name: 'google-site-verification', content: 'V1sd-BGehuD9veqlhBvVU80mPIIaq4b9-sw9AI4W71w' },
        {
          name: "description",
          content: "TripSplit - калькулятор рассчета долгов",
        },
      ],
      link: [
        { rel: "icon", sizes: "any", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.png" },
      ],
    },
  },

  css: ["~/assets/style/main.scss"],

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "@nuxt/eslint",
    "@vite-pwa/nuxt",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "~/modules/yandexMetrika",
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  pwa: {
    registerType: "autoUpdate",
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      navigateFallback: null,
    },
    manifest: {
      name: "TripSplit",
      short_name: "TripSplit",
      description: "Рассчет долгов при совместных тратах",
      lang: "ru",
      theme_color: "#e0f7fa",
      background_color: "#e0f7fa",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  },
});
