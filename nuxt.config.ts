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
      title:
        "Кто кому сколько должен — калькулятор совместных расходов | TripSplit",
      meta: [
        { charset: "utf-8" },
        { name: "language", content: "ru" },
        { "http-equiv": "content-language", content: "ru" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Посчитайте онлайн, кто кому сколько должен после совместных трат. Разделите расходы на компанию друзей — продукты, ресторан, праздник, поездку. Без регистрации, результат копируется в чат одним нажатием.",
        },

        {
          property: "og:title",
          content: "Кто кому сколько должен — калькулятор совместных расходов",
        },
        {
          property: "og:description",
          content:
            "Разделите расходы на компанию и узнайте, кто кому сколько должен. Без регистрации.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://trip-split.ru" },
        {
          property: "og:image",
          content: "https://trip-split.ru/pwa-192x192.png",
        },
      ],
      link: [
        { rel: "icon", sizes: "any", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.png" },
      ],
    },
  },

  css: ["~/assets/style/main.scss"],

  // блог обязан отдаваться статикой: prerender списка + обход ссылок на статьи
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/blog"],
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/content",
    "@vite-pwa/nuxt",
    "~/modules/yandexMetrika",
    "@nuxtjs/sitemap",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error типы vite-plugin-vuetify не совпадают с типами vite у Nuxt
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
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
      description: "Кто кому сколько должен: расчёт совместных расходов",
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

  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  site: {
    url: "https://trip-split.ru",
    name: "TripSplit — кто кому сколько должен, калькулятор совместных расходов",
  },
});
